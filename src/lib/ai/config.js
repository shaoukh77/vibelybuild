/**
 * AI Configuration
 *
 * SINGLE SOURCE OF TRUTH for AI model selection
 * Change the provider and model here to switch across entire app
 */

export const AI_CONFIG = {
  // ============================================
  // 🎯 CHANGE THESE TO SWITCH AI PROVIDERS
  // ============================================

  // Primary provider for code generation
  CODE_GENERATION: {
    provider: 'openai',        // Options: 'openai', 'anthropic', 'gemini', 'groq'
    model: 'gpt-4-turbo',      // Model name for the selected provider
  },

  // Text generation and descriptions
  TEXT_GENERATION: {
    provider: 'openai',
    model: 'gpt-4-turbo',
  },

  // Fast operations (planning, analysis)
  FAST_OPERATIONS: {
    provider: 'groq',
    model: 'llama-3.1-70b-versatile',
  },

  // ============================================
  // Provider-Specific Model Options
  // ============================================

  AVAILABLE_MODELS: {
    openai: [
      'gpt-4-turbo',
      'gpt-4',
      'gpt-3.5-turbo',
      'gpt-4-turbo-preview',
    ],
    anthropic: [
      'claude-3-5-sonnet-20241022',
      'claude-3-opus-20240229',
      'claude-3-sonnet-20240229',
      'claude-3-haiku-20240307',
    ],
    gemini: [
      'gemini-1.5-pro',
      'gemini-1.5-flash',
      'gemini-pro',
    ],
    groq: [
      'llama-3.1-70b-versatile',
      'llama-3.1-8b-instant',
      'mixtral-8x7b-32768',
    ],
  },

  // ============================================
  // System Prompts
  // ============================================

  SYSTEM_PROMPTS: {
    CODE_BUILDER: `You are an expert full-stack developer. Generate complete, production-ready code.
Include:
- Proper error handling
- TypeScript types where applicable
- Modern best practices
- Clean, readable code
- Helpful comments

Do not include explanations unless asked. Only output code.`,

    APP_PLANNER: `You are an expert software architect. Break down app requirements into:
- Database schema
- API endpoints needed
- Component structure
- Authentication flow
- Key features and their implementation steps`,

    CODE_REVIEWER: `You are a senior code reviewer. Analyze code for:
- Bugs and errors
- Security vulnerabilities
- Performance issues
- Best practice violations
- Improvement suggestions`,
  },

  // ============================================
  // Generation Settings
  // ============================================

  SETTINGS: {
    temperature: 0.7,           // Creativity level (0-1)
    maxTokens: 4096,            // Max response length
    streaming: true,            // Enable streaming responses
    timeout: 120000,            // Request timeout (ms)
  },
};

/**
 * Get the current provider configuration
 */
export function getCurrentProvider(operationType = 'CODE_GENERATION') {
  return AI_CONFIG[operationType];
}

/**
 * Validate that a provider is configured
 */
export function isProviderConfigured(provider) {
  const envVars = {
    openai: 'OPENAI_API_KEY',
    anthropic: 'ANTHROPIC_API_KEY',
    gemini: 'GOOGLE_API_KEY',
    groq: 'GROQ_API_KEY',
  };

  const envVar = envVars[provider];
  if (!envVar) return false;

  return !!process.env[envVar];
}

/**
 * Get available providers (those with API keys configured)
 */
export function getAvailableProviders() {
  return Object.keys(AI_CONFIG.AVAILABLE_MODELS).filter(isProviderConfigured);
}
