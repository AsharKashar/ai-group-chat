'use client';

import { Message, Expert } from '@/types/chat';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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

interface ChatMessageProps {
  message: Message | StreamingMessage;
  expert?: Expert;
  allExperts?: Expert[];
}

// Parse reply information from message content
function parseReply(content: string, allExperts?: Expert[]) {
  if (!allExperts) return null;
  
  // Check if message starts with "ExpertName:" pattern
  const replyMatch = content.match(/^(.+?):\s*([\s\S]+)/);
  if (!replyMatch) return null;
  
  const [, potentialExpertName, restOfMessage] = replyMatch;
  
  // Find if this matches any expert name
  const referencedExpert = allExperts.find(expert => 
    expert.name.toLowerCase() === potentialExpertName.trim().toLowerCase()
  );
  
  if (!referencedExpert) return null;
  
  // Extract the quoted content (usually the first sentence or paragraph)
  const lines = restOfMessage.trim().split('\n');
  const quotedContent = lines[0]; // First line is usually the quoted content
  
  // Find where the actual new response starts
  let actualResponseStartIndex = 1;
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line && !line.startsWith('"') && !quotedContent.includes(line.substring(0, 20))) {
      actualResponseStartIndex = i;
      break;
    }
  }
  
  const actualResponse = lines.slice(actualResponseStartIndex).join('\n').trim();
  
  return {
    referencedExpert,
    quotedContent: quotedContent.replace(/["""]/g, '').trim(),
    actualResponse: actualResponse || restOfMessage
  };
}

export default function ChatMessage({ message, expert, allExperts }: ChatMessageProps) {
  const isUser = message.sender.type === 'user';
  const expertColor = expert?.color || '#6B7280';
  const isStreaming = 'isStreaming' in message ? message.isStreaming : false;
  
  // Parse reply information for expert messages
  const replyInfo = !isUser ? parseReply(message.content, allExperts) : null;

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs lg:max-w-md xl:max-w-lg ${isUser ? 'order-2' : 'order-1'}`}>
        {/* Reply indicator */}
        {!isUser && replyInfo && (
          <div className="mb-2">
            <div className="flex items-center text-xs text-gray-500 mb-1">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Replying to {replyInfo.referencedExpert.name}
            </div>
            <div 
              className="bg-gray-50 border-l-4 pl-3 py-2 text-xs text-gray-600 italic rounded-r"
              style={{ borderLeftColor: replyInfo.referencedExpert.color || '#6B7280' }}
            >
&ldquo;{replyInfo.quotedContent.substring(0, 100)}{replyInfo.quotedContent.length > 100 ? '...' : ''}&rdquo;
            </div>
          </div>
        )}

        {/* Expert info */}
        {!isUser && (
          <div className="flex items-center mb-1">
            <span className="text-2xl mr-2">{message.sender.avatar}</span>
            <span 
              className="text-sm font-medium"
              style={{ color: expertColor }}
            >
              {message.sender.name}
            </span>
            {message.sender.expertise && (
              <span className="text-xs text-gray-500 ml-2 capitalize">
                {message.sender.expertise.replace('_', ' ')} Expert
              </span>
            )}
          </div>
        )}
        
        {/* Message bubble */}
        <div
          className={`px-4 py-3 rounded-lg ${
            isUser
              ? 'bg-blue-600 text-white'
              : 'bg-white border border-gray-200 text-gray-900'
          }`}
          style={!isUser ? { borderLeftColor: expertColor, borderLeftWidth: '3px' } : {}}
        >
          {isUser ? (
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="text-sm markdown-content">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  // Headings
                  h1: ({ children }) => <h1 className="text-lg font-bold mb-2 text-gray-900">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-base font-bold mb-2 text-gray-900">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-sm font-bold mb-1 text-gray-900">{children}</h3>,
                  
                  // Paragraphs
                  p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
                  
                  // Lists
                  ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
                  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                  
                  // Code
                  code: ({ children, className }) => {
                    const isInline = !className;
                    return isInline ? (
                      <code className="bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-xs font-mono">
                        {children}
                      </code>
                    ) : (
                      <code className="block bg-gray-900 text-gray-100 p-3 rounded-md text-xs font-mono overflow-x-auto whitespace-pre">
                        {children}
                      </code>
                    );
                  },
                  
                  // Pre (code blocks)
                  pre: ({ children }) => (
                    <pre className="bg-gray-900 text-gray-100 p-3 rounded-md text-xs font-mono overflow-x-auto mb-2">
                      {children}
                    </pre>
                  ),
                  
                  // Strong/Bold
                  strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
                  
                  // Em/Italic
                  em: ({ children }) => <em className="italic">{children}</em>,
                  
                  // Links
                  a: ({ children, href }) => (
                    <a 
                      href={href} 
                      className="text-blue-600 hover:text-blue-800 underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {children}
                    </a>
                  ),
                  
                  // Blockquotes
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-gray-300 pl-3 italic text-gray-700 mb-2">
                      {children}
                    </blockquote>
                  ),
                }}
              >
                {replyInfo ? replyInfo.actualResponse : message.content}
              </ReactMarkdown>
              {isStreaming && (
                <span className="inline-block w-2 h-4 bg-blue-500 ml-1 animate-pulse"></span>
              )}
            </div>
          )}
        </div>
        
        {/* Timestamp */}
        <div className={`text-xs text-gray-500 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
          {new Date(message.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
} 