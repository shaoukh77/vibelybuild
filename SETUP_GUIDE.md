# VibelyBuild.AI - Setup Guide

## 🚀 Quick Setup (5 minutes)

### Step 1: Install Dependencies

Already done! ✅

```bash
npm install
```

Packages installed:
- `openai` - OpenAI SDK
- `@anthropic-ai/sdk` - Claude SDK
- `@google/generative-ai` - Gemini SDK
- `groq-sdk` - Groq SDK
- All other dependencies

### Step 2: Configure Environment Variables

1. **Copy the example environment file:**

```bash
cp .env.example .env.local
```

2. **Add your API keys:**

Open `.env.local` and add at least **ONE** AI provider key:

```env
# Choose ONE or more providers:

# Option 1: OpenAI (Recommended for getting started)
OPENAI_API_KEY=sk-...

# Option 2: Anthropic (Claude - Great for complex tasks)
ANTHROPIC_API_KEY=sk-ant-...

# Option 3: Google Gemini (Fast and free tier available)
GOOGLE_API_KEY=...

# Option 4: Groq (Super fast, free tier available)
GROQ_API_KEY=gsk_...
```

**Where to get API keys:**
- OpenAI: https://platform.openai.com/api-keys
- Anthropic: https://console.anthropic.com/
- Google Gemini: https://makersuite.google.com/app/apikey
- Groq: https://console.groq.com/

3. **Add Firebase credentials** (if not already set):

```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

### Step 3: Select Your AI Provider

Open `src/lib/ai/config.js`:

```javascript
export const AI_CONFIG = {
  CODE_GENERATION: {
    provider: 'openai',      // ← Change to: 'openai', 'anthropic', 'gemini', or 'groq'
    model: 'gpt-4-turbo',    // ← Update model for selected provider
  },
  // ... rest of config
}
```

**Quick recommendations:**

| If you want... | Use this |
|----------------|----------|
| Best quality | `provider: 'anthropic'`, `model: 'claude-3-5-sonnet-20241022'` |
| Balance | `provider: 'openai'`, `model: 'gpt-4-turbo'` |
| Speed | `provider: 'groq'`, `model: 'llama-3.1-70b-versatile'` |
| Free tier | `provider: 'groq'` or `provider: 'gemini'` |

### Step 4: Test Your Setup

The dev server is already running! Test the AI system:

**Option A: Test via API endpoint**

```bash
# Check configuration
curl http://localhost:3000/api/ai/test

# Test code generation
curl -X POST http://localhost:3000/api/ai/test \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Create a React button"}'
```

**Option B: Test via browser**

1. Go to: http://localhost:3000
2. Sign in with Google
3. Enter a simple app idea: "Todo list app"
4. Click "Build App"
5. Watch the AI generate your app in real-time!

### Step 5: Verify Everything Works

✅ Dev server running on: http://localhost:3000
✅ AI providers configured in: `src/lib/ai/config.js`
✅ API keys set in: `.env.local`
✅ Test endpoint: http://localhost:3000/api/ai/test

## 📚 Next Steps

### Switching AI Providers

To switch providers, just change ONE value in `src/lib/ai/config.js`:

```javascript
// Before (using OpenAI)
CODE_GENERATION: {
  provider: 'openai',
  model: 'gpt-4-turbo',
}

// After (using Claude)
CODE_GENERATION: {
  provider: 'anthropic',
  model: 'claude-3-5-sonnet-20241022',
}
```

That's it! The entire app now uses Claude.

### Advanced Configuration

You can use **different providers for different tasks**:

```javascript
export const AI_CONFIG = {
  // Use Claude for complex code generation
  CODE_GENERATION: {
    provider: 'anthropic',
    model: 'claude-3-5-sonnet-20241022',
  },

  // Use GPT-4 for text
  TEXT_GENERATION: {
    provider: 'openai',
    model: 'gpt-4-turbo',
  },

  // Use Groq for fast operations
  FAST_OPERATIONS: {
    provider: 'groq',
    model: 'llama-3.1-70b-versatile',
  },
}
```

### Cost Optimization

**Free Tiers:**
- Groq: Generous free tier (fastest)
- Gemini: Free tier available
- OpenAI: Pay-as-you-go (credit card required)
- Anthropic: Pay-as-you-go (credit card required)

**Cheapest Options:**
1. Groq (free)
2. Gemini (free tier + cheap)
3. GPT-3.5-turbo (cheap)
4. Claude Haiku (cheap)

### Performance Tips

**For best performance:**

```javascript
CODE_GENERATION: {
  provider: 'groq',  // Fastest
  model: 'llama-3.1-70b-versatile',
}
```

**For best quality:**

```javascript
CODE_GENERATION: {
  provider: 'anthropic',  // Best reasoning
  model: 'claude-3-5-sonnet-20241022',
}
```

**For best balance:**

```javascript
CODE_GENERATION: {
  provider: 'openai',  // Reliable
  model: 'gpt-4-turbo',
}
```

## 🔧 Troubleshooting

### "Provider not configured" error

✅ **Fix:** Add the API key to `.env.local`

```env
OPENAI_API_KEY=sk-...
```

### "Invalid API key" error

✅ **Fix:** Check your API key is correct and has credits

### Build fails silently

✅ **Fix:** Check the console logs:

```bash
# Console will show:
[Build abc123] Starting AI generation...
[Build abc123] Step 1: 🔧 Initializing...
```

### Want to use multiple providers

✅ **Yes!** Configure different providers for different tasks in `config.js`

## 📖 Documentation

- **AI System**: See `AI_SYSTEM_README.md`
- **Environment Variables**: See `.env.example`
- **API Reference**: See `AI_SYSTEM_README.md`

## 🎯 You're All Set!

Your VibelyBuild.AI platform is now ready with:

✅ Premium glassmorphism UI with Bliss wallpaper
✅ Modular AI system supporting 4 providers
✅ Easy provider switching (change 1 line)
✅ Complete build system with streaming
✅ Firebase backend
✅ All pages styled consistently

**Start building apps now:** http://localhost:3000

## 💡 Pro Tips

1. **Start with Groq** (free + fast) to test the system
2. **Switch to Claude** for production (best quality)
3. **Use different models** for different operations to optimize cost
4. **Monitor the console** to see AI generation in real-time
5. **Read `AI_SYSTEM_README.md`** for advanced usage

---

Need help? Check the console logs or review the documentation files.
