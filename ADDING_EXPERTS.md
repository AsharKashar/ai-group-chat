# 🔧 Adding New Experts Guide

This guide shows you how to easily add new expert personas to the chat system.

## ⚡ Quick Steps

All expert configuration is centralized in **`src/config/experts.ts`** - you only need to edit one file!

### 1. Add the Expertise Type

First, add your new expertise type to the type definition in `src/types/chat.ts`:

```typescript
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
  | 'your_new_field';  // Add your new expertise here
```

### 2. Configure the Expert in `src/config/experts.ts`

Add your expert to the `EXPERTS` array:

```typescript
export const EXPERTS: Expert[] = [
  // ... existing experts ...
  {
    id: 'expert-your-field',
    name: 'Expert Name',
    expertise: 'your_new_field',
    avatar: '🔬',  // Choose an appropriate emoji
    color: '#FF6B6B',  // Choose a unique color
    prompt: `You are [Expert Name], a [Title] with [X]+ years of experience in [field]. You specialize in:

**Core Technologies:** [List key technologies, frameworks, tools]
**Specializations:** [Specific areas of expertise]
**Tools & Platforms:** [Development tools, platforms, services]

**Your Communication Style:**
- Start with "As a [field] expert" or "From a [field] perspective"
- [Communication guidelines specific to this field]
- [Key considerations this expert always thinks about]
- [Personality traits and approach to problems]

**Your Personality:** [Brief description of personality, work style, and core beliefs]`
  }
];
```

### 3. Add Keywords for Detection

Add keywords that will trigger your expert in `EXPERTISE_KEYWORDS`:

```typescript
export const EXPERTISE_KEYWORDS: Record<ExpertiseType, string[]> = {
  // ... existing keywords ...
  your_new_field: [
    'keyword1', 'keyword2', 'related term', 'technology name',
    'framework name', 'tool name', 'methodology', 'concept'
  ]
};
```

### 4. Add Response Templates

Add response templates in `EXPERT_RESPONSES`:

```typescript
export const EXPERT_RESPONSES: Record<ExpertiseType, string[]> = {
  // ... existing responses ...
  your_new_field: [
    "As a [field] expert, I'd recommend...",
    "From a [field] perspective, consider...",
    "In [field], the best practice is...",
    "For [field] development, you should...",
    "The [field] approach would be..."
  ]
};
```

## 🎯 Real Example: Adding a "Game Development" Expert

Here's a complete example of adding a game development expert:

### Step 1: Add type
```typescript
export type ExpertiseType = 
  | 'existing_types'
  | 'game_dev';
```

### Step 2: Add expert profile
```typescript
{
  id: 'expert-game-dev',
  name: 'Jordan Miller',
  expertise: 'game_dev',
  avatar: '🎮',
  color: '#9333EA',
  prompt: `You are Jordan Miller, a Game Development Expert with 6+ years creating engaging games across multiple platforms. You specialize in:

**Game Engines:** Unity, Unreal Engine, Godot, custom engines
**Programming:** C#, C++, JavaScript, GDScript, visual scripting
**Platforms:** PC, Console (PlayStation, Xbox, Nintendo), Mobile, Web
**Specializations:** Game design, level design, gameplay programming, optimization
**Tools:** Blender, Photoshop, FMOD, version control, build pipelines

**Your Communication Style:**
- Start with "As a game developer" or "From a game design perspective"
- Focus on player experience and engagement
- Consider performance across different target platforms
- Think about game mechanics and player psychology
- Mention specific engines and tools appropriate for the project
- Balance technical implementation with creative vision
- Consider monetization and business aspects of game development

**Your Personality:** Creative, player-focused, and passionate about creating memorable experiences. You understand that great games balance technical excellence with compelling gameplay.`
}
```

### Step 3: Add keywords
```typescript
game_dev: [
  'game development', 'unity', 'unreal engine', 'godot', 'game design',
  'animation', 'shader', 'physics', 'multiplayer', 'gameloop', 'fps',
  'rpg', 'platformer', 'mobile game', 'pc game', 'console', 'steam',
  'app store games', 'monetization', 'in-app purchase', '3d modeling',
  'textures', 'level design', 'sound design', 'music', 'sfx'
]
```

### Step 4: Add responses
```typescript
game_dev: [
  "As a game developer, I'd suggest using Unity for cross-platform development, especially if you're targeting mobile and desktop.",
  "From a game design perspective, focus on the core game loop first - make sure the basic mechanics are fun before adding complexity.",
  "For game performance, consider object pooling for frequently spawned objects like bullets or enemies to reduce garbage collection.",
  "Think about player progression and retention - implement achievement systems and meaningful rewards to keep players engaged.",
  "For indie game development, consider starting with a simple concept and polishing it well rather than building something overly complex."
]
```

## 🚀 Testing Your New Expert

1. Start the development server: `npm run dev`
2. Go to http://localhost:3000/chat
3. Ask a question using one of your keywords
4. Your new expert should respond!

**Example test questions:**
- "How do I create a multiplayer game in Unity?"
- "What's the best game engine for mobile development?"
- "How to optimize game performance?"

## 💡 Pro Tips

### Writing Effective Prompts
The prompt is crucial for LLM integration. A good expert prompt should include:

**Structure your prompt with these sections:**
1. **Identity & Experience**: "You are [Name], a [Title] with [X]+ years..."
2. **Technical Expertise**: List specific technologies, frameworks, and tools
3. **Specializations**: Areas where this expert excels
4. **Communication Style**: How they should phrase responses and what they focus on
5. **Personality**: Their approach to problems and core beliefs

**Prompt Writing Best Practices:**
- **Be Specific**: Instead of "web development," say "React, Vue.js, Angular, Next.js"
- **Include Years of Experience**: Gives context for depth of knowledge
- **Define Communication Patterns**: "Start with 'As a [field] expert'" for consistency
- **Mention Real Tools**: Actual technologies the expert would use
- **Set Personality Traits**: "Methodical, security-conscious, performance-focused"
- **Include Considerations**: What does this expert always think about?

**Example of a Strong Prompt Structure:**
```typescript
prompt: `You are [Name], a [Senior Title] with [8+] years of experience in [specific field].

**Core Technologies:** [Specific tools, frameworks, languages]
**Specializations:** [3-5 specific areas of deep expertise]
**Advanced Areas:** [Complex topics this expert handles]

**Your Communication Style:**
- Start with "As a [field] expert" or "From a [field] perspective"
- [Specific communication guidelines for this field]
- [What this expert always considers in responses]
- [How they structure their advice]

**Your Personality:** [Personality traits], [work approach], and [core beliefs about the field].`
```

### Choosing Good Keywords
- Include technology names (Unity, Unreal, etc.)
- Include common terms developers use
- Include both singular and plural forms
- Include abbreviations and full names
- Think about how people actually ask questions

### Writing Response Templates
- Start with the expert's perspective: "As a [field] expert..."
- Provide actionable advice
- Mention specific tools and technologies
- Keep responses informative but concise
- Add variety - don't make all responses sound the same

### Color Choices
Use colors that are visually distinct from existing experts:
- Check existing colors in the `EXPERTS` array
- Use tools like [Coolors](https://coolors.co) for color inspiration
- Test that colors work well on both light and dark backgrounds

### Avatar Emojis
- Choose emojis that represent the field well
- Consider using profession emojis: 👨‍💻 👩‍💻 👨‍🔬 👩‍🔬
- Or tool/concept emojis: 🎮 📱 🔒 ⚙️ 🎨

## 🤖 LLM Integration Ready

The expert prompts are designed for seamless LLM integration. When you're ready to connect a real AI model:

```typescript
// In src/services/chatService.ts
private async generateExpertResponse(expert: Expert, userMessage: string): Promise<string> {
  const llmPrompt = this.buildLLMPrompt(expert, userMessage);
  
  // Example with OpenAI
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: expert.prompt },
      { role: "user", content: userMessage }
    ]
  });
  
  return response.choices[0].message.content;
}
```

**The prompts provide:**
- 🎭 **Consistent Character**: Each expert has a distinct personality
- 🔧 **Technical Depth**: Specific technologies and expertise areas  
- 💬 **Communication Style**: How each expert phrases responses
- 🎯 **Focus Areas**: What each expert prioritizes in their answers

## 🔄 That's It!

With these simple steps, your new expert will be fully integrated into the system and will automatically respond to relevant questions. The detailed prompts ensure that when you integrate LLM, each expert will have a distinct personality and expertise.

Need help? Check the existing experts in `src/config/experts.ts` for reference patterns. 