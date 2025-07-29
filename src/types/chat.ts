export interface Message {
  id: string;
  content: string;
  timestamp: Date;
  sender: {
    id: string;
    name: string;
    type: 'user' | 'expert';
    expertise?: ExpertiseType;
    avatar?: string;
  };
}

export interface Expert {
  id: string;
  name: string;
  expertise: ExpertiseType;
  avatar: string;
  color: string;
  prompt: string;
}

export type ExpertiseType = 
  | 'devops'
  | 'react_native'
  | 'frontend'
  | 'backend'
  | 'ai_ml'
  | 'database'
  | 'security'
  | 'architecture'
  | 'mobile'
  | 'cloud'
  | 'product_manager';

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SendMessageRequest {
  content: string;
  sessionId?: string;
}

export interface SendMessageResponse {
  message: Message;
  expertResponses: Message[];
  sessionId: string;
}

export interface GetMessagesResponse {
  messages: Message[];
  sessionId: string;
} 