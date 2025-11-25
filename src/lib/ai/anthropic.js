/**
 * Anthropic (Claude) Adapter
 * Handles all Anthropic API interactions
 */

import Anthropic from '@anthropic-ai/sdk';

let anthropicClient = null;

/**
 * Get or create Anthropic client
 */
function getClient() {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not configured in environment variables');
  }

  if (!anthropicClient) {
    anthropicClient = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  return anthropicClient;
}

/**
 * Generate text completion
 */
export async function generateText({ prompt, systemPrompt, model, temperature = 0.7, maxTokens = 4096 }) {
  const client = getClient();

  const response = await client.messages.create({
    model: model || 'claude-3-5-sonnet-20241022',
    max_tokens: maxTokens,
    temperature,
    system: systemPrompt || undefined,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  return response.content[0].text;
}

/**
 * Generate streaming text completion
 */
export async function* generateStreamingText({ prompt, systemPrompt, model, temperature = 0.7, maxTokens = 4096 }) {
  const client = getClient();

  const stream = await client.messages.create({
    model: model || 'claude-3-5-sonnet-20241022',
    max_tokens: maxTokens,
    temperature,
    system: systemPrompt || undefined,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
    stream: true,
  });

  for await (const event of stream) {
    if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
      yield event.delta.text;
    }
  }
}

/**
 * Generate code with specific formatting
 */
export async function generateCode({ prompt, language = 'javascript', systemPrompt, model }) {
  const enhancedPrompt = `Generate ${language} code for: ${prompt}

Requirements:
- Production-ready code
- Proper error handling
- Modern best practices
- Include necessary imports
- Add helpful comments

Return only the code, no explanations.`;

  return generateText({
    prompt: enhancedPrompt,
    systemPrompt,
    model,
    temperature: 0.3, // Lower temperature for more consistent code
  });
}

/**
 * Generate streaming code
 */
export async function* generateStreamingCode({ prompt, language = 'javascript', systemPrompt, model }) {
  const enhancedPrompt = `Generate ${language} code for: ${prompt}

Requirements:
- Production-ready code
- Proper error handling
- Modern best practices
- Include necessary imports
- Add helpful comments

Return only the code, no explanations.`;

  yield* generateStreamingText({
    prompt: enhancedPrompt,
    systemPrompt,
    model,
    temperature: 0.3,
  });
}

/**
 * Validate API key
 */
export async function validateApiKey() {
  try {
    const client = getClient();
    // Make a minimal API call to validate the key
    await client.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 10,
      messages: [{ role: 'user', content: 'test' }],
    });
    return { valid: true, provider: 'anthropic' };
  } catch (error) {
    return {
      valid: false,
      provider: 'anthropic',
      error: error.message,
    };
  }
}

export default {
  generateText,
  generateStreamingText,
  generateCode,
  generateStreamingCode,
  validateApiKey,
};
