# Expert Chat Bot

A Next.js application featuring a group chat interface where AI experts respond to technical questions based on their areas of expertise.

## 🚀 Features

- **🤖 OpenAI-Powered Experts**: Real AI responses using GPT-4o-mini with unique expert personalities
- **Multi-Expert AI Chat**: Different AI personas respond based on question type
- **Specialized Experts**: 10 experts covering DevOps, React Native, Frontend, Backend, AI/ML, Database, Security, Architecture, Mobile, and Cloud
- **Intelligent Question Analysis**: Automatically determines which experts should respond
- **Real-time Chat Interface**: Modern group chat UI with message bubbles and expert avatars
- **Expert Panel**: Sidebar showing all available experts with their specializations
- **Session Management**: Maintains chat history and context
- **Context-Aware Responses**: Each expert receives conversation history for better context
- **Intelligent Fallbacks**: Graceful handling of API errors with mock response fallbacks

## 🛠 Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes (serverless functions)
- **State Management**: React hooks (useState, useEffect)
- **Styling**: Tailwind CSS with responsive design
- **Package Management**: npm

## 📁 Project Structure

```
expert-chat-bot/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat/
│   │   │   │   └── messages/
│   │   │   │       └── route.ts          # Send/receive messages endpoint
│   │   │   └── experts/
│   │   │       └── route.ts              # Get experts list endpoint
│   │   ├── chat/
│   │   │   └── page.tsx                  # Main chat interface
│   │   ├── globals.css                   # Global styles
│   │   ├── layout.tsx                    # Root layout
│   │   └── page.tsx                      # Home page (redirects to chat)
│   ├── components/
│   │   ├── ChatInput.tsx                 # Message input component
│   │   ├── ChatMessage.tsx               # Individual message component
│   │   └── ExpertPanel.tsx               # Experts sidebar component
│   ├── config/
│   │   └── experts.ts                    # ⭐ Centralized expert configuration
│   ├── services/
│   │   └── chatService.ts                # Chat business logic and AI responses
│   └── types/
│       └── chat.ts                       # TypeScript interfaces
├── ADDING_EXPERTS.md                     # 📋 Step-by-step guide for adding experts
├── package.json
└── README.md
```

## 🏗 Architecture

### Backend Structure

1. **Service Layer** (`src/services/chatService.ts`)
   - `ChatService` class handles all chat logic
   - Message analysis to determine required expertise
   - Mock AI responses (ready for LLM integration)
   - Session management with in-memory storage

2. **API Routes** (`src/app/api/`)
   - `/api/chat/messages` - POST: Send messages, GET: Retrieve messages
   - `/api/experts` - GET: List available experts

3. **Types** (`src/types/chat.ts`)
   - Type definitions for messages, experts, and API responses
   - Ensures type safety across the application

### Frontend Structure

1. **Main Chat Page** (`src/app/chat/page.tsx`)
   - Manages chat state and user interactions
   - Handles API calls to backend services
   - Auto-scrolling to new messages

2. **Components**
   - `ChatMessage`: Displays individual messages with expert styling
   - `ChatInput`: Message composition with keyboard shortcuts
   - `ExpertPanel`: Shows available experts and their specializations

## 🎯 Expert System

The application includes 10 specialized AI experts:

| Expert | Expertise | Avatar | Specialization |
|--------|-----------|---------|----------------|
| Alex Thompson | DevOps | 👨‍💻 | CI/CD, Docker, Kubernetes, AWS |
| Sarah Chen | React Native | 👩‍💻 | Mobile development, iOS/Android |
| Mike Rodriguez | Frontend | 🎨 | React, Vue, Angular, UI/UX |
| Emily Johnson | Backend | ⚙️ | APIs, databases, server architecture |
| David Kim | AI/ML | 🤖 | Machine Learning, neural networks |
| Lisa Wang | Database | 🗄️ | SQL, NoSQL, query optimization |
| John Smith | Security | 🔒 | Authentication, encryption, vulnerabilities |
| Anna Davis | Architecture | 🏗️ | System design, microservices, scalability |
| Maya Patel | Mobile | 📱 | Cross-platform, native mobile, performance |
| Roberto Santos | Cloud | ☁️ | AWS, Azure, GCP, serverless, cloud-native |

### How Expert Selection Works

The system analyzes incoming messages for keywords and determines which experts should respond:

- **Single Expertise**: Simple questions get one expert response
- **Multiple Expertise**: Complex questions get multiple expert perspectives
- **Keyword Matching**: Advanced pattern matching for technology detection
- **Default Fallback**: General backend/frontend experts for unclassified questions

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd expert-chat-bot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open the application**
   - Navigate to `http://localhost:3000`
   - You'll be automatically redirected to `/chat`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 💬 Usage Examples

Try these sample questions to see different experts respond:

### DevOps Questions
- "How do I deploy a React app with Docker?"
- "What's the best CI/CD pipeline for a Node.js application?"
- "How to set up Kubernetes monitoring with Prometheus?"

### React Native Questions
- "How to implement navigation in React Native?"
- "What's the difference between Expo and bare React Native?"
- "How to optimize performance in mobile apps?"

### Full-Stack Questions
- "How to build a secure authentication system with JWT and React?"
- "What's the best architecture for a real-time chat application?"

## 🔮 Future Enhancements

### Phase 1: LLM Integration
- Replace mock responses with actual LLM API calls
- Implement context-aware conversations
- Add expert personality and speaking styles

### Phase 2: Advanced Features
- User authentication and personalized chat history
- File upload and code snippet support
- Real-time collaborative features
- Expert knowledge base integration

### Phase 3: Enterprise Features
- Custom expert creation
- Team workspaces
- Analytics and insights
- API access for external integrations

## 🛠 Development Notes

### Adding New Experts

**🎉 Adding experts is now super easy!** All expert configuration is centralized in `src/config/experts.ts`.

**Quick Steps:**
1. Add expertise type to `src/types/chat.ts`
2. Add expert profile to `EXPERTS` array in `src/config/experts.ts`
3. Add keywords to `EXPERTISE_KEYWORDS` 
4. Add response templates to `EXPERT_RESPONSES`

**📋 For detailed step-by-step instructions, see [ADDING_EXPERTS.md](./ADDING_EXPERTS.md)**

**Example:** Adding a game development expert takes just a few lines:
```typescript
// In src/config/experts.ts
{
  id: 'expert-game-dev',
  name: 'Jordan Miller',
  expertise: 'game_dev',
  avatar: '🎮',
  color: '#9333EA'
}
```

### ✅ OpenAI Integration Complete!

**The system is now fully integrated with OpenAI!** Simply add your API key to `.env.local`:

```bash
OPENAI_API_KEY=your_openai_api_key_here
```

**Features:**
- 🤖 **Real AI Responses**: Each expert uses GPT-4o-mini with their detailed prompts
- 🎭 **Unique Personalities**: Every expert maintains their distinct character and expertise
- 📝 **Intelligent Fallbacks**: Automatically falls back to mock responses if OpenAI fails
- ⚡ **Parallel Processing**: Multiple experts respond simultaneously for faster responses
- 🔧 **Configurable**: Easy to toggle between OpenAI and mock responses

**How it works:**
1. **Expert Selection**: Keywords in your question determine which experts respond
2. **Context Aware**: Each expert receives chat history for better context
3. **Personality Driven**: Detailed prompts ensure each expert responds in character
4. **Error Handling**: Graceful fallbacks ensure the chat always works

**Each expert prompt includes:**
- 🎭 Detailed personality and communication style
- 🔧 Specific technologies and expertise areas
- 💼 Years of experience and professional background
- 🗣️ Consistent response patterns and language

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For questions or support, please open an issue in the repository.

---

**Built with ❤️ using Next.js and TypeScript**
