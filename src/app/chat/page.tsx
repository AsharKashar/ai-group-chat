'use client';

import { useEffect, useRef } from 'react';
import { useState } from 'react';
import { Expert } from '@/types/chat';
import ChatMessage from '@/components/ChatMessage';
import ChatInput from '@/components/ChatInput';
import ExpertPanel from '@/components/ExpertPanel';
import { Navigation } from '@/components/Navigation';
import { useStreamingChat } from '@/hooks/useStreamingChat';

export default function ChatPage() {
  const [experts, setExperts] = useState<Expert[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { 
    messages, 
    isLoading, 
    currentStreamingExpert, 
    sendMessage, 
    cleanup 
  } = useStreamingChat();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Load experts on component mount
    fetchExperts();
  }, []);

  const fetchExperts = async () => {
    try {
      const response = await fetch('/api/experts');
      const data = await response.json();
      setExperts(data.experts);
    } catch (error) {
      console.error('Error fetching experts:', error);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Navigation />
      <div className="flex flex-1">
        {/* Sidebar with experts */}
        <ExpertPanel experts={experts} />
      
      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <h1 className="text-xl font-semibold text-gray-900">
            Expert Chat
          </h1>
          <p className="text-sm text-gray-500">
            Ask technical questions and get responses from specialized experts
          </p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              <div className="text-6xl mb-4">💬</div>
              <h2 className="text-xl font-medium mb-2">Welcome to Expert Chat!</h2>
              <p className="text-sm">
                Ask any technical question and our AI experts will respond based on their expertise.
                <br />
                Try asking about DevOps, React Native, Backend development, or any other tech topic!
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                expert={experts.find(e => e.id === message.sender.id)}
                allExperts={experts}
              />
            ))
          )}
          {isLoading && !currentStreamingExpert && (
            <div className="flex justify-center py-4">
              <div className="flex items-center space-x-3 bg-blue-50 px-4 py-3 rounded-lg">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <div className="text-blue-700 font-medium">
                  🤖 AI Experts are analyzing your question...
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Typing indicator - above input on left */}
        {currentStreamingExpert && (
          <div className="px-6 pb-2">
            <div className="flex items-center space-x-3 bg-green-50 border border-green-200 px-4 py-3 rounded-lg shadow-sm w-fit">
              <div className="animate-pulse h-2 w-2 bg-green-500 rounded-full"></div>
              <div className="text-green-700 font-medium">
                ✍️ {currentStreamingExpert} is typing...
              </div>
            </div>
          </div>
        )}

        {/* Input */}
        <ChatInput onSendMessage={sendMessage} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
} 