/**
 * Groq Adapter
 * Handles all Groq API interactions (fast Llama inference)
 */

import Groq from 'groq-sdk';

let groqClient = null;

/**
 * Get or create Groq client
 */
function getClient() {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is not configured in environment variables');
  }

  if (!groqClient) {
    groqClient = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }

  return groqClient;
}

/**
 * Generate text completion
 */
export async function generateText({ prompt, systemPrompt, model, temperature = 0.7, maxTokens = 4096 }) {
  const client = getClient();

  const messages = [];

  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }

  messages.push({ role: 'user', content: prompt });

  const response = await client.chat.completions.create({
    model: model || 'llama-3.1-70b-versatile',
    messages,
    temperature,
    max_tokens: maxTokens,
  });

  return response.choices[0].message.content;
}

/**
 * Generate streaming text completion
 */
export async function* generateStreamingText({ prompt, systemPrompt, model, temperature = 0.7, maxTokens = 4096 }) {
  const client = getClient();

  const messages = [];

  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }

  messages.push({ role: 'user', content: prompt });

  const stream = await client.chat.completions.create({
    model: model || 'llama-3.1-70b-versatile',
    messages,
    temperature,
    max_tokens: maxTokens,
    stream: true,
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || '';
    if (content) {
      yield content;
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
    await client.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: 'test' }],
      max_tokens: 5,
    });
    return { valid: true, provider: 'groq' };
  } catch (error) {
    return {
      valid: false,
      provider: 'groq',
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
