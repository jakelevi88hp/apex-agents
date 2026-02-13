/**
 * AI Admin Streaming Chat API
 * 
 * Server-Sent Events (SSE) endpoint for real-time streaming responses
 * SECURITY: Requires Bearer token authentication and rate limiting
 */

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import * as conversationManager from '@/lib/ai-admin/conversation-manager';
import { getAIAdminAgent } from '@/lib/ai-admin/agent';
import { verifyRequestToken } from '@/lib/middleware/auth-middleware';
import { checkRateLimit, RATE_LIMITS } from '@/lib/middleware/rate-limit';
import { applySecurityHeaders } from '@/lib/middleware/security-headers';

// Lazy initialization to avoid build-time errors
let openaiInstance: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!openaiInstance) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }
    openaiInstance = new OpenAI({ apiKey });
  }
  return openaiInstance;
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Step 1: Verify authentication
    const user = verifyRequestToken(request);
    if (!user) {
      return NextResponse.json(
        { 
          error: 'Unauthorized', 
          message: 'Missing or invalid authentication token. Please provide a valid Bearer token.' 
        },
        { status: 401 }
      );
    }

    // Step 2: Check rate limit
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               user.userId;
    
    if (!checkRateLimit(ip, RATE_LIMITS.api)) {
      return NextResponse.json(
        { 
          error: 'Too Many Requests', 
          message: 'Rate limit exceeded. Please try again later.' 
        },
        { status: 429, headers: { 'Retry-After': '60' } }
      );
    }

    // Step 3: Parse and validate request body
    let body: any;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        { 
          error: 'Bad Request', 
          message: 'Invalid JSON in request body' 
        },
        { status: 400 }
      );
    }

    const { conversationId, message, userId, mode = 'chat' } = body;

    // Step 4: Validate required fields
    if (!conversationId || !message || !userId) {
      return NextResponse.json(
        { 
          error: 'Bad Request', 
          message: 'Missing required fields: conversationId, message, userId' 
        },
        { status: 400 }
      );
    }

    // Step 5: Verify user authorization
    // Ensure the authenticated user matches the requested userId
    if (user.userId !== userId) {
      console.warn('[AI Admin Stream] Unauthorized access attempt:', {
        authenticatedUser: user.userId,
        requestedUser: userId,
      });
      return NextResponse.json(
        { 
          error: 'Forbidden', 
          message: 'You do not have permission to access this conversation' 
        },
        { status: 403 }
      );
    }

    // Step 6: Verify user owns the conversation
    const conversation = await conversationManager.getConversation(
      conversationId,
      userId
    );

    if (!conversation) {
      return NextResponse.json(
        { 
          error: 'Not Found', 
          message: 'Conversation not found or access denied' 
        },
        { status: 404 }
      );
    }

    // Step 7: Save user message
    await conversationManager.saveMessage(
      conversationId,
      'user',
      message
    );

    // Step 8: Create a TransformStream for SSE
    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    // Create response with proper headers
    const response = new NextResponse(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });

    // Apply security headers
    applySecurityHeaders(response);

    // Step 9: Start streaming in the background
    (async () => {
      try {
        console.log('[AI Admin Stream] Starting stream for user:', userId, 'mode:', mode);
        let fullResponse = '';

        if (mode === 'patch') {
          // Patch mode: Generate patch with streaming
          const agent = getAIAdminAgent();
          
          // Send status update
          await writer.write(
            encoder.encode(`data: ${JSON.stringify({ type: 'status', content: 'Analyzing codebase...' })}\n\n`)
          );

          const patchRecord = await agent.generatePatch(message);
          let parsedPatch: { summary?: string; description?: string; files?: Array<{ path: string; action: string }> } = {};

          try {
            parsedPatch = JSON.parse(patchRecord.patch || '{}');
          } catch (parseError) {
            console.warn('[Stream] Failed to parse patch JSON:', parseError);
          }

          const summaryText = parsedPatch.summary || 'Patch generated successfully';
          const descriptionText = parsedPatch.description || summaryText;
          const files = Array.isArray(parsedPatch.files) ? parsedPatch.files : [];

          for (let i = 0; i < descriptionText.length; i += 10) {
            const chunk = descriptionText.slice(i, i + 10);
            fullResponse += chunk;
            await writer.write(
              encoder.encode(`data: ${JSON.stringify({ type: 'chunk', content: chunk })}\n\n`)
            );
            await new Promise(resolve => setTimeout(resolve, 20)); // Simulate streaming
          }

          // Send patch data
          await writer.write(
            encoder.encode(`data: ${JSON.stringify({ 
              type: 'patch', 
              patchId: patchRecord.id,
              summary: summaryText,
              files 
            })}\n\n`)
          );

        } else {
          // Chat mode: Regular conversation
          // Get conversation history for context
          const history = await conversationManager.getConversationHistory(
            conversationId
          );

          // Get codebase context
          const agent = getAIAdminAgent();
          const context = await agent.getContext(message);

          // Prepare messages for OpenAI
          const systemMessage = {
            role: 'system' as const,
            content: `You are an AI assistant helping with the codebase. Here is relevant context:\n\n${context}\n\nAnswer the user's question based on this context.`,
          };

          const messages = [
            systemMessage,
            ...history.slice(-10).map((msg) => ({
              role: msg.role as 'user' | 'assistant',
              content: msg.content,
            })),
          ];

          // Stream OpenAI response
          const openai = getOpenAI();
          const completion = await openai.chat.completions.create({
            model: 'gpt-4-turbo',
            messages,
            stream: true,
            temperature: 0.7,
          });

          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              fullResponse += content;
              await writer.write(
                encoder.encode(`data: ${JSON.stringify({ type: 'chunk', content })}\n\n`)
              );
            }
          }
        }

        // Save assistant message
        await conversationManager.saveMessage(
          conversationId,
          'assistant',
          fullResponse
        );

        // Send done signal
        await writer.write(
          encoder.encode(`data: ${JSON.stringify({ type: 'done', fullMessage: fullResponse })}\n\n`)
        );

        console.log('[AI Admin Stream] Stream completed successfully for user:', userId);

      } catch (error) {
        console.error('[Stream] Error:', error);
        await writer.write(
          encoder.encode(`data: ${JSON.stringify({ 
            type: 'error', 
            message: error instanceof Error ? error.message : 'Unknown error' 
          })}\n\n`)
        );
      } finally {
        await writer.close();
      }
    })();

    return response;

  } catch (error) {
    console.error('[Stream API] Error:', error);
    return NextResponse.json(
      { 
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
