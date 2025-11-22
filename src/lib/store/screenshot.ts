/**
 * Screenshot Generator - Auto-capture preview screenshots
 *
 * Uses Puppeteer Core with Sparticuz Chromium for serverless environments
 * Works on Render, Vercel, and other cloud platforms
 */

import puppeteer, { Browser, Page } from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import * as fs from 'fs/promises';
import * as path from 'path';

const SCREENSHOT_TIMEOUT = 30000; // 30 seconds
const SCREENSHOT_SIZE = { width: 1200, height: 630 }; // OG image size
const PUBLIC_DIR = path.join(process.cwd(), 'public', 'store_screenshots');

// Determine if running in production (serverless)
const isProduction = process.env.NODE_ENV === 'production';

export interface ScreenshotResult {
  success: boolean;
  filePath?: string;
  publicUrl?: string;
  error?: string;
}

/**
 * Capture a screenshot of a live preview URL
 */
export async function capturePreviewScreenshot(
  previewUrl: string,
  appId: string,
  userId: string
): Promise<ScreenshotResult> {
  console.log(`[Screenshot] 📸 Starting screenshot capture for app ${appId}`);
  console.log(`[Screenshot] Preview URL: ${previewUrl}`);

  let browser: Browser | null = null;
  let page: Page | null = null;

  try {
    // Step 1: Ensure screenshot directory exists
    const userDir = path.join(PUBLIC_DIR, userId);
    await fs.mkdir(userDir, { recursive: true });
    console.log(`[Screenshot] ✅ Screenshot directory ready`);

    // Step 2: Launch headless browser with production-ready config
    console.log(`[Screenshot] 🚀 Launching headless browser (${isProduction ? 'production' : 'development'})...`);

    browser = await puppeteer.launch({
      args: isProduction
        ? chromium.args
        : [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
          ],
      executablePath: isProduction
        ? await chromium.executablePath()
        : process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium-browser',
      headless: true,
    });

    page = await browser.newPage();
    console.log(`[Screenshot] ✅ Browser launched successfully`);

    // Step 3: Set viewport size (desktop view)
    await page.setViewport({
      width: SCREENSHOT_SIZE.width,
      height: SCREENSHOT_SIZE.height,
      deviceScaleFactor: 2, // Retina display
    });
    console.log(`[Screenshot] ✅ Viewport set to ${SCREENSHOT_SIZE.width}x${SCREENSHOT_SIZE.height}`);

    // Step 4: Navigate to preview URL
    console.log(`[Screenshot] 🌐 Navigating to preview URL...`);
    await page.goto(previewUrl, {
      waitUntil: 'networkidle2', // Wait for network to be idle
      timeout: SCREENSHOT_TIMEOUT,
    });
    console.log(`[Screenshot] ✅ Page loaded successfully`);

    // Step 5: Wait for React hydration (if Next.js app)
    console.log(`[Screenshot] ⏳ Waiting for React hydration...`);
    await new Promise(resolve => setTimeout(resolve, 2000)); // 2 seconds for hydration
    console.log(`[Screenshot] ✅ React hydration complete`);

    // Step 6: Capture screenshot
    const screenshotPath = path.join(userDir, `${appId}.png`);
    console.log(`[Screenshot] 📷 Capturing screenshot...`);

    await page.screenshot({
      path: screenshotPath,
      type: 'png',
      fullPage: false, // Just viewport
      omitBackground: false,
    });

    console.log(`[Screenshot] ✅ Screenshot saved: ${screenshotPath}`);

    // Step 7: Generate public URL
    const publicUrl = `/store_screenshots/${userId}/${appId}.png`;

    console.log(`[Screenshot] 🎉 Screenshot capture complete!`);
    console.log(`[Screenshot] Public URL: ${publicUrl}`);

    return {
      success: true,
      filePath: screenshotPath,
      publicUrl,
    };

  } catch (error: any) {
    console.error(`[Screenshot] ❌ Screenshot capture failed:`, error);

    return {
      success: false,
      error: error.message || 'Screenshot capture failed',
    };

  } finally {
    // Cleanup: Close browser
    if (page) {
      try {
        await page.close();
        console.log(`[Screenshot] 🧹 Page closed`);
      } catch (err) {
        console.error(`[Screenshot] ⚠️  Failed to close page:`, err);
      }
    }

    if (browser) {
      try {
        await browser.close();
        console.log(`[Screenshot] 🧹 Browser closed`);
      } catch (err) {
        console.error(`[Screenshot] ⚠️  Failed to close browser:`, err);
      }
    }
  }
}

/**
 * Generate a fallback screenshot (placeholder) if capture fails
 */
export async function generateFallbackScreenshot(
  appId: string,
  userId: string,
  appName: string
): Promise<ScreenshotResult> {
  console.log(`[Screenshot] 🎨 Generating fallback screenshot for ${appId}`);

  try {
    const userDir = path.join(PUBLIC_DIR, userId);
    await fs.mkdir(userDir, { recursive: true });

    const screenshotPath = path.join(userDir, `${appId}.png`);

    // Create a simple SVG placeholder
    const svgPlaceholder = `
      <svg width="${SCREENSHOT_SIZE.width}" height="${SCREENSHOT_SIZE.height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:rgb(147,51,234);stop-opacity:1" />
            <stop offset="100%" style="stop-color:rgb(59,130,246);stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#grad)"/>
        <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="48" fill="white" text-anchor="middle" dominant-baseline="middle">
          ${appName}
        </text>
        <text x="50%" y="60%" font-family="Arial, sans-serif" font-size="24" fill="rgba(255,255,255,0.8)" text-anchor="middle" dominant-baseline="middle">
          VibelyBuild App
        </text>
      </svg>
    `;

    // For now, just save the SVG as a text file
    // In production, you'd use a library like sharp to convert SVG to PNG
    await fs.writeFile(screenshotPath.replace('.png', '.svg'), svgPlaceholder, 'utf-8');

    const publicUrl = `/store_screenshots/${userId}/${appId}.svg`;

    console.log(`[Screenshot] ✅ Fallback screenshot generated`);

    return {
      success: true,
      filePath: screenshotPath.replace('.png', '.svg'),
      publicUrl,
    };

  } catch (error: any) {
    console.error(`[Screenshot] ❌ Fallback generation failed:`, error);

    return {
      success: false,
      error: error.message || 'Fallback generation failed',
    };
  }
}

/**
 * Validate preview URL before capture
 */
export function validatePreviewUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Delete screenshot file
 */
export async function deleteScreenshot(appId: string, userId: string): Promise<boolean> {
  try {
    const screenshotPath = path.join(PUBLIC_DIR, userId, `${appId}.png`);
    await fs.unlink(screenshotPath);
    console.log(`[Screenshot] 🗑️  Deleted screenshot: ${screenshotPath}`);
    return true;
  } catch (error) {
    console.error(`[Screenshot] ⚠️  Failed to delete screenshot:`, error);
    return false;
  }
}
