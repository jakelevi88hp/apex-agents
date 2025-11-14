import { NextResponse } from 'next/server';
import { agiCore } from '@/lib/agi/core';

export async function GET() {
  try {
    const status = await agiCore.getStatus();
    return NextResponse.json(status);
  } catch (error) {
    console.error('AGI status error:', error);
    return NextResponse.json(
      { available: false, mode: 'error', components: [] },
      { status: 500 }
    );
  }
}
