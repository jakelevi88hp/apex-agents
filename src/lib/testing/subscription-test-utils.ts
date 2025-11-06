/**
 * Frontend Testing Utilities for Subscription System
 * 
 * Helper functions for testing subscription flows in the browser
 */

export class SubscriptionTestUtils {
  /**
   * Test if pricing page loads correctly
   */
  static async testPricingPage(): Promise<{
    success: boolean;
    errors: string[];
  }> {
    const errors: string[] = [];
    
    try {
      // Check if pricing page exists
      const response = await fetch('/pricing');
      if (!response.ok) {
        errors.push('Pricing page failed to load');
      }
      
      // Check if page contains expected elements
      const html = await response.text();
      
      if (!html.includes('Premium')) {
        errors.push('Premium plan not found on pricing page');
      }
      
      if (!html.includes('Pro')) {
        errors.push('Pro plan not found on pricing page');
      }
      
      if (!html.includes('$29')) {
        errors.push('Premium pricing not displayed');
      }
      
      if (!html.includes('$99')) {
        errors.push('Pro pricing not displayed');
      }
      
    } catch (error: any) {
      errors.push(`Pricing page test failed: ${error.message}`);
    }
    
    return {
      success: errors.length === 0,
      errors,
    };
  }
  
  /**
   * Test if subscription API endpoints are accessible
   */
  static async testSubscriptionAPI(): Promise<{
    success: boolean;
    errors: string[];
  }> {
    const errors: string[] = [];
    
    try {
      // Test getting current subscription
      const subResponse = await fetch('/api/trpc/subscription.getCurrent');
      if (!subResponse.ok && subResponse.status !== 401) {
        errors.push('Subscription API endpoint not accessible');
      }
      
      // Test getting usage stats
      const usageResponse = await fetch('/api/trpc/subscription.getUsage');
      if (!usageResponse.ok && usageResponse.status !== 401) {
        errors.push('Usage API endpoint not accessible');
      }
      
      // Test getting plans
      const plansResponse = await fetch('/api/trpc/subscription.getPlans');
      if (!plansResponse.ok && plansResponse.status !== 401) {
        errors.push('Plans API endpoint not accessible');
      }
      
    } catch (error: any) {
      errors.push(`API test failed: ${error.message}`);
    }
    
    return {
      success: errors.length === 0,
      errors,
    };
  }
  
  /**
   * Test if Stripe checkout can be initiated
   */
  static async testStripeCheckout(plan: 'premium' | 'pro'): Promise<{
    success: boolean;
    checkoutUrl?: string;
    error?: string;
  }> {
    try {
      const response = await fetch('/api/trpc/subscription.createCheckoutSession', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan,
          billingPeriod: 'monthly',
        }),
      });
      
      if (!response.ok) {
        return {
          success: false,
          error: `Checkout creation failed: ${response.statusText}`,
        };
      }
      
      const data = await response.json();
      
      if (!data.url || !data.url.includes('checkout.stripe.com')) {
        return {
          success: false,
          error: 'Invalid checkout URL returned',
        };
      }
      
      return {
        success: true,
        checkoutUrl: data.url,
      };
      
    } catch (error: any) {
      return {
        success: false,
        error: `Checkout test failed: ${error.message}`,
      };
    }
  }
  
  /**
   * Test if usage tracking is working
   */
  static async testUsageTracking(): Promise<{
    success: boolean;
    usage?: any;
    error?: string;
  }> {
    try {
      const response = await fetch('/api/trpc/subscription.getUsage');
      
      if (!response.ok) {
        return {
          success: false,
          error: `Usage tracking failed: ${response.statusText}`,
        };
      }
      
      const data = await response.json();
      
      // Check if usage data has expected structure
      if (!Array.isArray(data.result?.data)) {
        return {
          success: false,
          error: 'Invalid usage data structure',
        };
      }
      
      return {
        success: true,
        usage: data.result.data,
      };
      
    } catch (error: any) {
      return {
        success: false,
        error: `Usage tracking test failed: ${error.message}`,
      };
    }
  }
  
  /**
   * Run all frontend tests
   */
  static async runAllTests(): Promise<{
    passed: number;
    failed: number;
    results: Array<{
      test: string;
      success: boolean;
      details: any;
    }>;
  }> {
    const results: Array<{ test: string; success: boolean; details: any }> = [];
    
    // Test 1: Pricing Page
    console.log('🧪 Testing pricing page...');
    const pricingTest = await this.testPricingPage();
    results.push({
      test: 'Pricing Page',
      success: pricingTest.success,
      details: pricingTest,
    });
    
    // Test 2: Subscription API
    console.log('🧪 Testing subscription API...');
    const apiTest = await this.testSubscriptionAPI();
    results.push({
      test: 'Subscription API',
      success: apiTest.success,
      details: apiTest,
    });
    
    // Test 3: Stripe Checkout (Premium)
    console.log('🧪 Testing Stripe checkout (Premium)...');
    const checkoutTest = await this.testStripeCheckout('premium');
    results.push({
      test: 'Stripe Checkout',
      success: checkoutTest.success,
      details: checkoutTest,
    });
    
    // Test 4: Usage Tracking
    console.log('🧪 Testing usage tracking...');
    const usageTest = await this.testUsageTracking();
    results.push({
      test: 'Usage Tracking',
      success: usageTest.success,
      details: usageTest,
    });
    
    const passed = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    return {
      passed,
      failed,
      results,
    };
  }
  
  /**
   * Generate test report
   */
  static generateTestReport(results: {
    passed: number;
    failed: number;
    results: Array<{ test: string; success: boolean; details: any }>;
  }): string {
    let report = '🧪 FRONTEND SUBSCRIPTION TESTS\n';
    report += '='.repeat(50) + '\n\n';
    
    results.results.forEach((result, i) => {
      const icon = result.success ? '✅' : '❌';
      report += `${icon} Test ${i + 1}: ${result.test}\n`;
      
      if (!result.success) {
        if (result.details.errors) {
          result.details.errors.forEach((error: string) => {
            report += `   ⚠️ ${error}\n`;
          });
        } else if (result.details.error) {
          report += `   ⚠️ ${result.details.error}\n`;
        }
      }
      
      report += '\n';
    });
    
    report += '='.repeat(50) + '\n';
    report += `\nResults: ${results.passed} passed, ${results.failed} failed\n`;
    report += `Status: ${results.failed === 0 ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}\n`;
    
    return report;
  }
}

// Browser console helper
if (typeof window !== 'undefined') {
  (window as any).testSubscriptions = async () => {
    console.log('🚀 Running subscription tests...\n');
    const results = await SubscriptionTestUtils.runAllTests();
    const report = SubscriptionTestUtils.generateTestReport(results);
    console.log(report);
    return results;
  };
  
  console.log('💡 Tip: Run window.testSubscriptions() to test subscription flows');
}

