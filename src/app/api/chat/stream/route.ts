import { NextRequest, NextResponse } from 'next/server';
import { ChatService } from '@/services/chatService';
import { openaiService } from '@/services/openaiService';
import { getExpertByExpertise } from '@/config/experts';
import { v4 as uuidv4 } from 'uuid';

const chatService = new ChatService();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, sessionId } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message content is required' },
        { status: 400 }
      );
    }

    // Set up streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Get or create session
          let session = sessionId ? chatService.getChatSession(sessionId) : null;
          if (!session) {
            session = chatService.createChatSession();
          }

          // Create user message
          const userMessage = {
            id: uuidv4(),
            content,
            timestamp: new Date(),
            sender: {
              id: 'user',
              name: 'You',
              type: 'user' as const
            }
          };

          // Add user message to session
          session.messages.push(userMessage);

          // Build chat history for context
          const recentMessages = session.messages.slice(-5);
          const chatHistory = recentMessages
            .map(msg => `${msg.sender.name}: ${msg.content}`)
            .join('\n');

          // Send user message
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'user_message',
            message: userMessage,
            sessionId: session.id
          })}\n\n`));

          // Analyze message to determine required expertise
          const requiredExpertise = chatService.analyzeMessageForExpertise(content);

          // Process experts sequentially (one by one)
          const currentExpertResponses: string[] = [];
          
          for (const expertiseType of requiredExpertise) {
            const expert = getExpertByExpertise(expertiseType);
            if (!expert) continue;

            const expertMessageId = uuidv4();
            
            // Send expert start event
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              type: 'expert_start',
              expert: {
                id: expert.id,
                name: expert.name,
                expertise: expert.expertise,
                avatar: expert.avatar
              },
              messageId: expertMessageId
            })}\n\n`));

            // Build context including previous expert responses in this conversation
            let discussionContext = chatHistory;
            if (currentExpertResponses.length > 0) {
              discussionContext += '\n\n**Current Discussion:**\n' + currentExpertResponses.join('\n\n');
            }

            // Stream expert response
            let fullResponse = '';
            try {
              for await (const chunk of openaiService.generateExpertResponseStream(expert, content, discussionContext)) {
                fullResponse += chunk;
                
                // Send streaming chunk
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                  type: 'expert_chunk',
                  messageId: expertMessageId,
                  chunk,
                  expert: {
                    id: expert.id,
                    name: expert.name
                  }
                })}\n\n`));
              }

              // Create complete expert message
              const expertMessage = {
                id: expertMessageId,
                content: fullResponse,
                timestamp: new Date(),
                sender: {
                  id: expert.id,
                  name: expert.name,
                  type: 'expert' as const,
                  expertise: expert.expertise,
                  avatar: expert.avatar
                }
              };

              // Add to session
              session!.messages.push(expertMessage);

              // Add to current discussion context for next experts
              currentExpertResponses.push(`${expert.name}: ${fullResponse}`);

              // Send expert complete event
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                type: 'expert_complete',
                messageId: expertMessageId,
                message: expertMessage
              })}\n\n`));

            } catch (error) {
              console.error(`Error streaming response for ${expert.name}:`, error);
              
              // Send error event
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                type: 'expert_error',
                messageId: expertMessageId,
                error: `Failed to generate response from ${expert.name}`
              })}\n\n`));
            }
          }

          // Update session
          session!.updatedAt = new Date();
          chatService.updateSession(session!);

          // Send completion event
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'complete',
            sessionId: session!.id
          })}\n\n`));

          controller.close();
        } catch (error) {
          console.error('Streaming error:', error);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'error',
            error: 'Internal server error'
          })}\n\n`));
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });

  } catch (error) {
    console.error('Error in streaming endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 