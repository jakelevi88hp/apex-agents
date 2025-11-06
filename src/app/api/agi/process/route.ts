import { NextRequest, NextResponse } from 'next/server';
import { agiCore } from '@/lib/agi/core';
import { rateLimit, RateLimitPresets, addRateLimitHeaders } from '@/lib/rate-limit';
import { SubscriptionService } from '@/lib/subscription/service';
import { extractTokenFromRequest, verifyToken } from '@/lib/auth/jwt';

export async function POST(request: NextRequest) {
  // Verify authentication
  const token = extractTokenFromRequest(request);
  
  console.log('[AGI API] Token extraction:', {
    hasToken: !!token,
    tokenLength: token?.length,
    authHeader: request.headers.get('authorization')?.substring(0, 20) + '...',
  });
  
  if (!token) {
    console.error('[AGI API] No token found in request');
    return NextResponse.json(
      { error: 'Authentication required. Please log in again.' },
      { status: 401 }
    );
  }

  const user = verifyToken(token);
  
  console.log('[AGI API] Token verification:', {
    isValid: !!user,
    userId: user?.userId,
  });
  
  if (!user) {
    console.error('[AGI API] Token verification failed');
    return NextResponse.json(
      { error: 'Invalid or expired authentication token. Please log in again.' },
      { status: 401 }
    );
  }

  // Check subscription limits for AGI messages
  try {
    const canUse = await SubscriptionService.canUseFeature(user.userId, 'agi_messages');
    if (!canUse) {
      const usage = await SubscriptionService.getUsageStats(user.userId);
      const agiUsage = usage.find(u => u.feature === 'agi_messages');
      
      return NextResponse.json(
        { 
          error: 'AGI message limit reached',
          limit: agiUsage?.limit,
          current: agiUsage?.current,
          upgradeRequired: true
        },
        { status: 403 }
      );
    }
  } catch (subscriptionError) {
    console.error('[AGI API] Subscription check failed:', subscriptionError);
    // Continue without subscription check if it fails
  }

  // Rate limiting: 20 requests per minute
  const rateLimitResult = await rateLimit(request, RateLimitPresets.AGI);
  if (!rateLimitResult.allowed) {
    return rateLimitResult.response;
  }
  try {
    const body = await request.json();
    const { input } = body;

    if (!input || typeof input !== 'string') {
      return NextResponse.json(
        { error: 'Invalid input' },
        { status: 400 }
      );
    }

    const response = await agiCore.processInput(input);
    
    // Track AGI message usage
    try {
      await SubscriptionService.trackUsage(user.userId, 'agi_messages', 1);
    } catch (trackingError) {
      console.error('[AGI API] Usage tracking failed:', trackingError);
      // Continue even if tracking fails
    }
    
    const jsonResponse = NextResponse.json(response);
    return addRateLimitHeaders(jsonResponse, rateLimitResult, RateLimitPresets.AGI.limit);
  } catch (error) {
    console.error('AGI process error:', error);
    return NextResponse.json(
      { error: 'Failed to process input' },
      { status: 500 }
    );
  }
}

