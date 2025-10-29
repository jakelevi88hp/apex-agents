import { NextRequest, NextResponse } from 'next/server';
import { agiCore } from '@/lib/agi/core';

export async function POST(request: NextRequest) {
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
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('AGI process error:', error);
    return NextResponse.json(
      { error: 'Failed to process input' },
      { status: 500 }
    );
  }
}

