/**
 * AI Admin Streaming Chat API
 * 
 * Server-Sent Events (SSE) endpoint for real-time streaming responses
 */

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import * as conversationManager from '@/lib/ai-admin/conversation-manager';
import { getAIAdminAgent } from '@/lib/ai-admin/agent';

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
    const { conversationId, message, userId, mode = 'chat' } = await request.json();

    if (!conversationId || !message || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify user owns the conversation
    const conversation = await conversationManager.getConversation(
      conversationId,
      userId
    );

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    // Save user message
    await conversationManager.saveMessage(
      conversationId,
      'user',
      message
    );

    // Create a TransformStream for SSE
    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    // Start streaming in the background
    (async () => {
      try {
        let fullResponse = '';

        if (mode === 'patch') {
          // Patch mode: Generate patch with streaming
          const agent = getAIAdminAgent();
          
          // Send status update
          await writer.write(
            encoder.encode(`data: ${JSON.stringify({ type: 'status', content: 'Analyzing codebase...' })}\n\n`)
          );

          const result = await agent.generatePatch(message);
          
          // Stream the patch description
          const description = result.description || 'Patch generated successfully';
          for (let i = 0; i < description.length; i += 10) {
            const chunk = description.slice(i, i + 10);
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
              patchId: result.patchId,
              summary: result.summary,
              files: result.files 
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

    // Return SSE response
    return new NextResponse(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('[Stream API] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
