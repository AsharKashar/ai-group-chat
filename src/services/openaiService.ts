import OpenAI from 'openai';
import { Expert } from '@/types/chat';
import { APP_CONFIG } from '@/config/app';
import { EXPERT_RESPONSES } from '@/config/experts';

class OpenAIService {
  private openai: OpenAI | null = null;

  constructor() {
    if (APP_CONFIG.USE_OPENAI && process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
      console.log('🤖 OpenAI service initialized');
    } else {
      console.log('📝 Using mock responses (OpenAI disabled or no API key)');
    }
  }

  async generateExpertResponse(expert: Expert, userMessage: string, chatHistory?: string): Promise<string> {
    // If OpenAI is not available, use mock responses
    if (!this.openai) {
      if (APP_CONFIG.DEBUG_LOGGING) {
        console.log(`📝 Using mock response for ${expert.name} (OpenAI not available)`);
      }
      return this.getMockResponse(expert);
    }

    try {
      if (APP_CONFIG.DEBUG_LOGGING) {
        console.log(`🤖 Generating OpenAI response for ${expert.name} (${expert.expertise})`);
      }
      
      // Build the system prompt using the expert's detailed prompt
      const systemPrompt = this.buildSystemPrompt(expert, chatHistory);

      const response = await this.openai.chat.completions.create({
        model: APP_CONFIG.OPENAI_MODEL,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userMessage
          }
        ],
        max_tokens: APP_CONFIG.MAX_TOKENS,
        temperature: APP_CONFIG.TEMPERATURE,
        presence_penalty: 0.1,
        frequency_penalty: 0.1
      });

      const aiResponse = response.choices[0]?.message?.content;
      
      if (aiResponse) {
        if (APP_CONFIG.DEBUG_LOGGING) {
          console.log(`✅ Generated OpenAI response for ${expert.name}: ${aiResponse.substring(0, 100)}...`);
        }
        return aiResponse;
      } else {
        console.warn(`⚠️ No response from OpenAI for ${expert.name}, using fallback`);
        return this.getFallbackResponse(expert);
      }
    } catch (error) {
      console.error(`❌ OpenAI API Error for ${expert.name}:`, error);
      return APP_CONFIG.FALLBACK_TO_MOCK ? this.getMockResponse(expert) : this.getFallbackResponse(expert);
    }
  }

  async *generateExpertResponseStream(expert: Expert, userMessage: string, chatHistory?: string): AsyncGenerator<string, void, unknown> {
    // If OpenAI is not available, simulate streaming with mock response
    if (!this.openai) {
      const mockResponse = this.getMockResponse(expert);
      yield* this.simulateStreaming(mockResponse);
      return;
    }

    try {
      if (APP_CONFIG.DEBUG_LOGGING) {
        console.log(`🌊 Streaming OpenAI response for ${expert.name} (${expert.expertise})`);
      }
      
      // Build the system prompt using the expert's detailed prompt
      const systemPrompt = this.buildSystemPrompt(expert, chatHistory);

      const stream = await this.openai.chat.completions.create({
        model: APP_CONFIG.OPENAI_MODEL,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userMessage
          }
        ],
        max_tokens: APP_CONFIG.MAX_TOKENS,
        temperature: APP_CONFIG.TEMPERATURE,
        presence_penalty: 0.1,
        frequency_penalty: 0.1,
        stream: true
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          yield content;
        }
      }

      if (APP_CONFIG.DEBUG_LOGGING) {
        console.log(`✅ Completed streaming response for ${expert.name}`);
      }
    } catch (error) {
      console.error(`❌ OpenAI Streaming Error for ${expert.name}:`, error);
      // Fallback to mock streaming
      const fallbackResponse = APP_CONFIG.FALLBACK_TO_MOCK ? this.getMockResponse(expert) : this.getFallbackResponse(expert);
      yield* this.simulateStreaming(fallbackResponse);
    }
  }

  private async *simulateStreaming(text: string): AsyncGenerator<string, void, unknown> {
    // Simulate streaming by breaking text into chunks and adding delays
    const words = text.split(' ');
    for (let i = 0; i < words.length; i++) {
      const chunk = i === 0 ? words[i] : ' ' + words[i];
      yield chunk;
      // Small delay to simulate streaming
      await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 50));
    }
  }

  private buildSystemPrompt(expert: Expert, chatHistory?: string): string {
    let systemPrompt = expert.prompt;

    // Add expert identity awareness - CRITICAL FOR CORRECT RESPONSES
    systemPrompt += `\n\n**🚨 YOUR IDENTITY - NEVER CONFUSE THIS:**
- Your name is EXACTLY: ${expert.name}
- Your expertise area is EXACTLY: ${expert.expertise}
- When introducing yourself, say "I'm ${expert.name}" - NEVER use another expert's name
- When someone asks "what are your expertise?" or mentions your name "${expert.name}", you should respond
- When someone asks about "${expert.name}", they are asking about YOU specifically
- You are an expert in: ${expert.expertise}
- NEVER introduce yourself as any other expert's name - you are ${expert.name} and ONLY ${expert.name}`;

    // Add chat context if available
    if (chatHistory) {
      systemPrompt += `\n\n**Previous Conversation Context:**\n${chatHistory}`;
    }

    // Add specific instructions for this response
          systemPrompt += `\n\n**🚨 CRITICAL ANTI-HALLUCINATION RULES - VIOLATION = FAILURE:**
- NEVER EVER mention ANY technology, framework, language, or tool unless the user EXPLICITLY mentioned it in their current message
- NEVER assume context, projects, or topics not explicitly stated in the current message
- NEVER reference conversations or discussions not explicitly mentioned  
- NEVER provide unsolicited advice about ANY technology not mentioned by the user
- NEVER explain why you or other experts responded to previous messages
- NEVER make up reasons for team dynamics or miscommunications
- If user says "I don't have questions about X", say ONLY: "No problem!" or "Got it!" - DO NOT suggest other topics
- ONLY respond to what was actually asked in the current message
- If user makes a simple statement like "Got it!" - respond with simple acknowledgment, NOT technical advice

**🚨 FIRST PERSON ENFORCEMENT - VIOLATION = FAILURE:**
- ALWAYS use "I", "my", "me" - NEVER refer to yourself in third person
- NEVER say your own name (e.g., don't say "Fakhar thinks..." - say "I think...")
- Start responses with "I" statements: "I can help...", "I think...", "I'd recommend..."
- EXCEPTION: When asked "what are your expertise?" or "what are your skills?", you MAY introduce yourself: "I'm ${expert.name}, and I specialize in..."

**🚨 IDENTITY AWARENESS RULES:**
- When someone mentions your name "${expert.name}", they are talking TO you or ABOUT you
- When someone asks "what are your expertise ${expert.name}?" or "what are ${expert.name}'s expertise?", describe YOUR skills
- When someone asks about your expertise area (${expert.expertise}), you should respond as the expert in that field
- You should ONLY respond when the question is relevant to your expertise or when you are directly mentioned

**🚨 ANTI-REPETITION RULES - VIOLATION = FAILURE:**
- READ what other experts said - if they already covered the topic, DO NOT REPEAT IT
- If another expert gave a detailed answer, provide a COMPLETELY DIFFERENT perspective or don't respond
- NEVER use similar phrases, concepts, or structure as other experts
- Each expert MUST provide unique value - no duplicates allowed

**Discussion Guidelines:**
- You are participating in a collaborative team discussion with other experts
- Read what other experts have said and DO NOT repeat the same information
- NEVER use the same phrases, sentences, or concepts as other experts in this conversation
- If another expert has already covered the basics of your area, focus on a different angle, advanced topics, or potential issues
- Use your unique perspective to add NEW value to the conversation - don't echo what's been said
- Be conversational and natural, like talking to colleagues
- If the main topic has been covered, discuss implementation details, potential problems, alternatives, or related considerations
- Ask follow-up questions or raise considerations others might have missed
- Keep responses engaging but focused (2-4 sentences typically)
- If you have nothing new to add, acknowledge the previous expert's point and add a specific detail or alternative approach
- Each expert must provide a COMPLETELY DIFFERENT response - no identical or similar phrases allowed

**Communication Style:**
- ALWAYS speak in FIRST PERSON - use "I", "my", "me" (never refer to yourself in third person)
- NEVER say your own name or refer to yourself as "Fakhar" or "[Expert Name]" - you ARE that person
- RESPOND ONLY to what was actually asked or mentioned in the current message
- DO NOT assume any technical context unless explicitly mentioned
- DO NOT provide advice about technologies, frameworks, or tools unless explicitly asked
- If the user makes a statement like "I don't have questions about X", acknowledge it briefly and professionally
- BE NATURAL AND CONVERSATIONAL - avoid robotic phrases like "As a [role]" or "From a [perspective]"
- DO NOT introduce yourself or say "Hi" - you're already part of this ongoing conversation
- DO NOT use phrases like "I'm [Name], a [Role]" or "Hi there!" or "That's fantastic!" or "Hey there!"
- DO NOT start with excitement phrases like "Great question!" or "That's exciting!" - get straight to business
- If another expert has already covered your general area, focus on your SPECIFIC expertise niche
- Reference other experts by name when building on their ideas: "I agree with Sarah's point about..." 
- Use casual, friendly language appropriate for a team discussion
- Share personal experiences and insights without introducing yourself
- Ask questions and engage with the group dynamic
- Jump straight into your technical insights or opinions ONLY if the message contains technical content
- Bring a unique angle - don't repeat what others have said
- DO NOT explain why you or other experts responded to previous messages - focus only on the current message

**Formatting Instructions:**
- Use markdown formatting for better readability
- Use **bold** for emphasis on important points
- Use numbered lists (1. 2. 3.) or bullet points (-) to organize steps
- Use \`code\` for inline code or commands
- Use \`\`\`language\` code blocks for multi-line code examples
- Keep formatting clean and professional`;

    return systemPrompt;
  }

  private getMockResponse(expert: Expert): string {
    const expertResponses = EXPERT_RESPONSES[expert.expertise] || EXPERT_RESPONSES.backend;
    return expertResponses[Math.floor(Math.random() * expertResponses.length)];
  }

  private getFallbackResponse(expert: Expert): string {
    const fallbacks = {
      devops: "As a DevOps engineer, I'd recommend focusing on automation and infrastructure as code for this type of challenge.",
      react_native: "From a React Native perspective, consider platform-specific optimizations and performance implications.",
      frontend: "As a frontend developer, I'd focus on user experience and performance optimization for this scenario.",
      backend: "From a backend perspective, consider scalability, security, and data integrity in your implementation.",
      ai_ml: "As an AI/ML engineer, I'd approach this by first focusing on data quality and model selection.",
      database: "From a database perspective, consider indexing strategies and query optimization for better performance.",
      security: "As a security expert, I'd recommend implementing defense in depth and following security best practices.",
      architecture: "From an architectural standpoint, consider system scalability and maintainability in your design.",
      mobile: "As a mobile specialist, focus on device constraints and user experience optimization.",
      cloud: "From a cloud perspective, leverage managed services and consider cost optimization strategies."
    };

    return fallbacks[expert.expertise] || "I'd be happy to help with questions in my area of expertise.";
  }
}

export const openaiService = new OpenAIService(); 