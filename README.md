# AI Expert Group Chat

A Next.js application featuring two chat modes: **Multi-Expert Chat** (custom OpenAI integration) and **Product Manager Chat** (CopilotKit integration).

## 🚀 Quick Setup

### Prerequisites
- Node.js 18+
- OpenAI API Key

### Installation

1. **Clone and install**
   ```bash
   git clone github-alt:AsharKashar/ai-group-chat.git
   cd ai-group-chat
   npm install
   ```

2. **Environment setup**
   ```bash
   # Create .env.local file
   echo "OPENAI_API_KEY=your_openai_api_key_here" > .env.local
   ```

3. **Start development**
   ```bash
   npm run dev
   ```

4. **Open application**
   - Navigate to `http://localhost:3000`
   - Choose between Multi-Expert Chat or Product Manager Chat

## 🎯 Features

### Multi-Expert Chat
- **10 AI Experts**: DevOps, React Native, Frontend, Backend, AI/ML, Database, Security, Architecture, Mobile, Cloud, Product Manager
- **Smart Routing**: Questions automatically routed to relevant experts
- **Streaming Responses**: Real-time chat with typing indicators
- **Custom OpenAI Integration**: Direct API calls with expert personalities

### Product Manager Chat  
- **CopilotKit Integration**: Modern chat framework
- **Sarah Chen**: Specialized Product Manager AI expert
- **Context Awareness**: Understands product strategy and user research

## 🛠 Tech Stack

- **Framework**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **AI**: OpenAI GPT-4, CopilotKit
- **State**: React hooks

## 📁 Key Files

```
src/
├── app/
│   ├── api/
│   │   ├── chat/stream/          # Multi-expert streaming
│   │   └── copilotkit/           # CopilotKit endpoint
│   ├── chat/                     # Multi-expert page
│   └── product-manager/          # CopilotKit page
├── components/
│   ├── ProductManagerChat.tsx    # CopilotKit chat
│   └── [other components]
├── config/
│   └── experts.ts                # Expert definitions
└── services/
    └── openaiService.ts          # OpenAI integration
```

## 🔧 Available Scripts

- `npm run dev` - Development server
- `npm run build` - Production build  
- `npm run start` - Production server
- `npm run lint` - ESLint

## 🚀 Usage

### Multi-Expert Chat
Ask technical questions and get responses from relevant experts:
- "How do I deploy with Docker?" → DevOps expert responds
- "React Native navigation?" → Mobile expert responds
- "Database optimization?" → Database expert responds

### Product Manager Chat
Discuss product strategy with Sarah Chen:
- "How to prioritize features?"
- "User research best practices?"
- "Product roadmap planning?"

## 🔑 Environment Variables

```bash
OPENAI_API_KEY=sk-...    # Required for both chat modes
```

## 📝 Adding Experts

Edit `src/config/experts.ts`:
1. Add expertise type to `ExpertiseType`
2. Add expert to `EXPERTS` array
3. Add keywords to `EXPERTISE_KEYWORDS`
4. Add responses to `EXPERT_RESPONSES`

See `ADDING_EXPERTS.md` for detailed guide.

---

**Built with Next.js, TypeScript, OpenAI, and CopilotKit**
