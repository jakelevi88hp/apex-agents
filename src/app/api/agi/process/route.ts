import { NextRequest, NextResponse } from 'next/server';
import { agiCore } from '@/lib/agi/core';
import { rateLimit, RateLimitPresets, addRateLimitHeaders } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
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

