import { NextRequest, NextResponse } from 'next/server';
import OpenAI, { toFile } from 'openai';
import { z } from 'zod';
import { and, eq, gte, sql } from 'drizzle-orm';
import { extractTokenFromRequest, verifyToken } from '@/lib/auth/jwt';
import { db } from '@/lib/db';
import { agents, executions, workflows } from '@/lib/db/schema';
import { executeAgent } from '@/lib/agent-execution/executor';

/**
 * Lazily instantiated OpenAI client to avoid recreating it for each request.
 */
let cachedOpenAI: OpenAI | null = null;

/**
 * Retrieve a singleton OpenAI client instance.
 *
 * @returns {OpenAI} The OpenAI client configured with the process environment key.
 * @throws {Error} If the OPENAI_API_KEY environment variable is not defined.
 */
function getOpenAI(): OpenAI {
  if (!cachedOpenAI) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }
    cachedOpenAI = new OpenAI({ apiKey });
  }

  return cachedOpenAI;
}

interface VoiceAudioPayload {
  /**
   * Base64 encoded binary audio suitable for data URLs.
   */
  audioBase64: string;
  /**
   * Reported MIME type so the client can choose the correct player.
   */
  mimeType: string;
}

const commandSchema = z.object({
  action: z.enum(['respond', 'get_dashboard_metrics', 'run_agent']),
  summary: z.string(),
  commandText: z.string(),
  arguments: z
    .object({
      agentId: z.string().optional(),
      agentName: z.string().optional(),
      input: z.string().optional(),
    })
    .optional(),
});

/**
 * Convert the uploaded audio file into text by calling the Whisper API.
 *
 * @param {File} audioFile - The audio file captured from the client.
 * @returns {Promise<string>} The transcription text.
 */
async function transcribeAudio(audioFile: File): Promise<string> {
  // Ensure the OpenAI client is ready before making external calls.
  const openai = getOpenAI();
  // Generate a friendly filename so the API knows the file type.
  const fileName = audioFile.name || `voice-command-${Date.now()}.webm`;
  // Read the file into memory so it can be converted for the OpenAI helper.
  const arrayBuffer = await audioFile.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  // Invoke Whisper to generate a text transcript of the spoken command.
  const transcription = await openai.audio.transcriptions.create({
    file: await toFile(buffer, fileName),
    model: 'gpt-4o-mini-transcribe',
    response_format: 'text',
  });

  return transcription.text.trim();
}

/**
 * Ask GPT to interpret the user's spoken request and map it to a supported command.
 *
 * @param {string} transcript - The text transcription of the voice input.
 * @returns {Promise<z.infer<typeof commandSchema>>} The structured command payload.
 */
async function interpretCommand(transcript: string): Promise<z.infer<typeof commandSchema>> {
  // Use GPT-based reasoning to map free-form speech into a structured command.
  const openai = getOpenAI();
  // Ask the model to return strict JSON so we can trust the command payload.
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.2,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content:
          'You are a helpful assistant that turns spoken requests into structured commands. ' +
          'You must reply with JSON containing the fields action, summary, commandText, and arguments. ' +
          'Supported actions are: respond, get_dashboard_metrics, run_agent. ' +
          'When choosing run_agent provide arguments.agentName when possible and include arguments.input with the user request. ' +
          'Keep summary concise. The commandText should be a short natural language description of what will happen.',
      },
      {
        role: 'user',
        content: transcript,
      },
    ],
  });

  // Pull the raw JSON string from the assistant message.
  const rawContent = completion.choices[0]?.message?.content ?? '';
  // Validate the JSON with zod to guard against malformed responses.
  const parsed = commandSchema.safeParse(JSON.parse(rawContent));

  if (!parsed.success) {
    throw new Error('Failed to interpret the voice command');
  }

  return parsed.data;
}

/**
 * Fetch dashboard metrics mirroring the analytics router logic.
 *
 * @param {string} userId - The authenticated user's identifier.
 * @returns {Promise<{
 *   activeAgents: number;
 *   workflows: number;
 *   executionsToday: number;
 *   executionsTrend: { change: number; direction: 'up' | 'down' };
 * }>} Metrics summary for the dashboard cards.
 */
async function getDashboardMetrics(userId: string) {
  // Count active agents for the user.
  const activeAgentsRows = await db
    .select({ count: sql<number>`count(*)` })
    .from(agents)
    .where(and(eq(agents.userId, userId), eq(agents.status, 'active')));

  // Count total workflows owned by the user.
  const workflowRows = await db
    .select({ count: sql<number>`count(*)` })
    .from(workflows)
    .where(eq(workflows.userId, userId));

  // Prepare day boundaries for execution counts.
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Count executions that ran today.
  const todayExecutionsRows = await db
    .select({ count: sql<number>`count(*)` })
    .from(executions)
    .where(and(eq(executions.userId, userId), gte(executions.startedAt, today)));

  // Compare with the previous day to show the trend.
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const yesterdayExecutionsRows = await db
    .select({ count: sql<number>`count(*)` })
    .from(executions)
    .where(
      and(
        eq(executions.userId, userId),
        gte(executions.startedAt, yesterday),
        sql`${executions.startedAt} < ${today}`,
      ),
    );

  const todayCount = Number(todayExecutionsRows[0]?.count ?? 0);
  const yesterdayCount = Number(yesterdayExecutionsRows[0]?.count ?? 0);
  const delta = yesterdayCount > 0 ? ((todayCount - yesterdayCount) / yesterdayCount) * 100 : 0;

  return {
    // Basic card metrics used by the dashboard.
    activeAgents: Number(activeAgentsRows[0]?.count ?? 0),
    workflows: Number(workflowRows[0]?.count ?? 0),
    executionsToday: todayCount,
    executionsTrend: {
      change: delta,
      direction: delta >= 0 ? 'up' : 'down',
    },
  };
}

/**
 * Execute the command returned by the reasoning model.
 *
 * @param {z.infer<typeof commandSchema>} command - The parsed command payload.
 * @param {string} userId - The authenticated user's identifier.
 * @returns {Promise<Record<string, unknown>>} The execution result payload.
 */
async function executeCommand(
  command: z.infer<typeof commandSchema>,
  userId: string,
): Promise<Record<string, unknown>> {
  if (command.action === 'respond') {
    // Purely conversational responses simply echo back the plan.
    return {
      message: command.commandText,
    };
  }

  if (command.action === 'get_dashboard_metrics') {
    // Surface metrics if the user asked for an overview.
    const metrics = await getDashboardMetrics(userId);
    return { metrics };
  }

  if (command.action === 'run_agent') {
    // Pull the requested agent identifier from the command arguments.
    const args = command.arguments ?? {};
    const agentIdentifier = args.agentId || args.agentName;
    if (!agentIdentifier) {
      throw new Error('No agent specified for execution');
    }

    // Verify the agent belongs to the authenticated user before executing.
    const agentRecord = await db.query.agents.findFirst({
      where: args.agentId
        ? and(eq(agents.userId, userId), eq(agents.id, args.agentId))
        : and(eq(agents.userId, userId), eq(agents.name, args.agentName ?? '')),
    });

    if (!agentRecord) {
      throw new Error(`Unable to find an agent named "${agentIdentifier}" for this user`);
    }

    // Default input keeps the agent call meaningful if none was provided.
    const input = args.input ?? 'Run your default task.';
    // Execute the agent using the existing execution pipeline.
    const execution = await executeAgent({
      agentId: agentRecord.id,
      userId,
      input,
    });

    if (execution.status === 'error') {
      throw new Error(execution.error ?? 'Agent execution failed');
    }

    return {
      // Return enough metadata for the client to display the outcome.
      agentId: agentRecord.id,
      executionId: execution.id,
      output: execution.output,
      tokensUsed: execution.tokensUsed,
      duration: execution.duration,
    };
  }

  throw new Error(`Unsupported action: ${command.action}`);
}

/**
 * Generate a conversational reply describing what happened so it can be spoken back to the user.
 *
 * @param {string} transcript - The raw user request captured from speech.
 * @param {z.infer<typeof commandSchema>} command - The structured interpretation of the request.
 * @param {Record<string, unknown>} executionResult - The data returned after executing the command.
 * @returns {Promise<string>} A concise natural language response.
 */
async function craftVoiceReply(
  transcript: string,
  command: z.infer<typeof commandSchema>,
  executionResult: Record<string, unknown>,
): Promise<string> {
  const openai = getOpenAI();
  const condensedResult = (() => {
    try {
      return JSON.stringify(executionResult);
    } catch {
      return 'Unable to serialize execution result';
    }
  })().slice(0, 3000);

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.5,
    messages: [
      {
        role: 'system',
        content:
          'You are the friendly voice of Apex Agents. Summarize results clearly in under 80 words. ' +
          'Reference concrete numbers when available and invite the user to continue the dialogue.',
      },
      {
        role: 'user',
        content: [
          `User request: ${transcript}`,
          `Command summary: ${command.summary}`,
          `Action: ${command.action}`,
          `Execution result JSON: ${condensedResult}`,
        ].join('\n'),
      },
    ],
  });

  const reply = completion.choices[0]?.message?.content?.trim();

  if (!reply) {
    throw new Error('Voice reply was empty');
  }

  return reply;
}

/**
 * Convert a text reply into playable speech audio through OpenAI TTS.
 *
 * @param {string} responseText - The message that should be spoken to the user.
 * @returns {Promise<VoiceAudioPayload>} Base64 audio data and MIME metadata.
 */
async function synthesizeVoiceAudio(responseText: string): Promise<VoiceAudioPayload> {
  const openai = getOpenAI();
  const speech = await openai.audio.speech.create({
    model: 'gpt-4o-mini-tts',
    voice: 'alloy',
    input: responseText,
    format: 'mp3',
  });

  const audioBuffer = Buffer.from(await speech.arrayBuffer());

  return {
    audioBase64: audioBuffer.toString('base64'),
    mimeType: 'audio/mpeg',
  };
}

/**
 * Handle POST requests to the voice command endpoint.
 *
 * @param {NextRequest} request - The incoming HTTP request.
 * @returns {Promise<NextResponse>} A JSON response containing transcription, interpretation, and execution results.
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate the incoming request using JWT token helpers.
    const token = extractTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const formData = await request.formData();
    const audioFile = formData.get('audio');

    if (!(audioFile instanceof File)) {
      return NextResponse.json({ error: 'Audio file is required' }, { status: 400 });
    }

    // Convert speech to text before reasoning.
    const transcript = await transcribeAudio(audioFile);
    if (!transcript) {
      return NextResponse.json({ error: 'Unable to transcribe audio' }, { status: 422 });
    }

    // Ask GPT to interpret the transcript as a structured command.
    const command = await interpretCommand(transcript);
    // Execute the requested action and gather the result payload.
    const executionResult = await executeCommand(command, user.userId);
    let voicePayload: { text: string; audioBase64: string; mimeType: string } | null = null;

    try {
      // Summarize the results using a conversational tone.
      const spokenText = await craftVoiceReply(transcript, command, executionResult);
      // Synthesize speech audio so the client can play it back to the user.
      const audioData = await synthesizeVoiceAudio(spokenText);
      voicePayload = {
        text: spokenText,
        audioBase64: audioData.audioBase64,
        mimeType: audioData.mimeType,
      };
    } catch (voiceError) {
      console.warn('[Voice Command] Unable to generate voice response:', voiceError);
    }

    return NextResponse.json({
      success: true,
      transcript,
      command,
      result: executionResult,
      voice: voicePayload,
    });
  } catch (error) {
    console.error('[Voice Command] Error:', error);
    const message = error instanceof Error ? error.message : 'Voice command failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

