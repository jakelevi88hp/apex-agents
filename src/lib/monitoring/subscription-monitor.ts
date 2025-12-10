/**
 * Subscription Monitoring Service
 * 
 * Tracks key subscription metrics and sends alerts
 */

import { db } from '@/lib/db';
import { subscriptions, usageTracking } from '@/lib/db/schema';
import { sql, eq, and, gte, lte } from 'drizzle-orm';

export interface SubscriptionMetrics {
  // Subscription counts
  totalSubscriptions: number;
  activeTrials: number;
  activePremium: number;
  activePro: number;
  canceledSubscriptions: number;
  expiredTrials: number;
  
  // Conversion metrics
  trialConversionRate: number;
  churnRate: number;
  
  // Revenue metrics
  mrr: number; // Monthly Recurring Revenue
  arr: number; // Annual Recurring Revenue
  arpu: number; // Average Revenue Per User
  
  // Usage metrics
  avgAgentsPerUser: number;
  avgMessagesPerUser: number;
  avgWorkflowsPerUser: number;
  avgStoragePerUser: number;
  
  // Health indicators
  usersNearLimit: number;
  webhookFailures: number;
  paymentFailures: number;
}

export class SubscriptionMonitor {
  /**
   * Get comprehensive subscription metrics
   */
  static async getMetrics(): Promise<SubscriptionMetrics> {
    const now = new Date();
    
    // Get subscription counts
    const subscriptionCounts = await db.execute(sql`
      SELECT 
        COUNT(*)::int as total,
        COUNT(CASE WHEN plan = 'trial' AND status = 'active' AND trial_ends_at > NOW() THEN 1 END)::int as active_trials,
        COUNT(CASE WHEN plan = 'premium' AND status = 'active' THEN 1 END)::int as active_premium,
        COUNT(CASE WHEN plan = 'pro' AND status = 'active' THEN 1 END)::int as active_pro,
        COUNT(CASE WHEN status = 'canceled' THEN 1 END)::int as canceled,
        COUNT(CASE WHEN plan = 'trial' AND trial_ends_at < NOW() THEN 1 END)::int as expired_trials
      FROM subscriptions
    `);
    
    const counts = (subscriptionCounts as unknown as Array<{
      total: number;
      active_trials: number;
      active_premium: number;
      active_pro: number;
      canceled: number;
      expired_trials: number;
    }>)[0] || {
      total: 0,
      active_trials: 0,
      active_premium: 0,
      active_pro: 0,
      canceled: 0,
      expired_trials: 0,
    };
    
    // Calculate conversion rate (trial → paid)
    const totalTrials = counts.active_trials + counts.expired_trials;
    const paidUsers = counts.active_premium + counts.active_pro;
    const conversionRate = totalTrials > 0 ? (paidUsers / totalTrials) * 100 : 0;
    
    // Calculate churn rate
    const totalPaid = paidUsers + counts.canceled;
    const churnRate = totalPaid > 0 ? (counts.canceled / totalPaid) * 100 : 0;
    
    // Calculate revenue
    const premiumRevenue = counts.active_premium * 29;
    const proRevenue = counts.active_pro * 99;
    const mrr = premiumRevenue + proRevenue;
    const arr = mrr * 12;
    const arpu = paidUsers > 0 ? mrr / paidUsers : 0;
    
    // Get usage metrics
    const usageMetrics = await db.execute(sql`
      SELECT 
        AVG(CASE WHEN feature = 'agents' THEN count ELSE 0 END)::float as avg_agents,
        AVG(CASE WHEN feature = 'agi_messages' THEN count ELSE 0 END)::float as avg_messages,
        AVG(CASE WHEN feature = 'workflows' THEN count ELSE 0 END)::float as avg_workflows,
        AVG(CASE WHEN feature = 'storage' THEN count ELSE 0 END)::float as avg_storage
      FROM usage_tracking
    `);
    
    const usage = (usageMetrics as unknown as Array<{
      avg_agents: number;
      avg_messages: number;
      avg_workflows: number;
      avg_storage: number;
    }>)[0] || {
      avg_agents: 0,
      avg_messages: 0,
      avg_workflows: 0,
      avg_storage: 0,
    };
    
    // Get users near limits (>80% usage)
    const nearLimitResult = await db.execute(sql`
      SELECT COUNT(DISTINCT user_id)::int as count
      FROM usage_tracking
      WHERE (count::float / "limit"::float) > 0.8
    `);
    
    const nearLimitCount = (nearLimitResult as unknown as Array<{ count: number }>)[0]?.count || 0;
    
    return {
      totalSubscriptions: counts.total,
      activeTrials: counts.active_trials,
      activePremium: counts.active_premium,
      activePro: counts.active_pro,
      canceledSubscriptions: counts.canceled,
      expiredTrials: counts.expired_trials,
      
      trialConversionRate: Math.round(conversionRate * 10) / 10,
      churnRate: Math.round(churnRate * 10) / 10,
      
      mrr,
      arr,
      arpu: Math.round(arpu * 100) / 100,
      
      avgAgentsPerUser: Math.round(usage.avg_agents * 10) / 10,
      avgMessagesPerUser: Math.round(usage.avg_messages * 10) / 10,
      avgWorkflowsPerUser: Math.round(usage.avg_workflows * 10) / 10,
      avgStoragePerUser: Math.round(usage.avg_storage * 100) / 100,
      
      usersNearLimit: nearLimitCount,
      webhookFailures: 0, // TODO: Track webhook failures
      paymentFailures: 0, // TODO: Track payment failures
    };
  }
  
  /**
   * Get users expiring soon (within 24 hours)
   */
  static async getUsersExpiringSoon(): Promise<Array<{
    userId: string;
    email: string;
    expiresAt: Date;
    hoursLeft: number;
  }>> {
    const [results] = await db.execute(sql`
      SELECT 
        s.user_id,
        u.email,
        s.trial_ends_at as expires_at,
        EXTRACT(HOUR FROM (s.trial_ends_at - NOW())) as hours_left
      FROM subscriptions s
      JOIN users u ON s.user_id = u.id
      WHERE s.plan = 'trial'
        AND s.status = 'active'
        AND s.trial_ends_at BETWEEN NOW() AND NOW() + INTERVAL '24 hours'
      ORDER BY s.trial_ends_at ASC
    `);
    
    return (results as unknown as Array<{
      user_id: string;
      email: string;
      expires_at: Date;
      hours_left: number;
    }>).map((row) => ({
      userId: row.user_id,
      email: row.email,
      expiresAt: new Date(row.expires_at),
      hoursLeft: row.hours_left,
    }));
  }
  
  /**
   * Get users who hit usage limits today
   */
  static async getUsersAtLimit(): Promise<Array<{
    userId: string;
    email: string;
    feature: string;
    current: number;
    limit: number;
  }>> {
    const results = await db.execute(sql`
      SELECT 
        ut.user_id,
        u.email,
        ut.feature,
        ut.count::int as current,
        ut."limit"::int as limit
      FROM usage_tracking ut
      JOIN users u ON ut.user_id = u.id
      WHERE ut.count >= ut."limit"
        AND ut.updated_at > NOW() - INTERVAL '24 hours'
      ORDER BY ut.updated_at DESC
    `);
    
    return (results as unknown as Array<{
      user_id: string;
      email: string;
      feature: string;
      current: number;
      limit: number;
    }>).map((row) => ({
      userId: row.user_id,
      email: row.email,
      feature: row.feature,
      current: row.current,
      limit: row.limit,
    }));
  }
  
  /**
   * Get daily subscription activity
   */
  static async getDailyActivity(days: number = 7): Promise<Array<{
    date: string;
    newTrials: number;
    conversions: number;
    cancellations: number;
  }>> {
    const results = await db.execute(sql`
      WITH dates AS (
        SELECT generate_series(
          NOW() - INTERVAL '${days} days',
          NOW(),
          INTERVAL '1 day'
        )::date as date
      )
      SELECT 
        d.date::text as date,
        COUNT(CASE WHEN s.plan = 'trial' AND s.created_at::date = d.date THEN 1 END)::int as new_trials,
        COUNT(CASE WHEN s.plan IN ('premium', 'pro') AND s.created_at::date = d.date THEN 1 END)::int as conversions,
        COUNT(CASE WHEN s.canceled_at::date = d.date THEN 1 END)::int as cancellations
      FROM dates d
      LEFT JOIN subscriptions s ON s.created_at::date = d.date OR s.canceled_at::date = d.date
      GROUP BY d.date
      ORDER BY d.date DESC
    `);
    
    return (results as unknown as Array<{
      date: string;
      new_trials: number;
      conversions: number;
      cancellations: number;
    }>).map((row) => ({
      date: row.date,
      newTrials: row.new_trials,
      conversions: row.conversions,
      cancellations: row.cancellations,
    }));
  }
  
  /**
   * Check system health and return alerts
   */
  static async checkHealth(): Promise<{
    healthy: boolean;
    alerts: string[];
  }> {
    const alerts: string[] = [];
    const metrics = await this.getMetrics();
    
    // Check conversion rate
    if (metrics.trialConversionRate < 5) {
      alerts.push(`⚠️ Low conversion rate: ${metrics.trialConversionRate}% (target: >10%)`);
    }
    
    // Check churn rate
    if (metrics.churnRate > 10) {
      alerts.push(`⚠️ High churn rate: ${metrics.churnRate}% (target: <5%)`);
    }
    
    // Check users near limits
    if (metrics.usersNearLimit > 5) {
      alerts.push(`⚠️ ${metrics.usersNearLimit} users near usage limits - potential upgrade opportunity`);
    }
    
    // Check expiring trials
    const expiringSoon = await this.getUsersExpiringSoon();
    if (expiringSoon.length > 0) {
      alerts.push(`⏰ ${expiringSoon.length} trials expiring in next 24 hours`);
    }
    
    // Check users at limit
    const atLimit = await this.getUsersAtLimit();
    if (atLimit.length > 0) {
      alerts.push(`🚫 ${atLimit.length} users hit usage limits today`);
    }
    
    return {
      healthy: alerts.length === 0,
      alerts,
    };
  }
  
  /**
   * Generate monitoring report
   */
  static async generateReport(): Promise<string> {
    const metrics = await this.getMetrics();
    const health = await this.checkHealth();
    const activity = await this.getDailyActivity(7);
    
    let report = '📊 SUBSCRIPTION MONITORING REPORT\n';
    report += '='.repeat(50) + '\n\n';
    
    report += '💰 REVENUE METRICS\n';
    report += `  MRR: $${metrics.mrr.toLocaleString()}\n`;
    report += `  ARR: $${metrics.arr.toLocaleString()}\n`;
    report += `  ARPU: $${metrics.arpu}\n\n`;
    
    report += '👥 SUBSCRIPTION COUNTS\n';
    report += `  Active Trials: ${metrics.activeTrials}\n`;
    report += `  Active Premium: ${metrics.activePremium}\n`;
    report += `  Active Pro: ${metrics.activePro}\n`;
    report += `  Canceled: ${metrics.canceledSubscriptions}\n`;
    report += `  Expired Trials: ${metrics.expiredTrials}\n\n`;
    
    report += '📈 CONVERSION METRICS\n';
    report += `  Trial Conversion Rate: ${metrics.trialConversionRate}%\n`;
    report += `  Churn Rate: ${metrics.churnRate}%\n\n`;
    
    report += '📊 USAGE METRICS\n';
    report += `  Avg Agents/User: ${metrics.avgAgentsPerUser}\n`;
    report += `  Avg Messages/User: ${metrics.avgMessagesPerUser}\n`;
    report += `  Avg Workflows/User: ${metrics.avgWorkflowsPerUser}\n`;
    report += `  Avg Storage/User: ${metrics.avgStoragePerUser} GB\n\n`;
    
    report += '🚨 HEALTH STATUS\n';
    report += `  Status: ${health.healthy ? '✅ HEALTHY' : '⚠️ NEEDS ATTENTION'}\n`;
    if (health.alerts.length > 0) {
      report += '  Alerts:\n';
      health.alerts.forEach(alert => {
        report += `    ${alert}\n`;
      });
    }
    report += '\n';
    
    report += '📅 7-DAY ACTIVITY\n';
    activity.forEach(day => {
      report += `  ${day.date}: ${day.newTrials} trials, ${day.conversions} conversions, ${day.cancellations} cancellations\n`;
    });
    
    return report;
  }
}

