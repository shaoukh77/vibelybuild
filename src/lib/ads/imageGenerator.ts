/**
 * AI Ads Image Generator
 * Uses OpenAI DALL·E 3 to generate professional ad graphics
 */

import OpenAI from 'openai';
import { saveImageFromUrl, SavedImage } from './imageSaver';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export interface GenerateAdImagesParams {
  sessionId: string;
  title: string;
  description: string;
  audience: string;
  platform: string;
  userId: string;
}

/**
 * Generate 2 professional ad images using DALL·E 3
 */
export async function generateAdImages(
  params: GenerateAdImagesParams
): Promise<SavedImage[]> {
  const { sessionId, title, description, audience, platform, userId } = params;

  // Validate OpenAI API key
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key is not configured');
  }

  // Build optimized prompts for both ad variations
  const prompt1 = buildAdPrompt(title, description, audience, platform, 'vibrant');
  const prompt2 = buildAdPrompt(title, description, audience, platform, 'minimalist');

  const prompts = [prompt1, prompt2];

  console.log('[Image Generator] Starting generation of 2 ad images...');
  console.log('[Image Generator] Session ID:', sessionId);

  const generatedImages: SavedImage[] = [];

  // Generate images sequentially to avoid rate limits
  for (let i = 0; i < prompts.length; i++) {
    try {
      console.log(`[Image Generator] Generating ad ${i + 1}/2...`);
      console.log(`[Image Generator] Prompt: ${prompts[i].substring(0, 100)}...`);

      // Call DALL·E 3 API
      const response = await openai.images.generate({
        model: 'dall-e-3',
        prompt: prompts[i],
        n: 1,
        size: '1024x1024', // Square format as requested
        quality: 'standard',
        response_format: 'url',
      });

      if (!response.data || response.data.length === 0) {
        throw new Error('No image returned from OpenAI API');
      }

      const imageUrl = response.data[0].url;
      if (!imageUrl) {
        throw new Error('Image URL is missing from OpenAI response');
      }

      console.log(`[Image Generator] Ad ${i + 1} generated successfully`);
      console.log(`[Image Generator] Saving to disk...`);

      // Save image to /public/generated_ads/<sessionId>/
      const savedImage = await saveImageFromUrl(imageUrl, sessionId, `ad${i + 1}.png`);

      generatedImages.push(savedImage);

      console.log(`[Image Generator] Ad ${i + 1} saved: ${savedImage.url}`);

      // Small delay to avoid rate limiting
      if (i < prompts.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

    } catch (error: any) {
      console.error(`[Image Generator] Failed to generate ad ${i + 1}:`, error.message);

      // If first image fails, throw error immediately
      if (i === 0) {
        throw new Error(`Failed to generate ads: ${error.message}`);
      }

      // If second image fails, continue with just one image
      console.log('[Image Generator] Continuing with 1 ad image');
    }
  }

  if (generatedImages.length === 0) {
    throw new Error('Failed to generate any ad images');
  }

  console.log(`[Image Generator] Successfully generated ${generatedImages.length} ad image(s)`);

  return generatedImages;
}

/**
 * Build optimized prompt for ad generation
 */
function buildAdPrompt(
  title: string,
  description: string,
  audience: string,
  platform: string,
  style: 'vibrant' | 'minimalist'
): string {
  // Platform-specific tones
  const platformTones: Record<string, string> = {
    facebook: 'friendly, engaging, social-first design',
    instagram: 'aesthetic, visual storytelling, Instagram-worthy',
    linkedin: 'professional, business-focused, corporate branding',
    twitter: 'bold, attention-grabbing, concise messaging',
    tiktok: 'fun, dynamic, energetic, Gen Z appeal',
    google: 'clean, conversion-focused, search-optimized',
  };

  const tone = platformTones[platform.toLowerCase()] || 'professional, engaging';

  // Style-specific enhancements
  const styleDescriptions = {
    vibrant: 'vibrant colors, eye-catching gradients, bold typography, energetic composition',
    minimalist: 'minimalist design, clean layout, modern aesthetics, elegant simplicity',
  };

  const styleDesc = styleDescriptions[style];

  // Build comprehensive prompt
  let prompt = `Professional ${platform} advertisement for "${title}". `;
  prompt += `Product description: ${description}. `;
  prompt += `Target audience: ${audience}. `;
  prompt += `Design tone: ${tone}. `;
  prompt += `Visual style: ${styleDesc}. `;
  prompt += `Include: product branding, compelling imagery, ${platform}-appropriate layout. `;
  prompt += `Format: Square 1024x1024px marketing graphic. `;
  prompt += `Quality: Professional, high-resolution, commercial-grade ad design. `;
  prompt += `NO text overlays, NO watermarks (text will be added separately).`;

  return prompt;
}

/**
 * Validate ad generation parameters
 */
export function validateAdParams(params: Partial<GenerateAdImagesParams>): string | null {
  if (!params.title || params.title.trim().length === 0) {
    return 'Title is required';
  }

  if (!params.description || params.description.trim().length === 0) {
    return 'Description is required';
  }

  if (!params.audience || params.audience.trim().length === 0) {
    return 'Target audience is required';
  }

  if (!params.platform || params.platform.trim().length === 0) {
    return 'Platform is required';
  }

  if (params.title.length > 100) {
    return 'Title must be 100 characters or less';
  }

  if (params.description.length > 500) {
    return 'Description must be 500 characters or less';
  }

  return null;
}
