/**
 * Comprehensive Stress Test Suite for Apex Agents
 * 
 * Tests system performance under load:
 * - API endpoint stress testing
 * - Database connection pooling
 * - Concurrent request handling
 * - Memory usage monitoring
 * - Error rate tracking
 */

import { performance } from 'perf_hooks';

interface StressTestResult {
  testName: string;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  requestsPerSecond: number;
  errors: string[];
  duration: number;
}

interface StressTestConfig {
  baseUrl: string;
  concurrentUsers: number;
  requestsPerUser: number;
  timeout: number;
}

class StressTestRunner {
  private config: StressTestConfig;
  private results: StressTestResult[] = [];

  constructor(config: StressTestConfig) {
    this.config = config;
  }

  /**
   * Run a stress test on an endpoint
   */
  async testEndpoint(
    name: string,
    endpoint: string,
    method: 'GET' | 'POST' = 'GET',
    body?: any,
    headers?: Record<string, string>
  ): Promise<StressTestResult> {
    console.log(`\n🔥 Starting stress test: ${name}`);
    console.log(`   Concurrent users: ${this.config.concurrentUsers}`);
    console.log(`   Requests per user: ${this.config.requestsPerUser}`);
    console.log(`   Total requests: ${this.config.concurrentUsers * this.config.requestsPerUser}`);

    const startTime = performance.now();
    const responseTimes: number[] = [];
    const errors: string[] = [];
    let successCount = 0;
    let failCount = 0;

    // Create concurrent user promises
    const userPromises = Array.from({ length: this.config.concurrentUsers }, async (_, userIndex) => {
      for (let i = 0; i < this.config.requestsPerUser; i++) {
        const requestStart = performance.now();
        
        try {
          const response = await fetch(`${this.config.baseUrl}${endpoint}`, {
            method,
            headers: {
              'Content-Type': 'application/json',
              ...headers,
            },
            body: body ? JSON.stringify(body) : undefined,
            signal: AbortSignal.timeout(this.config.timeout),
          });

          const requestEnd = performance.now();
          const responseTime = requestEnd - requestStart;
          responseTimes.push(responseTime);

          if (response.ok) {
            successCount++;
          } else {
            failCount++;
            errors.push(`HTTP ${response.status}: ${response.statusText}`);
          }
        } catch (error: any) {
          failCount++;
          const requestEnd = performance.now();
          responseTimes.push(requestEnd - requestStart);
          errors.push(error.message || 'Unknown error');
        }
      }
    });

    // Wait for all requests to complete
    await Promise.all(userPromises);

    const endTime = performance.now();
    const duration = (endTime - startTime) / 1000; // Convert to seconds

    const result: StressTestResult = {
      testName: name,
      totalRequests: this.config.concurrentUsers * this.config.requestsPerUser,
      successfulRequests: successCount,
      failedRequests: failCount,
      averageResponseTime: responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length,
      minResponseTime: Math.min(...responseTimes),
      maxResponseTime: Math.max(...responseTimes),
      requestsPerSecond: (successCount + failCount) / duration,
      errors: [...new Set(errors)].slice(0, 10), // Unique errors, max 10
      duration,
    };

    this.results.push(result);
    this.printResult(result);

    return result;
  }

  /**
   * Test database connection pooling
   */
  async testDatabaseConnections(): Promise<StressTestResult> {
    return this.testEndpoint(
      'Database Connection Pooling',
      '/api/trpc/auth.me',
      'GET'
    );
  }

  /**
   * Test authentication endpoint
   */
  async testAuthEndpoint(): Promise<StressTestResult> {
    return this.testEndpoint(
      'Authentication Endpoint',
      '/api/trpc/auth.login',
      'POST',
      { email: 'test@example.com', password: 'test123' }
    );
  }

  /**
   * Test AI Admin endpoint
   */
  async testAIAdminEndpoint(token: string): Promise<StressTestResult> {
    return this.testEndpoint(
      'AI Admin Command Execution',
      '/api/trpc/aiAdmin.executeCommand',
      'POST',
      { command: 'analyze codebase' },
      { Authorization: `Bearer ${token}` }
    );
  }

  /**
   * Test AGI endpoint
   */
  async testAGIEndpoint(): Promise<StressTestResult> {
    return this.testEndpoint(
      'AGI Query Processing',
      '/api/agi/query',
      'POST',
      { query: 'What is consciousness?' }
    );
  }

  /**
   * Print test result
   */
  private printResult(result: StressTestResult): void {
    const successRate = (result.successfulRequests / result.totalRequests) * 100;
    const status = successRate >= 95 ? '✅' : successRate >= 80 ? '⚠️' : '❌';

    console.log(`\n${status} ${result.testName} - Results:`);
    console.log(`   Total Requests: ${result.totalRequests}`);
    console.log(`   Successful: ${result.successfulRequests} (${successRate.toFixed(2)}%)`);
    console.log(`   Failed: ${result.failedRequests}`);
    console.log(`   Avg Response Time: ${result.averageResponseTime.toFixed(2)}ms`);
    console.log(`   Min Response Time: ${result.minResponseTime.toFixed(2)}ms`);
    console.log(`   Max Response Time: ${result.maxResponseTime.toFixed(2)}ms`);
    console.log(`   Requests/Second: ${result.requestsPerSecond.toFixed(2)}`);
    console.log(`   Duration: ${result.duration.toFixed(2)}s`);

    if (result.errors.length > 0) {
      console.log(`   Errors (unique): ${result.errors.length}`);
      result.errors.forEach((error, i) => {
        console.log(`     ${i + 1}. ${error}`);
      });
    }
  }

  /**
   * Generate summary report
   */
  generateReport(): string {
    let report = '\n' + '='.repeat(80) + '\n';
    report += '                    STRESS TEST SUMMARY REPORT\n';
    report += '='.repeat(80) + '\n\n';

    this.results.forEach((result, index) => {
      const successRate = (result.successfulRequests / result.totalRequests) * 100;
      const status = successRate >= 95 ? 'PASS' : successRate >= 80 ? 'WARN' : 'FAIL';
      
      report += `${index + 1}. ${result.testName}\n`;
      report += `   Status: ${status} (${successRate.toFixed(2)}% success rate)\n`;
      report += `   Performance: ${result.requestsPerSecond.toFixed(2)} req/s\n`;
      report += `   Response Time: ${result.averageResponseTime.toFixed(2)}ms avg\n`;
      report += `\n`;
    });

    report += '='.repeat(80) + '\n';

    const totalRequests = this.results.reduce((sum, r) => sum + r.totalRequests, 0);
    const totalSuccess = this.results.reduce((sum, r) => sum + r.successfulRequests, 0);
    const overallSuccessRate = (totalSuccess / totalRequests) * 100;

    report += `Overall Success Rate: ${overallSuccessRate.toFixed(2)}%\n`;
    report += `Total Requests: ${totalRequests}\n`;
    report += `Total Successful: ${totalSuccess}\n`;
    report += `Total Failed: ${totalRequests - totalSuccess}\n`;
    report += '='.repeat(80) + '\n';

    return report;
  }

  /**
   * Save report to file
   */
  async saveReport(filename: string): Promise<void> {
    const report = this.generateReport();
    const fs = await import('fs/promises');
    await fs.writeFile(filename, report);
    console.log(`\n📄 Report saved to: ${filename}`);
  }
}

/**
 * Run all stress tests
 */
async function runAllStressTests() {
  const config: StressTestConfig = {
    baseUrl: process.env.TEST_BASE_URL || 'http://localhost:3000',
    concurrentUsers: parseInt(process.env.CONCURRENT_USERS || '10'),
    requestsPerUser: parseInt(process.env.REQUESTS_PER_USER || '10'),
    timeout: parseInt(process.env.REQUEST_TIMEOUT || '30000'),
  };

  console.log('\n🚀 Starting Comprehensive Stress Test Suite');
  console.log('='.repeat(80));
  console.log(`Base URL: ${config.baseUrl}`);
  console.log(`Concurrent Users: ${config.concurrentUsers}`);
  console.log(`Requests Per User: ${config.requestsPerUser}`);
  console.log(`Request Timeout: ${config.timeout}ms`);
  console.log('='.repeat(80));

  const runner = new StressTestRunner(config);

  try {
    // Test 1: Homepage (baseline)
    await runner.testEndpoint('Homepage Load Test', '/');

    // Test 2: API Health Check
    await runner.testEndpoint('API Health Check', '/api/health', 'GET');

    // Test 3: Database Connections
    await runner.testDatabaseConnections();

    // Test 4: Authentication
    await runner.testAuthEndpoint();

    // Generate and display report
    const report = runner.generateReport();
    console.log(report);

    // Save report
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await runner.saveReport(`stress-test-report-${timestamp}.txt`);

  } catch (error) {
    console.error('\n❌ Stress test suite failed:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  runAllStressTests().catch(console.error);
}

export { StressTestRunner, StressTestResult, StressTestConfig };

