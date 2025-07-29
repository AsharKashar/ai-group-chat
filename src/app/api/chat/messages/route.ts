import { NextRequest, NextResponse } from 'next/server';
import { ChatService } from '@/services/chatService';
import { SendMessageRequest, SendMessageResponse } from '@/types/chat';

const chatService = new ChatService();

export async function POST(request: NextRequest) {
  try {
    const body: SendMessageRequest = await request.json();
    const { content, sessionId } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message content is required' },
        { status: 400 }
      );
    }

    const result = await chatService.sendMessage(content, sessionId);

    const response: SendMessageResponse = {
      message: result.userMessage,
      expertResponses: result.expertResponses,
      sessionId: result.session.id
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const messages = chatService.getMessages(sessionId);

    return NextResponse.json({
      messages,
      sessionId
    });
  } catch (error) {
    console.error('Error getting messages:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 