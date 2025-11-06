import { NextRequest, NextResponse } from 'next/server';
import { agiCore } from '@/lib/agi/core';
import { rateLimit, RateLimitPresets, addRateLimitHeaders } from '@/lib/rate-limit';
import { SubscriptionService } from '@/lib/subscription/service';
import { extractTokenFromRequest, verifyToken } from '@/lib/auth/jwt';

export async function POST(request: NextRequest) {
  // Verify authentication
  const token = extractTokenFromRequest(request);
  if (!token) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  const user = verifyToken(token);
  if (!user) {
    return NextResponse.json(
      { error: 'Invalid authentication' },
      { status: 401 }
    );
  }

  // Check subscription limits for AGI messages
  const canUse = await SubscriptionService.canUseFeature(user.id, 'agi_messages');
  if (!canUse) {
    const usage = await SubscriptionService.getUsageStats(user.id);
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
    await SubscriptionService.trackUsage(user.id, 'agi_messages', 1);
    
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

