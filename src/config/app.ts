// Application configuration
export const APP_CONFIG = {
  // OpenAI Configuration
  USE_OPENAI: process.env.NODE_ENV === 'production' || process.env.OPENAI_API_KEY !== undefined,
  OPENAI_MODEL: 'gpt-3.5-turbo',
  MAX_TOKENS: 300,
  TEMPERATURE: 0.7,
  
  // Chat Configuration
  MAX_CHAT_HISTORY: 15, // Number of previous messages to include as context
  
  // Development
  DEBUG_LOGGING: process.env.NODE_ENV === 'development',
  
  // Rate Limiting (for future implementation)
  MAX_REQUESTS_PER_MINUTE: 20,
  
  // Expert Response Configuration
  FALLBACK_TO_MOCK: true, // Whether to fallback to mock responses if OpenAI fails
  PARALLEL_EXPERT_REQUESTS: true, // Whether to generate expert responses in parallel
} as const;

export type AppConfig = typeof APP_CONFIG; 