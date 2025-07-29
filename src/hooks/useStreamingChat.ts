import { useState, useRef, useCallback } from 'react';

interface StreamingMessage {
  id: string;
  content: string;
  timestamp: Date;
  sender: {
    id: string;
    name: string;
    type: 'user' | 'expert';
    expertise?: string;
    avatar?: string;
  };
  isStreaming?: boolean;
  isComplete?: boolean;
}

interface StreamingState {
  messages: StreamingMessage[];
  isLoading: boolean;
  currentStreamingExpert: string | null;
  sessionId: string | null;
}

export const useStreamingChat = () => {
  const [state, setState] = useState<StreamingState>({
    messages: [],
    isLoading: false,
    currentStreamingExpert: null,
    sessionId: null
  });

  const eventSourceRef = useRef<EventSource | null>(null);
  const streamingMessagesRef = useRef<Map<string, StreamingMessage>>(new Map());

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    setState(prev => ({ ...prev, isLoading: true, currentStreamingExpert: null }));

    try {
      // Close any existing connection
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }

      // Clear streaming messages map
      streamingMessagesRef.current.clear();

      // Create a POST request to start streaming
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          sessionId: state.sessionId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to start chat stream');
      }

      // Handle the stream
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No reader available');
      }

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              handleStreamEvent(data);
            } catch (error) {
              console.error('Error parsing stream data:', error);
            }
          }
        }
      }

    } catch (error) {
      console.error('Error in streaming chat:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        currentStreamingExpert: null 
      }));
    }
      }, [state.sessionId]);

  const handleStreamEvent = useCallback((data: {
    type: string;
    messageId?: string;
    message?: {
      content: string;
      timestamp: string;
    };
    sessionId?: string;
    expert?: {
      id: string;
      name: string;
      expertise: string;
      avatar: string;
    };
    chunk?: string;
    error?: string;
  }) => {
    switch (data.type) {
      case 'user_message':
        if (!data.message) break;
        
        setState(prev => ({
          ...prev,
          messages: [...prev.messages, {
            ...data.message!,
            timestamp: new Date(data.message!.timestamp),
            isComplete: true
          } as StreamingMessage],
          sessionId: data.sessionId || null
        }));
        break;

      case 'expert_start':
        if (!data.messageId || !data.expert) break;
        
        const startingMessage: StreamingMessage = {
          id: data.messageId,
          content: '',
          timestamp: new Date(),
          sender: {
            id: data.expert.id,
            name: data.expert.name,
            type: 'expert',
            expertise: data.expert.expertise,
            avatar: data.expert.avatar
          },
          isStreaming: true,
          isComplete: false
        };

        streamingMessagesRef.current.set(data.messageId, startingMessage);
        
        setState(prev => ({
          ...prev,
          messages: [...prev.messages, startingMessage],
          currentStreamingExpert: data.expert!.name
        }));
        break;

      case 'expert_chunk':
        if (!data.messageId || !data.chunk) break;
        
        const existingMessage = streamingMessagesRef.current.get(data.messageId);
        if (existingMessage) {
          const updatedMessage = {
            ...existingMessage,
            content: existingMessage.content + data.chunk
          };
          
          streamingMessagesRef.current.set(data.messageId, updatedMessage);
          
          setState(prev => ({
            ...prev,
            messages: prev.messages.map(msg => 
              msg.id === data.messageId ? updatedMessage : msg
            )
          }));
        }
        break;

      case 'expert_complete':
        if (!data.messageId || !data.message) break;
        
        const completedMessage = streamingMessagesRef.current.get(data.messageId);
        if (completedMessage) {
          const finalMessage = {
            ...completedMessage,
            content: data.message.content,
            timestamp: new Date(data.message.timestamp),
            isStreaming: false,
            isComplete: true
          };

          setState(prev => ({
            ...prev,
            messages: prev.messages.map(msg => 
              msg.id === data.messageId ? finalMessage : msg
            ),
            currentStreamingExpert: null
          }));
        }
        break;

      case 'expert_error':
        if (!data.messageId) break;
        
        setState(prev => ({
          ...prev,
          messages: prev.messages.map(msg => 
            msg.id === data.messageId 
              ? { 
                  ...msg, 
                  content: `❌ ${data.error}`, 
                  isStreaming: false, 
                  isComplete: true 
                }
              : msg
          ),
          currentStreamingExpert: null
        }));
        break;

      case 'complete':
        setState(prev => ({
          ...prev,
          isLoading: false,
          currentStreamingExpert: null
        }));
        break;

      case 'error':
        console.error('Stream error:', data.error);
        setState(prev => ({
          ...prev,
          isLoading: false,
          currentStreamingExpert: null
        }));
        break;
    }
  }, []);

  const cleanup = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  }, []);

  return {
    messages: state.messages,
    isLoading: state.isLoading,
    currentStreamingExpert: state.currentStreamingExpert,
    sessionId: state.sessionId,
    sendMessage,
    cleanup
  };
}; 