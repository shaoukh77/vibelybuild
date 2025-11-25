/**
 * Google Gemini Adapter
 * Handles all Google Gemini API interactions
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI = null;

/**
 * Get or create Google Generative AI client
 */
function getClient() {
  if (!process.env.GOOGLE_API_KEY) {
    throw new Error('GOOGLE_API_KEY is not configured in environment variables');
  }

  if (!genAI) {
    genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
  }

  return genAI;
}

/**
 * Generate text completion
 */
export async function generateText({ prompt, systemPrompt, model, temperature = 0.7, maxTokens = 4096 }) {
  const client = getClient();
  const generativeModel = client.getGenerativeModel({
    model: model || 'gemini-1.5-pro',
  });

  // Combine system prompt with user prompt for Gemini
  const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;

  const result = await generativeModel.generateContent({
    contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
    generationConfig: {
      temperature,
      maxOutputTokens: maxTokens,
    },
  });

  return result.response.text();
}

/**
 * Generate streaming text completion
 */
export async function* generateStreamingText({ prompt, systemPrompt, model, temperature = 0.7, maxTokens = 4096 }) {
  const client = getClient();
  const generativeModel = client.getGenerativeModel({
    model: model || 'gemini-1.5-pro',
  });

  // Combine system prompt with user prompt for Gemini
  const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;

  const result = await generativeModel.generateContentStream({
    contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
    generationConfig: {
      temperature,
      maxOutputTokens: maxTokens,
    },
  });

  for await (const chunk of result.stream) {
    const text = chunk.text();
    if (text) {
      yield text;
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
    const model = client.getGenerativeModel({ model: 'gemini-pro' });
    await model.generateContent({ contents: [{ role: 'user', parts: [{ text: 'test' }] }] });
    return { valid: true, provider: 'gemini' };
  } catch (error) {
    return {
      valid: false,
      provider: 'gemini',
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
