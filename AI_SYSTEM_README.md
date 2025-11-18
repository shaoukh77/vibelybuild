# AI System Architecture - VibelyBuild.AI

## 🎯 Overview

The AI system is designed to make it **extremely easy** to switch between different AI providers (OpenAI, Claude, Gemini, Groq) by changing a single value in one configuration file.

## 📁 File Structure

```
src/lib/ai/
├── index.js          ← Master router (import this in your app)
├── config.js         ← 🔥 SINGLE SOURCE OF TRUTH for model selection
├── openai.js         ← OpenAI adapter
├── anthropic.js      ← Claude adapter
├── gemini.js         ← Google Gemini adapter
└── groq.js           ← Groq adapter
```

## 🚀 Quick Start

### 1. Setup API Keys

Copy `.env.example` to `.env.local` and add your API keys:

```bash
cp .env.example .env.local
```

Add at least one API key:

```env
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=...
GROQ_API_KEY=gsk_...
```

### 2. Select Your AI Provider

Open `src/lib/ai/config.js` and change the provider:

```javascript
export const AI_CONFIG = {
  CODE_GENERATION: {
    provider: 'openai',        // ← Change this to: 'openai', 'anthropic', 'gemini', or 'groq'
    model: 'gpt-4-turbo',      // ← Update model name for selected provider
  },

  TEXT_GENERATION: {
    provider: 'anthropic',     // Can use different providers for different tasks
    model: 'claude-3-5-sonnet-20241022',
  },

  FAST_OPERATIONS: {
    provider: 'groq',          // Groq is great for fast responses
    model: 'llama-3.1-70b-versatile',
  },
}
```

### 3. Use in Your Code

```javascript
import { generateCode, generateText } from '@/lib/ai';

// Generate code (automatically uses configured provider)
const code = await generateCode({
  prompt: 'Create a React login form with validation',
  language: 'javascript',
});

// Generate text
const text = await generateText({
  prompt: 'Explain how authentication works',
});

// Use streaming
for await (const chunk of generateStreamingCode({
  prompt: 'Build a REST API',
})) {
  console.log(chunk);
}
```

## 🎛️ Configuration Options

### Available Providers

| Provider | Speed | Cost | Best For |
|----------|-------|------|----------|
| **OpenAI** | Medium | Medium | Balanced performance |
| **Anthropic (Claude)** | Medium | Medium | Complex reasoning |
| **Gemini** | Fast | Low | Fast responses |
| **Groq** | Very Fast | Free | Speed-critical tasks |

### Available Models

**OpenAI:**
- `gpt-4-turbo` (recommended)
- `gpt-4`
- `gpt-3.5-turbo`

**Anthropic:**
- `claude-3-5-sonnet-20241022` (recommended)
- `claude-3-opus-20240229`
- `claude-3-sonnet-20240229`
- `claude-3-haiku-20240307`

**Gemini:**
- `gemini-1.5-pro` (recommended)
- `gemini-1.5-flash`
- `gemini-pro`

**Groq:**
- `llama-3.1-70b-versatile` (recommended)
- `llama-3.1-8b-instant`
- `mixtral-8x7b-32768`

## 📖 API Reference

### `generateText(options)`

Generate text using the configured provider.

```javascript
const result = await generateText({
  prompt: 'Your prompt here',
  systemPrompt: 'Optional system instructions',
  operationType: 'TEXT_GENERATION',  // or 'CODE_GENERATION', 'FAST_OPERATIONS'
  temperature: 0.7,
  maxTokens: 4096,
});
```

### `generateStreamingText(options)`

Same as `generateText` but streams the response:

```javascript
for await (const chunk of generateStreamingText({
  prompt: 'Your prompt here',
})) {
  console.log(chunk);
}
```

### `generateCode(options)`

Specialized function for code generation:

```javascript
const code = await generateCode({
  prompt: 'Build a user authentication system',
  language: 'javascript',  // or 'python', 'typescript', etc.
  systemPrompt: 'Optional custom instructions',
});
```

### `generateApp(options)`

Generate a complete app with streaming updates (used in build system):

```javascript
for await (const chunk of generateApp({
  prompt: 'Build a todo app with Firebase',
  onStep: (step) => {
    console.log('Step:', step);
  }
})) {
  console.log(chunk);
}
```

### `validateAllKeys()`

Check which API keys are configured and valid:

```javascript
const status = await validateAllKeys();
// Returns: { openai: { valid: true }, anthropic: { valid: false }, ... }
```

### `getConfigInfo()`

Get current configuration:

```javascript
const config = getConfigInfo();
// Returns current provider settings
```

## 🔄 Switching Providers

To switch from one AI provider to another:

1. **Add API key** to `.env.local`
2. **Change provider** in `src/lib/ai/config.js`:

```javascript
CODE_GENERATION: {
  provider: 'anthropic',  // Changed from 'openai' to 'anthropic'
  model: 'claude-3-5-sonnet-20241022',  // Updated model
}
```

3. **Done!** The entire app now uses the new provider.

## 🎨 Custom Adapters

Want to add a new AI provider? Create a new adapter file:

```javascript
// src/lib/ai/my-provider.js
export async function generateText({ prompt, model, temperature }) {
  // Your implementation
}

export async function* generateStreamingText({ prompt, model }) {
  // Your streaming implementation
}

// ... other functions
```

Then add it to `index.js`:

```javascript
import * as myProvider from './my-provider.js';

const ADAPTERS = {
  openai,
  anthropic,
  gemini,
  groq,
  myProvider,  // Add here
};
```

## 🔍 Error Handling

The system includes built-in validation:

```javascript
try {
  const result = await generateCode({ prompt: 'Build an app' });
} catch (error) {
  if (error.message.includes('not configured')) {
    // API key missing
  } else if (error.message.includes('Unknown AI provider')) {
    // Invalid provider in config
  } else {
    // Other errors
  }
}
```

## 📊 Cost Optimization

Different operations use different providers to optimize cost:

- **Code Generation**: High-quality model (GPT-4, Claude Opus)
- **Text Generation**: Balanced model (GPT-3.5, Claude Sonnet)
- **Fast Operations**: Speed-optimized (Groq, Gemini Flash)

Configure each in `config.js`:

```javascript
CODE_GENERATION: { provider: 'anthropic', model: 'claude-3-opus' },
TEXT_GENERATION: { provider: 'openai', model: 'gpt-3.5-turbo' },
FAST_OPERATIONS: { provider: 'groq', model: 'llama-3.1-8b-instant' },
```

## 🐛 Debugging

Enable debug logging in `.env.local`:

```env
DEBUG=true
```

Check console for:
- `[Build {id}] Starting AI generation...`
- `[Build {id}] Step 1: ...`
- `[Build {id}] AI generation completed`

## 🔒 Security

- API keys are **never** exposed to the client
- All AI calls happen server-side in API routes
- Environment variables are validated on startup

## 💡 Best Practices

1. **Use the right provider for the task**
   - Complex reasoning → Claude
   - Speed → Groq
   - Balance → OpenAI

2. **Adjust temperature**
   - Code generation: 0.3 (consistent)
   - Creative text: 0.9 (varied)
   - Normal: 0.7

3. **Handle streaming properly**
   - Always use `for await` with generators
   - Close streams on errors

4. **Monitor costs**
   - Use cheaper models for simple tasks
   - Enable caching when possible
   - Set appropriate token limits

## 📝 Example: Complete Build Flow

```javascript
// In your API route
import { generateApp } from '@/lib/ai';
import { appendBuildStep, updateBuildStatus } from '@/lib/firestore';

export async function POST(req) {
  const { prompt, buildId } = await req.json();

  await updateBuildStatus(buildId, 'running');

  for await (const chunk of generateApp({
    prompt,
    onStep: async (step) => {
      await appendBuildStep(buildId, step);
    }
  })) {
    // Process chunks
  }

  await updateBuildStatus(buildId, 'complete');
}
```

## 🎯 Summary

- **One config file** controls everything
- **Change one value** to switch providers
- **Consistent API** across all providers
- **Built-in validation** and error handling
- **Production ready** with proper security

That's it! You can now easily switch between AI providers anytime.
