import { NextResponse } from 'next/server';
import { ChatService } from '@/services/chatService';

const chatService = new ChatService();

export async function GET() {
  try {
    const experts = chatService.getExperts();
    return NextResponse.json({ experts });
  } catch (error) {
    console.error('Error getting experts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 