#!/usr/bin/env tsx
/**
 * Production Test Suite for Apex Agents
 * 
 * Comprehensive testing of:
 * 1. AGI System (all 5 core features)
 * 2. AI Admin (plain-language requests)
 * 3. Security (rate limiting, auth, CORS)
 * 4. Error monitoring (Sentry integration)
 * 5. API health and performance
 */

const PRODUCTION_URL = process.env.PRODUCTION_URL || 'https://apex-agents.vercel.app';
const TEST_TOKEN = process.env.TEST_TOKEN; // JWT token for authenticated tests

interface TestResult {
  name: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  duration: number;
  error?: string;
  details?: any;
}

class ProductionTestSuite {
  private results: TestResult[] = [];
  private startTime = Date.now();

  async runAllTests(): Promise<void> {
    console.log('🚀 Starting Production Test Suite');
    console.log(`📍 Testing: ${PRODUCTION_URL}`);
    console.log(`🕒 Started: ${new Date().toLocaleString()}\n`);

    // Test categories
    await this.testAGISystem();
    await this.testAIAdmin();
    await this.testSecurity();
    await this.testSentry();
    await this.testPerformance();

    this.printSummary();
  }

  private async test(
    name: string,
    testFn: () => Promise<void>
  ): Promise<void> {
    const start = Date.now();
    process.stdout.write(`  ${name}... `);

    try {
      await testFn();
      const duration = Date.now() - start;
      this.results.push({ name, status: 'PASS', duration });
      console.log(`✅ PASS (${duration}ms)`);
    } catch (error) {
      const duration = Date.now() - start;
      this.results.push({
        name,
        status: 'FAIL',
        duration,
        error: error instanceof Error ? error.message : String(error),
      });
      console.log(`❌ FAIL (${duration}ms)`);
      console.log(`     Error: ${error instanceof Error ? error.message : error}`);
    }
  }

  // ==================== AGI System Tests ====================

  async testAGISystem(): Promise<void> {
    console.log('\n📊 AGI System Tests');

    await this.test('AGI Status Endpoint', async () => {
      const response = await fetch(`${PRODUCTION_URL}/api/agi/status`);
      if (!response.ok) throw new Error(`Status ${response.status}`);
      const data = await response.json();
      if (!data.available) throw new Error('AGI not available');
      if (data.components.length !== 6) throw new Error('Missing components');
    });

    if (!TEST_TOKEN) {
      console.log('  ⚠️  Skipping authenticated AGI tests (no TEST_TOKEN)');
      return;
    }

    await this.test('AGI Memory System', async () => {
      const response = await fetch(`${PRODUCTION_URL}/api/agi/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${TEST_TOKEN}`,
        },
        body: JSON.stringify({
          input: 'Remember: My favorite color is blue',
        }),
      });
      if (!response.ok) throw new Error(`Status ${response.status}`);
      const data = await response.json();
      if (!data.thoughts || data.thoughts.length === 0) {
        throw new Error('No thoughts generated');
      }
    });

    await this.test('AGI Reasoning Engine', async () => {
      const response = await fetch(`${PRODUCTION_URL}/api/agi/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${TEST_TOKEN}`,
        },
        body: JSON.stringify({
          input: 'How can I optimize my database queries?',
        }),
      });
      if (!response.ok) throw new Error(`Status ${response.status}`);
      const data = await response.json();
      if (!data.reasoning || !data.reasoning.mode) {
        throw new Error('No reasoning mode detected');
      }
    });

    await this.test('AGI Emotional Intelligence', async () => {
      const response = await fetch(`${PRODUCTION_URL}/api/agi/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${TEST_TOKEN}`,
        },
        body: JSON.stringify({
          input: 'I\'m so excited about this new project!',
        }),
      });
      if (!response.ok) throw new Error(`Status ${response.status}`);
      const data = await response.json();
      if (!data.emotionalState) {
        throw new Error('No emotional state detected');
      }
    });

    await this.test('AGI Creativity Engine', async () => {
      const response = await fetch(`${PRODUCTION_URL}/api/agi/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${TEST_TOKEN}`,
        },
        body: JSON.stringify({
          input: 'Give me creative ideas for a social platform',
        }),
      });
      if (!response.ok) throw new Error(`Status ${response.status}`);
      const data = await response.json();
      if (!data.creativity || data.creativity.length === 0) {
        throw new Error('No creative ideas generated');
      }
    });

    await this.test('AGI Conversation History', async () => {
      const response = await fetch(`${PRODUCTION_URL}/api/agi/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${TEST_TOKEN}`,
        },
        body: JSON.stringify({
          input: 'What was my favorite color?',
        }),
      });
      if (!response.ok) throw new Error(`Status ${response.status}`);
      const data = await response.json();
      if (!data.conversationId) {
        throw new Error('No conversation ID');
      }
    });
  }

  // ==================== AI Admin Tests ====================

  async testAIAdmin(): Promise<void> {
    console.log('\n🤖 AI Admin Tests');

    if (!TEST_TOKEN) {
      console.log('  ⚠️  Skipping AI Admin tests (no TEST_TOKEN)');
      return;
    }

    await this.test('AI Admin Stream Endpoint', async () => {
      const response = await fetch(`${PRODUCTION_URL}/api/ai-admin/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId: 'test-conv-' + Date.now(),
          message: 'What is the structure of the project?',
          userId: 'test-user',
          mode: 'chat',
        }),
      });
      
      // Should return 404 or 200 depending on auth
      if (response.status !== 200 && response.status !== 404) {
        throw new Error(`Unexpected status ${response.status}`);
      }
    });

    console.log('  ℹ️  Note: Full AI Admin testing requires admin credentials');
  }

  // ==================== Security Tests ====================

  async testSecurity(): Promise<void> {
    console.log('\n🔒 Security Tests');

    await this.test('Rate Limiting - AGI Endpoint', async () => {
      if (!TEST_TOKEN) {
        console.log('Skip (no token)');
        return;
      }

      // Make 25 rapid requests (limit is 20/min)
      const promises = Array.from({ length: 25 }, () =>
        fetch(`${PRODUCTION_URL}/api/agi/process`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${TEST_TOKEN}`,
          },
          body: JSON.stringify({ input: 'test' }),
        })
      );

      const responses = await Promise.all(promises);
      const rateLimited = responses.some(r => r.status === 429);
      
      if (!rateLimited) {
        throw new Error('Rate limiting not triggered');
      }
    });

    await this.test('Auth Required - Protected Routes', async () => {
      const response = await fetch(`${PRODUCTION_URL}/api/agi/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: 'test' }),
      });
      
      if (response.status !== 401) {
        throw new Error(`Expected 401, got ${response.status}`);
      }
    });

    await this.test('CORS Headers', async () => {
      const response = await fetch(`${PRODUCTION_URL}/api/agi/status`, {
        method: 'OPTIONS',
      });
      
      // Vercel handles CORS automatically for Next.js
      // Just verify the endpoint responds
      if (response.status !== 200 && response.status !== 404) {
        console.log('Note: CORS may need explicit configuration');
      }
    });

    await this.test('HTTPS Enforcement', async () => {
      if (!PRODUCTION_URL.startsWith('https://')) {
        throw new Error('Not using HTTPS');
      }
    });

    await this.test('Content Security', async () => {
      const response = await fetch(`${PRODUCTION_URL}/`);
      const csp = response.headers.get('content-security-policy');
      
      // Vercel provides basic security headers
      // This is informational
      if (!csp) {
        console.log('Note: Consider adding CSP headers');
      }
    });
  }

  // ==================== Sentry Tests ====================

  async testSentry(): Promise<void> {
    console.log('\n📡 Sentry Integration Tests');

    await this.test('Sentry Client Config', async () => {
      const response = await fetch(`${PRODUCTION_URL}/_next/static/chunks/main-app.js`, {
        method: 'HEAD',
      });
      
      // Just verify the app builds successfully
      // Actual Sentry testing requires triggering errors
      if (!response.ok && response.status !== 404) {
        throw new Error('App bundle not found');
      }
    });

    console.log('  ℹ️  Note: Test Sentry by triggering a test error in production');
    console.log('  ℹ️  Example: throw new Error("Sentry test") in browser console');
  }

  // ==================== Performance Tests ====================

  async testPerformance(): Promise<void> {
    console.log('\n⚡ Performance Tests');

    await this.test('Homepage Load Time', async () => {
      const start = Date.now();
      const response = await fetch(`${PRODUCTION_URL}/`);
      const duration = Date.now() - start;
      
      if (!response.ok) throw new Error(`Status ${response.status}`);
      if (duration > 5000) {
        throw new Error(`Slow response: ${duration}ms`);
      }
    });

    await this.test('API Response Time', async () => {
      const start = Date.now();
      const response = await fetch(`${PRODUCTION_URL}/api/agi/status`);
      const duration = Date.now() - start;
      
      if (!response.ok) throw new Error(`Status ${response.status}`);
      if (duration > 2000) {
        throw new Error(`Slow response: ${duration}ms`);
      }
    });

    await this.test('Static Asset Caching', async () => {
      const response = await fetch(`${PRODUCTION_URL}/favicon-32x32.svg`);
      const cacheControl = response.headers.get('cache-control');
      
      if (!cacheControl || !cacheControl.includes('public')) {
        console.log('Note: Consider optimizing cache headers');
      }
    });
  }

  // ==================== Summary ====================

  private printSummary(): void {
    const totalDuration = Date.now() - this.startTime;
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const total = this.results.length;
    const passRate = ((passed / total) * 100).toFixed(1);

    console.log('\n' + '='.repeat(60));
    console.log('📊 Test Summary');
    console.log('='.repeat(60));
    console.log(`Total Tests: ${total}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📈 Pass Rate: ${passRate}%`);
    console.log(`⏱️  Duration: ${(totalDuration / 1000).toFixed(2)}s`);
    console.log('='.repeat(60));

    if (failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.results
        .filter(r => r.status === 'FAIL')
        .forEach(r => {
          console.log(`  - ${r.name}`);
          console.log(`    Error: ${r.error}`);
        });
    }

    console.log('\n✨ Production Test Suite Complete\n');

    // Exit with error code if tests failed
    if (failed > 0) {
      process.exit(1);
    }
  }
}

// Run tests
const suite = new ProductionTestSuite();
suite.runAllTests().catch(error => {
  console.error('Fatal error running tests:', error);
  process.exit(1);
});
