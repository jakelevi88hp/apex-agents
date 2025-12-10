/**
 * System Health Check and Debugging Tool
 * 
 * Comprehensive system diagnostics:
 * - Database connectivity
 * - API endpoint health
 * - Environment variable validation
 * - Memory usage monitoring
 * - Error log analysis
 */

import { performance } from 'perf_hooks';

interface HealthCheckResult {
  component: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime?: number;
  message: string;
  details?: any;
}

class SystemHealthChecker {
  private results: HealthCheckResult[] = [];
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
  }

  /**
   * Check database connectivity
   */
  async checkDatabase(): Promise<HealthCheckResult> {
    console.log('\n🔍 Checking database connectivity...');
    
    const start = performance.now();
    
    try {
      const response = await fetch(`${this.baseUrl}/api/health/db`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });

      const responseTime = performance.now() - start;

      if (response.ok) {
        const data = await response.json();
        const result: HealthCheckResult = {
          component: 'Database',
          status: responseTime < 100 ? 'healthy' : responseTime < 500 ? 'degraded' : 'unhealthy',
          responseTime,
          message: `Database connected successfully`,
          details: data,
        };
        this.results.push(result);
        return result;
      } else {
        const result: HealthCheckResult = {
          component: 'Database',
          status: 'unhealthy',
          responseTime,
          message: `Database check failed: HTTP ${response.status}`,
        };
        this.results.push(result);
        return result;
      }
    } catch (error: any) {
      const result: HealthCheckResult = {
        component: 'Database',
        status: 'unhealthy',
        message: `Database check error: ${error.message}`,
      };
      this.results.push(result);
      return result;
    }
  }

  /**
   * Check API endpoints
   */
  async checkAPIEndpoints(): Promise<HealthCheckResult[]> {
    console.log('\n🔍 Checking API endpoints...');
    
    const endpoints = [
      { path: '/api/health', name: 'Health Check' },
      { path: '/api/trpc/auth.me', name: 'Auth API' },
    ];

    const results: HealthCheckResult[] = [];

    for (const endpoint of endpoints) {
      const start = performance.now();
      
      try {
        const response = await fetch(`${this.baseUrl}${endpoint.path}`, {
          method: 'GET',
          signal: AbortSignal.timeout(5000),
        });

        const responseTime = performance.now() - start;

        const result: HealthCheckResult = {
          component: `API: ${endpoint.name}`,
          status: response.ok && responseTime < 1000 ? 'healthy' : 'degraded',
          responseTime,
          message: `HTTP ${response.status}`,
        };
        
        results.push(result);
        this.results.push(result);
      } catch (error: any) {
        const result: HealthCheckResult = {
          component: `API: ${endpoint.name}`,
          status: 'unhealthy',
          message: `Error: ${error.message}`,
        };
        results.push(result);
        this.results.push(result);
      }
    }

    return results;
  }

  /**
   * Check environment variables
   */
  checkEnvironmentVariables(): HealthCheckResult {
    console.log('\n🔍 Checking environment variables...');
    
    const requiredEnvVars = [
      'DATABASE_URL',
      'JWT_SECRET',
      'OPENAI_API_KEY',
    ];

    const missingVars: string[] = [];
    const presentVars: string[] = [];

    requiredEnvVars.forEach((varName) => {
      if (process.env[varName]) {
        presentVars.push(varName);
      } else {
        missingVars.push(varName);
      }
    });

    const result: HealthCheckResult = {
      component: 'Environment Variables',
      status: missingVars.length === 0 ? 'healthy' : 'unhealthy',
      message: missingVars.length === 0 
        ? 'All required environment variables are set'
        : `Missing ${missingVars.length} required variables`,
      details: {
        present: presentVars,
        missing: missingVars,
      },
    };

    this.results.push(result);
    return result;
  }

  /**
   * Check memory usage
   */
  checkMemoryUsage(): HealthCheckResult {
    console.log('\n🔍 Checking memory usage...');
    
    const usage = process.memoryUsage();
    const heapUsedMB = usage.heapUsed / 1024 / 1024;
    const heapTotalMB = usage.heapTotal / 1024 / 1024;
    const rssMB = usage.rss / 1024 / 1024;
    const externalMB = usage.external / 1024 / 1024;

    const heapUsagePercent = (heapUsedMB / heapTotalMB) * 100;

    const result: HealthCheckResult = {
      component: 'Memory Usage',
      status: heapUsagePercent < 70 ? 'healthy' : heapUsagePercent < 90 ? 'degraded' : 'unhealthy',
      message: `Heap usage: ${heapUsagePercent.toFixed(2)}%`,
      details: {
        heapUsed: `${heapUsedMB.toFixed(2)} MB`,
        heapTotal: `${heapTotalMB.toFixed(2)} MB`,
        rss: `${rssMB.toFixed(2)} MB`,
        external: `${externalMB.toFixed(2)} MB`,
      },
    };

    this.results.push(result);
    return result;
  }

  /**
   * Print health check result
   */
  private printResult(result: HealthCheckResult): void {
    const icon = result.status === 'healthy' ? '✅' : result.status === 'degraded' ? '⚠️' : '❌';
    console.log(`${icon} ${result.component}: ${result.message}`);
    
    if (result.responseTime) {
      console.log(`   Response Time: ${result.responseTime.toFixed(2)}ms`);
    }
    
    if (result.details) {
      console.log(`   Details:`, JSON.stringify(result.details, null, 2));
    }
  }

  /**
   * Run all health checks
   */
  async runAllChecks(): Promise<void> {
    console.log('\n🏥 Starting System Health Check');
    console.log('='.repeat(80));

    // Check environment variables (synchronous)
    const envResult = this.checkEnvironmentVariables();
    this.printResult(envResult);

    // Check memory usage (synchronous)
    const memResult = this.checkMemoryUsage();
    this.printResult(memResult);

    // Check database (async)
    const dbResult = await this.checkDatabase();
    this.printResult(dbResult);

    // Check API endpoints (async)
    const apiResults = await this.checkAPIEndpoints();
    apiResults.forEach((result) => this.printResult(result));

    // Generate summary
    this.printSummary();
  }

  /**
   * Print summary
   */
  private printSummary(): void {
    console.log('\n' + '='.repeat(80));
    console.log('HEALTH CHECK SUMMARY');
    console.log('='.repeat(80));

    const healthyCount = this.results.filter((r) => r.status === 'healthy').length;
    const degradedCount = this.results.filter((r) => r.status === 'degraded').length;
    const unhealthyCount = this.results.filter((r) => r.status === 'unhealthy').length;

    console.log(`✅ Healthy: ${healthyCount}`);
    console.log(`⚠️  Degraded: ${degradedCount}`);
    console.log(`❌ Unhealthy: ${unhealthyCount}`);
    console.log(`Total Checks: ${this.results.length}`);

    const overallStatus = unhealthyCount > 0 ? 'UNHEALTHY' : degradedCount > 0 ? 'DEGRADED' : 'HEALTHY';
    console.log(`\nOverall System Status: ${overallStatus}`);
    console.log('='.repeat(80));
  }

  /**
   * Get results
   */
  getResults(): HealthCheckResult[] {
    return this.results;
  }
}

/**
 * Run system health check
 */
async function runHealthCheck() {
  const baseUrl = process.env.TEST_BASE_URL || 'http://localhost:3000';
  const checker = new SystemHealthChecker(baseUrl);
  
  try {
    await checker.runAllChecks();
    
    const results = checker.getResults();
    const hasUnhealthy = results.some((r) => r.status === 'unhealthy');
    
    if (hasUnhealthy) {
      console.error('\n⚠️  System has unhealthy components. Please investigate.');
      process.exit(1);
    } else {
      console.log('\n✅ System health check passed!');
      process.exit(0);
    }
  } catch (error) {
    console.error('\n❌ Health check failed:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  runHealthCheck().catch(console.error);
}

export { SystemHealthChecker };
export type { HealthCheckResult };

