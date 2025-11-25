/**
 * AI System Test Endpoint
 *
 * Test your AI configuration and verify API keys are working
 *
 * Usage:
 *   GET /api/ai/test - Check configuration and validate keys
 *   POST /api/ai/test - Test code generation with current provider
 */

import { validateAllKeys, getConfigInfo, generateCode } from '@/lib/ai';

export async function GET(req) {
  try {
    // Get current configuration
    const config = getConfigInfo();

    // Validate all API keys
    const validation = await validateAllKeys();

    return Response.json({
      success: true,
      timestamp: new Date().toISOString(),
      configuration: config,
      apiKeyValidation: validation,
      message: 'AI system configuration loaded successfully',
    });
  } catch (error) {
    return Response.json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { prompt = 'Create a simple React button component' } = await req.json();

    console.log('[AI Test] Generating code with prompt:', prompt);

    const startTime = Date.now();

    // Generate code using the configured provider
    const code = await generateCode({
      prompt,
      language: 'javascript',
    });

    const duration = Date.now() - startTime;

    const config = getConfigInfo();

    return Response.json({
      success: true,
      timestamp: new Date().toISOString(),
      duration: `${duration}ms`,
      provider: config.codeGeneration.provider,
      model: config.codeGeneration.model,
      prompt,
      generatedCode: code,
      message: 'Code generation successful',
    });
  } catch (error) {
    console.error('[AI Test] Error:', error);

    return Response.json({
      success: false,
      error: error.message,
      details: error.stack,
    }, { status: 500 });
  }
}
