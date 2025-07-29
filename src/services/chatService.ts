import { Message, ChatSession, Expert, ExpertiseType } from '@/types/chat';
import { 
  EXPERTS, 
  EXPERTISE_KEYWORDS, 
  EXPERT_RESPONSES, 
  DEFAULT_EXPERTS,
  GREETING_EXPERTS,
  ACKNOWLEDGMENT_EXPERTS,
  getExpertByExpertise 
} from '@/config/experts';
import { openaiService } from './openaiService';
import { v4 as uuidv4 } from 'uuid';

// In-memory storage for chat sessions (in production, use a database)
const chatSessions: Map<string, ChatSession> = new Map();

export class ChatService {
  // Analyze message to determine which experts should respond
  public analyzeMessageForExpertise(content: string): ExpertiseType[] {
    const messageContent = content.toLowerCase();
    const requiredExpertise: ExpertiseType[] = [];

    // CHECK FOR DIRECT EXPERT MENTIONS FIRST - HIGHEST PRIORITY
    const expertMentions = EXPERTS.filter(expert => 
      messageContent.includes(expert.name.toLowerCase())
    );

    // Also check for questions about specific expert's expertise or directed to them
    const expertiseQuestions = EXPERTS.filter(expert => {
      const patterns = [
        `what are ${expert.name.toLowerCase()}'s expertise`,
        `what is ${expert.name.toLowerCase()}'s expertise`,
        `${expert.name.toLowerCase()}'s expertise`,
        `what are your expertise ${expert.name.toLowerCase()}`,
        `what is your expertise ${expert.name.toLowerCase()}`,
        `what are ${expert.name.toLowerCase()} expertise`,
        `what does ${expert.name.toLowerCase()} do`,
        `${expert.name.toLowerCase()} skills`,
        `my question is from ${expert.name.toLowerCase()}`,
        `question is from ${expert.name.toLowerCase()}`,
        `asking ${expert.name.toLowerCase()}`,
        `for ${expert.name.toLowerCase()}`
      ];
      return patterns.some(pattern => messageContent.includes(pattern));
    });

    const mentionedExperts = [...expertMentions, ...expertiseQuestions];

    if (mentionedExperts.length > 0) {
      // If specific experts are mentioned by name or asked about, ONLY those experts should respond
      mentionedExperts.forEach(expert => {
        requiredExpertise.push(expert.expertise);
      });
      return [...new Set(requiredExpertise)];
    }

    // Check for requests that want ALL experts to respond
    const allExpertPatterns = [
      'all experts', 'each of you', 'introduce yourselves', 'all 10 experts',
      'everyone introduce', 'all of you', 'every expert', 'each expert',
      'all team members', 'whole team'
    ];

    const wantsAllExperts = allExpertPatterns.some(pattern => 
      messageContent.includes(pattern)
    );

    if (wantsAllExperts) {
      // Return all expert types for introduction requests
      return ['backend', 'frontend', 'react_native', 'devops', 'mobile', 'ai_ml', 'database', 'security', 'architecture', 'cloud'];
    }

    // Check if it's a generic/simple question
    const isGenericQuestion = this.isGenericQuestion(content);

    // Check each expertise type for keyword matches
    Object.entries(EXPERTISE_KEYWORDS).forEach(([expertise, keywords]) => {
      const hasKeyword = keywords.some(keyword => 
        messageContent.includes(keyword.toLowerCase())
      );
      
      if (hasKeyword) {
        requiredExpertise.push(expertise as ExpertiseType);
      }
    });

    // Smart logic based on question type and complexity
    if (requiredExpertise.length === 0) {
      // No specific keywords detected
      if (isGenericQuestion) {
        // Check if it's a pure greeting
        const trimmedContent = content.trim().toLowerCase();
        const pureGreetings = ['hello', 'hi', 'hey', 'hello!', 'hi!', 'hey!', 'good morning', 'good afternoon', 'good evening'];
        
        if (pureGreetings.includes(trimmedContent)) {
          // For pure greetings, just use one friendly expert
          requiredExpertise.push(...GREETING_EXPERTS);
        } else {
          // Check if it's a "I don't have questions" type statement
          const nonQuestionStatements = [
            'i don\'t have any questions',
            'i don\'t need help',
            'no questions for',
            'not interested in',
            'i\'m good with',
            'all set with'
          ];
          
          if (nonQuestionStatements.some(statement => trimmedContent.includes(statement))) {
            // For acknowledgment statements, just use one expert
            requiredExpertise.push(...ACKNOWLEDGMENT_EXPERTS);
          } else {
            // For other generic questions/statements, use just one expert to acknowledge
            requiredExpertise.push('backend'); // Most versatile for general questions
          }
        }
      } else {
        // For technical but unspecified questions, use default team
        requiredExpertise.push(...DEFAULT_EXPERTS.slice(0, 2)); // Limit to 2
      }
    } else if (requiredExpertise.length === 1) {
      // Single expertise detected
      if (isGenericQuestion) {
        // Keep it simple for generic questions
        // Don't add complementary experts
      } else {
        // Add one complementary expert for technical questions
        const primaryExpert = requiredExpertise[0];
        const complementaryExperts = this.getComplementaryExperts(primaryExpert);
        if (complementaryExperts.length > 0) {
          requiredExpertise.push(complementaryExperts[0]); // Just add one
        }
      }
    } else if (requiredExpertise.length >= 2) {
      // Multiple expertise detected - this is clearly a complex technical question
      // Keep all detected experts (up to 4 for very complex questions)
      if (requiredExpertise.length > 4) {
        requiredExpertise.splice(4); // Limit to max 4 experts
      }
    }

    return [...new Set(requiredExpertise)]; // Remove duplicates
  }

  // Detect if the question is generic/simple vs technical/complex
  private isGenericQuestion(content: string): boolean {
    const genericIndicators = [
      // Greeting/conversational
      'hello', 'hi', 'hey', 'thanks', 'thank you', 'good morning', 'good afternoon', 'good evening',
      // Simple acknowledgments
      'got it', 'ok', 'okay', 'alright', 'sounds good', 'cool', 'nice',
      // Simple questions
      'what is', 'tell me about', 'explain', 'help me understand',
      // Very basic/broad questions
      'how to start', 'getting started', 'beginner', 'basics', 'introduction',
      // Non-technical
      'career', 'advice', 'recommendation', 'opinion', 'thoughts',
      // Statements without questions
      'i don\'t have', 'i don\'t need', 'no questions', 'not interested', 'i\'m good', 'all set'
    ];

    // Check for pure greetings (single words or very short phrases)
    const trimmedContent = content.trim().toLowerCase();
    const pureGreetings = ['hello', 'hi', 'hey', 'hello!', 'hi!', 'hey!', 'good morning', 'good afternoon', 'good evening'];
    
    if (pureGreetings.includes(trimmedContent)) {
      return true;
    }

    // Check for statements that don't require technical advice
    const nonQuestionStatements = [
      'i don\'t have any questions',
      'i don\'t need help',
      'no questions for',
      'not interested in',
      'i\'m good with',
      'all set with'
    ];

    if (nonQuestionStatements.some(statement => trimmedContent.includes(statement))) {
      return true;
    }

    const technicalIndicators = [
      // Specific technologies
      'implement', 'deploy', 'configure', 'setup', 'build',
      // Development terms
      'code', 'development', 'programming', 'software',
      // Architecture terms
      'system', 'architecture', 'design pattern', 'scale',
      // Problem-solving
      'error', 'issue', 'problem', 'debug', 'troubleshoot',
      // Integration
      'integrate', 'connect', 'api', 'database'
    ];

    const contentLower = content.toLowerCase();
    
    const hasGenericIndicators = genericIndicators.some(indicator => 
      contentLower.includes(indicator)
    );
    
    const hasTechnicalIndicators = technicalIndicators.some(indicator => 
      contentLower.includes(indicator)
    );

    // Check if it's a very short question (likely generic)
    const isShortQuestion = content.trim().split(' ').length <= 4;

    // If it has technical indicators, it's not generic
    if (hasTechnicalIndicators) return false;
    
    // If it has generic indicators or is very short, it's generic
    return hasGenericIndicators || isShortQuestion;
  }

  // Get complementary experts for better discussions
  private getComplementaryExperts(primaryExpert: ExpertiseType): ExpertiseType[] {
    const complementaryMap: Record<ExpertiseType, ExpertiseType[]> = {
      devops: ['backend', 'architecture'],
      react_native: ['frontend', 'mobile'],
      frontend: ['backend', 'architecture'],
      backend: ['devops', 'database'],
      ai_ml: ['backend', 'cloud'],
      database: ['backend', 'architecture'],
      security: ['devops', 'backend'],
      architecture: ['devops', 'backend'],
      mobile: ['react_native', 'frontend'],
      cloud: ['devops', 'architecture']
    };

    return complementaryMap[primaryExpert]?.slice(0, 1) || [];
  }

  // Generate expert responses using OpenAI
  private async generateExpertResponse(expert: Expert, userMessage: string, chatHistory?: string): Promise<string> {
    try {
      // Use OpenAI to generate responses based on expert prompts
      return await openaiService.generateExpertResponse(expert, userMessage, chatHistory);
    } catch (error) {
      console.error(`Error generating response for ${expert.name}:`, error);
      // Fallback to mock responses if OpenAI fails
      const expertResponses = EXPERT_RESPONSES[expert.expertise] || EXPERT_RESPONSES.backend;
      return expertResponses[Math.floor(Math.random() * expertResponses.length)];
    }
  }

  // Helper method to build LLM prompt using expert's context
  private buildLLMPrompt(expert: Expert, userMessage: string): string {
    return `${expert.prompt}

**Current Question:** ${userMessage}

**Instructions:** 
- Respond as ${expert.name} in character
- Use your expertise in ${expert.expertise.replace('_', ' ')}
- Keep your response concise but informative (2-3 sentences)
- Follow your established communication style
- Provide actionable advice when possible`;
  }

  // Method to get expert prompt for external LLM integration
  public getExpertPrompt(expertiseType: ExpertiseType): string | undefined {
    const expert = getExpertByExpertise(expertiseType);
    return expert?.prompt;
  }

  // Create a new chat session
  public createChatSession(): ChatSession {
    const sessionId = uuidv4();
    const session: ChatSession = {
      id: sessionId,
      title: 'New Chat',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    chatSessions.set(sessionId, session);
    return session;
  }

  // Get chat session by ID
  public getChatSession(sessionId: string): ChatSession | undefined {
    return chatSessions.get(sessionId);
  }

  // Update existing chat session
  public updateSession(session: ChatSession): void {
    chatSessions.set(session.id, session);
  }

  // Send a message and get expert responses
  public async sendMessage(content: string, sessionId?: string): Promise<{
    userMessage: Message;
    expertResponses: Message[];
    session: ChatSession;
  }> {
    // Get or create session
    let session = sessionId ? this.getChatSession(sessionId) : null;
    if (!session) {
      session = this.createChatSession();
    }

    // Create user message
    const userMessage: Message = {
      id: uuidv4(),
      content,
      timestamp: new Date(),
      sender: {
        id: 'user',
        name: 'You',
        type: 'user'
      }
    };

    // Add user message to session
    session.messages.push(userMessage);

    // Build chat history for context (last 5 messages)
    const recentMessages = session.messages.slice(-5);
    const chatHistory = recentMessages
      .map(msg => `${msg.sender.name}: ${msg.content}`)
      .join('\n');

    // Analyze message to determine required expertise
    const requiredExpertise = this.analyzeMessageForExpertise(content);

    // Generate expert responses (with parallel processing for better performance)
    const expertResponses: Message[] = [];
    const responsePromises = requiredExpertise.map(async (expertiseType) => {
      const expert = getExpertByExpertise(expertiseType);
      if (expert) {
        try {
          const responseContent = await this.generateExpertResponse(expert, content, chatHistory);
          const response: Message = {
            id: uuidv4(),
            content: responseContent,
            timestamp: new Date(),
            sender: {
              id: expert.id,
              name: expert.name,
              type: 'expert',
              expertise: expert.expertise,
              avatar: expert.avatar
            }
          };
          return response;
        } catch (error) {
          console.error(`Failed to generate response for ${expert.name}:`, error);
          return null;
        }
      }
      return null;
    });

    // Wait for all expert responses
    const responses = await Promise.all(responsePromises);
    
    // Filter out null responses and add to session
    responses.forEach(response => {
      if (response) {
        expertResponses.push(response);
        session!.messages.push(response);
      }
    });

    // Update session
    session.updatedAt = new Date();
    chatSessions.set(session.id, session);

    return {
      userMessage,
      expertResponses,
      session
    };
  }

  // Get all messages for a session
  public getMessages(sessionId: string): Message[] {
    const session = this.getChatSession(sessionId);
    return session?.messages || [];
  }

  // Get all experts
  public getExperts(): Expert[] {
    return EXPERTS;
  }
} 