/**
 * AI Router - Master Interface
 *
 * This is the ONLY file you need to import in your application.
 * It automatically routes to the correct AI provider based on config.js
 *
 * Usage:
 *   import { generateCode, generateText } from '@/lib/ai';
 *   const code = await generateCode({ prompt: 'Create a login form' });
 */

import { AI_CONFIG, getCurrentProvider, isProviderConfigured } from './config.js';
import * as openai from './openai.js';
import * as anthropic from './anthropic.js';
import * as gemini from './gemini.js';
import * as groq from './groq.js';

// Map provider names to their adapters
const ADAPTERS = {
  openai,
  anthropic,
  gemini,
  groq,
};

/**
 * Get the adapter for a specific operation type
 */
function getAdapter(operationType = 'CODE_GENERATION') {
  const config = getCurrentProvider(operationType);
  const { provider, model } = config;

  // Validate provider is configured
  if (!isProviderConfigured(provider)) {
    throw new Error(
      `Provider "${provider}" is not configured. Please set the required API key in your .env file.`
    );
  }

  const adapter = ADAPTERS[provider];
  if (!adapter) {
    throw new Error(`Unknown AI provider: ${provider}`);
  }

  return { adapter, model };
}

/**
 * Generate text using the configured provider
 *
 * @param {Object} options
 * @param {string} options.prompt - The user prompt
 * @param {string} [options.systemPrompt] - Optional system prompt
 * @param {string} [options.operationType='TEXT_GENERATION'] - Type of operation (determines which provider to use)
 * @param {number} [options.temperature] - Override default temperature
 * @param {number} [options.maxTokens] - Override default max tokens
 * @returns {Promise<string>} Generated text
 */
export async function generateText({
  prompt,
  systemPrompt,
  operationType = 'TEXT_GENERATION',
  temperature,
  maxTokens,
}) {
  const { adapter, model } = getAdapter(operationType);

  return adapter.generateText({
    prompt,
    systemPrompt: systemPrompt || AI_CONFIG.SYSTEM_PROMPTS.CODE_BUILDER,
    model,
    temperature: temperature ?? AI_CONFIG.SETTINGS.temperature,
    maxTokens: maxTokens ?? AI_CONFIG.SETTINGS.maxTokens,
  });
}

/**
 * Generate streaming text using the configured provider
 *
 * @param {Object} options - Same as generateText
 * @returns {AsyncGenerator<string>} Streaming text chunks
 */
export async function* generateStreamingText({
  prompt,
  systemPrompt,
  operationType = 'TEXT_GENERATION',
  temperature,
  maxTokens,
}) {
  const { adapter, model } = getAdapter(operationType);

  yield* adapter.generateStreamingText({
    prompt,
    systemPrompt: systemPrompt || AI_CONFIG.SYSTEM_PROMPTS.CODE_BUILDER,
    model,
    temperature: temperature ?? AI_CONFIG.SETTINGS.temperature,
    maxTokens: maxTokens ?? AI_CONFIG.SETTINGS.maxTokens,
  });
}

/**
 * Generate code using the configured provider
 *
 * @param {Object} options
 * @param {string} options.prompt - Description of the code to generate
 * @param {string} [options.language='javascript'] - Programming language
 * @param {string} [options.systemPrompt] - Optional system prompt
 * @param {string} [options.operationType='CODE_GENERATION'] - Type of operation
 * @returns {Promise<string>} Generated code
 */
export async function generateCode({
  prompt,
  language = 'javascript',
  systemPrompt,
  operationType = 'CODE_GENERATION',
}) {
  const { adapter, model } = getAdapter(operationType);

  return adapter.generateCode({
    prompt,
    language,
    systemPrompt: systemPrompt || AI_CONFIG.SYSTEM_PROMPTS.CODE_BUILDER,
    model,
  });
}

/**
 * Generate streaming code using the configured provider
 *
 * @param {Object} options - Same as generateCode
 * @returns {AsyncGenerator<string>} Streaming code chunks
 */
export async function* generateStreamingCode({
  prompt,
  language = 'javascript',
  systemPrompt,
  operationType = 'CODE_GENERATION',
}) {
  const { adapter, model } = getAdapter(operationType);

  yield* adapter.generateStreamingCode({
    prompt,
    language,
    systemPrompt: systemPrompt || AI_CONFIG.SYSTEM_PROMPTS.CODE_BUILDER,
    model,
  });
}

/**
 * Generate app architecture plan
 */
export async function generateAppPlan({ prompt, operationType = 'FAST_OPERATIONS' }) {
  return generateText({
    prompt,
    systemPrompt: AI_CONFIG.SYSTEM_PROMPTS.APP_PLANNER,
    operationType,
  });
}

/**
 * Review code for issues
 */
export async function reviewCode({ code, operationType = 'FAST_OPERATIONS' }) {
  return generateText({
    prompt: `Review this code:\n\n${code}`,
    systemPrompt: AI_CONFIG.SYSTEM_PROMPTS.CODE_REVIEWER,
    operationType,
  });
}

/**
 * Generate a complete app with streaming updates
 *
 * This is the main function for the build system
 */
export async function* generateApp({ prompt, onStep }) {
  const { adapter, model } = getAdapter('CODE_GENERATION');

  const buildPrompt = `You are building a complete full-stack application based on this description:

${prompt}

Generate the following and provide detailed logs as you work:

1. Project structure (list of files and folders)
2. Database schema (if needed)
3. Frontend components
4. Backend API routes
5. Authentication setup
6. Styling and UI

For each step, provide a status update starting with an emoji.
Then generate the actual code files.

Be thorough and production-ready.`;

  let currentStep = '';

  for await (const chunk of adapter.generateStreamingText({
    prompt: buildPrompt,
    systemPrompt: AI_CONFIG.SYSTEM_PROMPTS.CODE_BUILDER,
    model,
    temperature: 0.4,
    maxTokens: 8000,
  })) {
    // Check if chunk contains a step marker (emoji at start)
    if (/^[🔧📦🧱🧪⚙️🖼️✅🚀💾🔐🎨📝]/.test(chunk)) {
      currentStep = chunk;
      if (onStep) {
        onStep(currentStep);
      }
    }

    yield chunk;
  }
}

/**
 * Validate all configured API keys
 */
export async function validateAllKeys() {
  const results = {};

  for (const [provider, adapter] of Object.entries(ADAPTERS)) {
    if (isProviderConfigured(provider)) {
      try {
        results[provider] = await adapter.validateApiKey();
      } catch (error) {
        results[provider] = {
          valid: false,
          provider,
          error: error.message,
        };
      }
    } else {
      results[provider] = {
        valid: false,
        provider,
        error: 'API key not configured',
      };
    }
  }

  return results;
}

/**
 * Get current configuration info
 */
export function getConfigInfo() {
  return {
    codeGeneration: getCurrentProvider('CODE_GENERATION'),
    textGeneration: getCurrentProvider('TEXT_GENERATION'),
    fastOperations: getCurrentProvider('FAST_OPERATIONS'),
    settings: AI_CONFIG.SETTINGS,
  };
}

// Export everything for advanced usage
export { AI_CONFIG, getCurrentProvider, isProviderConfigured } from './config.js';
export * as openai from './openai.js';
export * as anthropic from './anthropic.js';
export * as gemini from './gemini.js';
export * as groq from './groq.js';
