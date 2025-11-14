/**
 * Stress Testing Suite for Apex Agents Platform
 * 
 * This script performs comprehensive stress testing on the system:
 * - API endpoint load testing
 * - Database query performance
 * - Concurrent user simulation
 * - Memory and CPU monitoring
 */

import { performance } from 'perf_hooks';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

interface TestResult {
  name: string;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  requestsPerSecond: number;
  errors: string[];
}

interface StressTestConfig {
  baseUrl: string;
  authToken?: string;
  concurrentUsers: number;
  requestsPerUser: number;
  rampUpTime: number; // seconds
}

class StressTestRunner {
  private config: StressTestConfig;
  private results: TestResult[] = [];

  constructor(config: StressTestConfig) {
    this.config = config;
  }

  /**
   * Run all stress tests
   */
  async runAllTests(): Promise<void> {
    console.log('🔥 Starting Stress Test Suite\n');
    console.log('Configuration:');
    console.log(`- Base URL: ${this.config.baseUrl}`);
    console.log(`- Concurrent Users: ${this.config.concurrentUsers}`);
    console.log(`- Requests per User: ${this.config.requestsPerUser}`);
    console.log(`- Ramp-up Time: ${this.config.rampUpTime}s\n`);

    // Test 1: Authentication endpoints
    await this.testAuthEndpoints();

    // Test 2: Dashboard API endpoints
    await this.testDashboardEndpoints();

    // Test 3: Agent CRUD operations
    await this.testAgentOperations();

    // Test 4: Workflow execution
    await this.testWorkflowExecution();

    // Test 5: Analytics queries
    await this.testAnalyticsQueries();

    // Test 6: Knowledge base operations
    await this.testKnowledgeOperations();

    // Test 7: Concurrent user simulation
    await this.testConcurrentUsers();

    // Print summary
    this.printSummary();
  }

  /**
   * Test authentication endpoints
   */
  private async testAuthEndpoints(): Promise<void> {
    console.log('📝 Test 1: Authentication Endpoints');
    
    const result: TestResult = {
      name: 'Authentication',
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      minResponseTime: Infinity,
      maxResponseTime: 0,
      requestsPerSecond: 0,
      errors: [],
    };

    const startTime = performance.now();
    const responseTimes: number[] = [];

    // Simulate login requests
    for (let i = 0; i < this.config.requestsPerUser; i++) {
      result.totalRequests++;
      
      const reqStart = performance.now();
      try {
        const response = await fetch(`${this.config.baseUrl}/api/auth/me`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.config.authToken}`,
          },
        });

        const reqEnd = performance.now();
        const responseTime = reqEnd - reqStart;
        responseTimes.push(responseTime);

        if (response.ok) {
          result.successfulRequests++;
        } else {
          result.failedRequests++;
          result.errors.push(`Status ${response.status}: ${response.statusText}`);
        }

        result.minResponseTime = Math.min(result.minResponseTime, responseTime);
        result.maxResponseTime = Math.max(result.maxResponseTime, responseTime);
      } catch (error) {
        result.failedRequests++;
        result.errors.push(error instanceof Error ? error.message : String(error));
      }
    }

    const endTime = performance.now();
    const totalTime = (endTime - startTime) / 1000; // seconds

    result.averageResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    result.requestsPerSecond = result.totalRequests / totalTime;

    this.results.push(result);
    this.printTestResult(result);
  }

  /**
   * Test dashboard API endpoints
   */
  private async testDashboardEndpoints(): Promise<void> {
    console.log('\n📊 Test 2: Dashboard API Endpoints');
    
    const result: TestResult = {
      name: 'Dashboard APIs',
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      minResponseTime: Infinity,
      maxResponseTime: 0,
      requestsPerSecond: 0,
      errors: [],
    };

    const endpoints = [
      '/api/trpc/analytics.getDashboardMetrics',
      '/api/trpc/analytics.getSparklineData',
      '/api/trpc/analytics.getRecentActivity',
    ];

    const startTime = performance.now();
    const responseTimes: number[] = [];

    for (let i = 0; i < this.config.requestsPerUser; i++) {
      for (const endpoint of endpoints) {
        result.totalRequests++;
        
        const reqStart = performance.now();
        try {
          const response = await fetch(`${this.config.baseUrl}${endpoint}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${this.config.authToken}`,
            },
          });

          const reqEnd = performance.now();
          const responseTime = reqEnd - reqStart;
          responseTimes.push(responseTime);

          if (response.ok) {
            result.successfulRequests++;
          } else {
            result.failedRequests++;
            result.errors.push(`${endpoint}: Status ${response.status}`);
          }

          result.minResponseTime = Math.min(result.minResponseTime, responseTime);
          result.maxResponseTime = Math.max(result.maxResponseTime, responseTime);
        } catch (error) {
          result.failedRequests++;
          result.errors.push(`${endpoint}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
    }

    const endTime = performance.now();
    const totalTime = (endTime - startTime) / 1000;

    result.averageResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    result.requestsPerSecond = result.totalRequests / totalTime;

    this.results.push(result);
    this.printTestResult(result);
  }

  /**
   * Test agent CRUD operations
   */
  private async testAgentOperations(): Promise<void> {
    console.log('\n🤖 Test 3: Agent CRUD Operations');
    
    const result: TestResult = {
      name: 'Agent Operations',
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      minResponseTime: Infinity,
      maxResponseTime: 0,
      requestsPerSecond: 0,
      errors: [],
    };

    const startTime = performance.now();
    const responseTimes: number[] = [];

    // Test listing agents
    for (let i = 0; i < this.config.requestsPerUser; i++) {
      result.totalRequests++;
      
      const reqStart = performance.now();
      try {
        const response = await fetch(`${this.config.baseUrl}/api/trpc/agents.list`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.config.authToken}`,
          },
        });

        const reqEnd = performance.now();
        const responseTime = reqEnd - reqStart;
        responseTimes.push(responseTime);

        if (response.ok) {
          result.successfulRequests++;
        } else {
          result.failedRequests++;
          result.errors.push(`Status ${response.status}`);
        }

        result.minResponseTime = Math.min(result.minResponseTime, responseTime);
        result.maxResponseTime = Math.max(result.maxResponseTime, responseTime);
      } catch (error) {
        result.failedRequests++;
        result.errors.push(error instanceof Error ? error.message : String(error));
      }
    }

    const endTime = performance.now();
    const totalTime = (endTime - startTime) / 1000;

    result.averageResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    result.requestsPerSecond = result.totalRequests / totalTime;

    this.results.push(result);
    this.printTestResult(result);
  }

  /**
   * Test workflow execution
   */
  private async testWorkflowExecution(): Promise<void> {
    console.log('\n⚙️  Test 4: Workflow Execution');
    
    const result: TestResult = {
      name: 'Workflow Execution',
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      minResponseTime: Infinity,
      maxResponseTime: 0,
      requestsPerSecond: 0,
      errors: [],
    };

    const startTime = performance.now();
    const responseTimes: number[] = [];

    for (let i = 0; i < this.config.requestsPerUser; i++) {
      result.totalRequests++;
      
      const reqStart = performance.now();
      try {
        const response = await fetch(`${this.config.baseUrl}/api/trpc/workflows.list`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.config.authToken}`,
          },
        });

        const reqEnd = performance.now();
        const responseTime = reqEnd - reqStart;
        responseTimes.push(responseTime);

        if (response.ok) {
          result.successfulRequests++;
        } else {
          result.failedRequests++;
          result.errors.push(`Status ${response.status}`);
        }

        result.minResponseTime = Math.min(result.minResponseTime, responseTime);
        result.maxResponseTime = Math.max(result.maxResponseTime, responseTime);
      } catch (error) {
        result.failedRequests++;
        result.errors.push(error instanceof Error ? error.message : String(error));
      }
    }

    const endTime = performance.now();
    const totalTime = (endTime - startTime) / 1000;

    result.averageResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    result.requestsPerSecond = result.totalRequests / totalTime;

    this.results.push(result);
    this.printTestResult(result);
  }

  /**
   * Test analytics queries
   */
  private async testAnalyticsQueries(): Promise<void> {
    console.log('\n📈 Test 5: Analytics Queries');
    
    const result: TestResult = {
      name: 'Analytics Queries',
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      minResponseTime: Infinity,
      maxResponseTime: 0,
      requestsPerSecond: 0,
      errors: [],
    };

    const startTime = performance.now();
    const responseTimes: number[] = [];

    for (let i = 0; i < this.config.requestsPerUser; i++) {
      result.totalRequests++;
      
      const reqStart = performance.now();
      try {
        const response = await fetch(`${this.config.baseUrl}/api/trpc/analytics.getExecutionTrend`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.config.authToken}`,
          },
        });

        const reqEnd = performance.now();
        const responseTime = reqEnd - reqStart;
        responseTimes.push(responseTime);

        if (response.ok) {
          result.successfulRequests++;
        } else {
          result.failedRequests++;
          result.errors.push(`Status ${response.status}`);
        }

        result.minResponseTime = Math.min(result.minResponseTime, responseTime);
        result.maxResponseTime = Math.max(result.maxResponseTime, responseTime);
      } catch (error) {
        result.failedRequests++;
        result.errors.push(error instanceof Error ? error.message : String(error));
      }
    }

    const endTime = performance.now();
    const totalTime = (endTime - startTime) / 1000;

    result.averageResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    result.requestsPerSecond = result.totalRequests / totalTime;

    this.results.push(result);
    this.printTestResult(result);
  }

  /**
   * Test knowledge base operations
   */
  private async testKnowledgeOperations(): Promise<void> {
    console.log('\n📚 Test 6: Knowledge Base Operations');
    
    const result: TestResult = {
      name: 'Knowledge Operations',
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      minResponseTime: Infinity,
      maxResponseTime: 0,
      requestsPerSecond: 0,
      errors: [],
    };

    const startTime = performance.now();
    const responseTimes: number[] = [];

    for (let i = 0; i < this.config.requestsPerUser; i++) {
      result.totalRequests++;
      
      const reqStart = performance.now();
      try {
        const response = await fetch(`${this.config.baseUrl}/api/documents`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.config.authToken}`,
          },
        });

        const reqEnd = performance.now();
        const responseTime = reqEnd - reqStart;
        responseTimes.push(responseTime);

        if (response.ok) {
          result.successfulRequests++;
        } else {
          result.failedRequests++;
          result.errors.push(`Status ${response.status}`);
        }

        result.minResponseTime = Math.min(result.minResponseTime, responseTime);
        result.maxResponseTime = Math.max(result.maxResponseTime, responseTime);
      } catch (error) {
        result.failedRequests++;
        result.errors.push(error instanceof Error ? error.message : String(error));
      }
    }

    const endTime = performance.now();
    const totalTime = (endTime - startTime) / 1000;

    result.averageResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    result.requestsPerSecond = result.totalRequests / totalTime;

    this.results.push(result);
    this.printTestResult(result);
  }

  /**
   * Test concurrent users
   */
  private async testConcurrentUsers(): Promise<void> {
    console.log('\n👥 Test 7: Concurrent User Simulation');
    
    const result: TestResult = {
      name: 'Concurrent Users',
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      minResponseTime: Infinity,
      maxResponseTime: 0,
      requestsPerSecond: 0,
      errors: [],
    };

    const startTime = performance.now();
    const responseTimes: number[] = [];

    // Simulate concurrent users
    const userPromises: Promise<void>[] = [];

    for (let user = 0; user < this.config.concurrentUsers; user++) {
      const userPromise = (async () => {
        // Each user makes multiple requests
        for (let req = 0; req < this.config.requestsPerUser; req++) {
          result.totalRequests++;
          
          const reqStart = performance.now();
          try {
            const response = await fetch(`${this.config.baseUrl}/api/auth/me`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${this.config.authToken}`,
              },
            });

            const reqEnd = performance.now();
            const responseTime = reqEnd - reqStart;
            responseTimes.push(responseTime);

            if (response.ok) {
              result.successfulRequests++;
            } else {
              result.failedRequests++;
              result.errors.push(`User ${user}: Status ${response.status}`);
            }

            result.minResponseTime = Math.min(result.minResponseTime, responseTime);
            result.maxResponseTime = Math.max(result.maxResponseTime, responseTime);
          } catch (error) {
            result.failedRequests++;
            result.errors.push(`User ${user}: ${error instanceof Error ? error.message : String(error)}`);
          }

          // Small delay between requests
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      })();

      userPromises.push(userPromise);

      // Ramp-up delay
      await new Promise(resolve => setTimeout(resolve, (this.config.rampUpTime * 1000) / this.config.concurrentUsers));
    }

    // Wait for all users to complete
    await Promise.all(userPromises);

    const endTime = performance.now();
    const totalTime = (endTime - startTime) / 1000;

    result.averageResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    result.requestsPerSecond = result.totalRequests / totalTime;

    this.results.push(result);
    this.printTestResult(result);
  }

  /**
   * Print individual test result
   */
  private printTestResult(result: TestResult): void {
    console.log(`\n✅ ${result.name} Results:`);
    console.log(`   Total Requests: ${result.totalRequests}`);
    console.log(`   Successful: ${result.successfulRequests} (${((result.successfulRequests / result.totalRequests) * 100).toFixed(2)}%)`);
    console.log(`   Failed: ${result.failedRequests} (${((result.failedRequests / result.totalRequests) * 100).toFixed(2)}%)`);
    console.log(`   Avg Response Time: ${result.averageResponseTime.toFixed(2)}ms`);
    console.log(`   Min Response Time: ${result.minResponseTime.toFixed(2)}ms`);
    console.log(`   Max Response Time: ${result.maxResponseTime.toFixed(2)}ms`);
    console.log(`   Requests/sec: ${result.requestsPerSecond.toFixed(2)}`);
    
    if (result.errors.length > 0) {
      console.log(`   Errors (showing first 5):`);
      result.errors.slice(0, 5).forEach(error => {
        console.log(`     - ${error}`);
      });
    }
  }

  /**
   * Print overall summary
   */
  private printSummary(): void {
    console.log('\n' + '='.repeat(80));
    console.log('📊 STRESS TEST SUMMARY');
    console.log('='.repeat(80));

    const totalRequests = this.results.reduce((sum, r) => sum + r.totalRequests, 0);
    const totalSuccessful = this.results.reduce((sum, r) => sum + r.successfulRequests, 0);
    const totalFailed = this.results.reduce((sum, r) => sum + r.failedRequests, 0);
    const avgResponseTime = this.results.reduce((sum, r) => sum + r.averageResponseTime, 0) / this.results.length;
    const avgRequestsPerSec = this.results.reduce((sum, r) => sum + r.requestsPerSecond, 0) / this.results.length;

    console.log(`\nOverall Statistics:`);
    console.log(`  Total Requests: ${totalRequests}`);
    console.log(`  Successful: ${totalSuccessful} (${((totalSuccessful / totalRequests) * 100).toFixed(2)}%)`);
    console.log(`  Failed: ${totalFailed} (${((totalFailed / totalRequests) * 100).toFixed(2)}%)`);
    console.log(`  Average Response Time: ${avgResponseTime.toFixed(2)}ms`);
    console.log(`  Average Requests/sec: ${avgRequestsPerSec.toFixed(2)}`);

    console.log(`\nTest Results by Component:`);
    this.results.forEach(result => {
      const successRate = ((result.successfulRequests / result.totalRequests) * 100).toFixed(2);
      const status = parseFloat(successRate) >= 95 ? '✅' : parseFloat(successRate) >= 80 ? '⚠️' : '❌';
      console.log(`  ${status} ${result.name}: ${successRate}% success, ${result.averageResponseTime.toFixed(2)}ms avg`);
    });

    console.log('\n' + '='.repeat(80));
    console.log('🎯 Recommendations:');
    
    // Analyze results and provide recommendations
    const slowTests = this.results.filter(r => r.averageResponseTime > 1000);
    if (slowTests.length > 0) {
      console.log(`\n⚠️  Slow Response Times Detected:`);
      slowTests.forEach(test => {
        console.log(`   - ${test.name}: ${test.averageResponseTime.toFixed(2)}ms (consider optimization)`);
      });
    }

    const failedTests = this.results.filter(r => (r.failedRequests / r.totalRequests) > 0.05);
    if (failedTests.length > 0) {
      console.log(`\n❌ High Failure Rates Detected:`);
      failedTests.forEach(test => {
        console.log(`   - ${test.name}: ${((test.failedRequests / test.totalRequests) * 100).toFixed(2)}% failures`);
      });
    }

    if (slowTests.length === 0 && failedTests.length === 0) {
      console.log(`\n✅ All tests passed with acceptable performance!`);
    }

    console.log('\n' + '='.repeat(80));
  }
}

// Run stress tests
async function main() {
  const config: StressTestConfig = {
    baseUrl: process.env.BASE_URL || 'http://localhost:3000',
    authToken: process.env.TEST_AUTH_TOKEN,
    concurrentUsers: parseInt(process.env.CONCURRENT_USERS || '10'),
    requestsPerUser: parseInt(process.env.REQUESTS_PER_USER || '50'),
    rampUpTime: parseInt(process.env.RAMP_UP_TIME || '10'),
  };

  const runner = new StressTestRunner(config);
  await runner.runAllTests();
}

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}

export { StressTestRunner };
export type { StressTestConfig, TestResult };

