import { NextResponse } from 'next/server';
import type { CreativityTechnique } from '@/lib/agi/creativity';
import { initIdeaGenerationScheduler } from '@/lib/ideas/scheduler';
import { generateAndStoreIdeas } from '@/lib/ideas/service';
import type { IdeaTriggerType } from '@/lib/ideas/types';

const DEFAULT_TRIGGER: IdeaTriggerType = 'manual';
const VALID_TECHNIQUES: CreativityTechnique[] = [
  'divergent',
  'lateral',
  'conceptual_blending',
  'analogical',
  'scamper',
  'random_stimulation',
  'hybrid',
];

/**
 * Triggers a new idea generation run on demand.
 */
export async function POST(request: Request) {
  // Make sure the scheduler is available for future automated runs.
  initIdeaGenerationScheduler();

  try {
    // Safely parse the JSON body.
    const body = await request.json();
    const topic = typeof body.topic === 'string' ? body.topic.trim() : '';
    const count =
      typeof body.count === 'number' && Number.isFinite(body.count)
        ? body.count
        : undefined;
    const technique =
      typeof body.technique === 'string' &&
      VALID_TECHNIQUES.includes(body.technique as CreativityTechnique)
        ? (body.technique as CreativityTechnique)
        : undefined;
    const triggerType: IdeaTriggerType =
      typeof body.triggerType === 'string'
        ? (body.triggerType as IdeaTriggerType)
        : DEFAULT_TRIGGER;
    const userId =
      typeof body.userId === 'string' && body.userId.length > 0
        ? body.userId
        : undefined;

    if (!topic) {
      return NextResponse.json(
        { error: 'Please provide a topic to brainstorm around.' },
        { status: 400 },
      );
    }

    // Run the idea generator and persist the results.
    const result = await generateAndStoreIdeas({
      topic,
      count,
      technique,
      triggerType,
      userId,
    });

    return NextResponse.json({
      message: 'Ideas generated successfully.',
      generation: result.generation,
      suggestions: result.suggestions,
    });
  } catch (error) {
    console.error('[API] Idea generation failed:', error);
    return NextResponse.json(
      { error: 'Idea generation failed. Please retry in a moment.' },
      { status: 500 },
    );
  }
}
