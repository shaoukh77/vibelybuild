/**
 * Serverless Preview API
 * GET /api/preview/[jobId]
 *
 * Serves generated app preview from .cache directory
 * Bundles HTML/CSS/JS and serves as a complete document
 *
 * This replaces the Express preview server with a serverless-compatible approach
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyUser } from '@/lib/verifyUser';
import { getJob } from '@/lib/builder/BuildOrchestrator';
import * as fs from 'fs/promises';
import * as path from 'path';
import { existsSync } from 'fs';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60; // 60 seconds for reading and bundling files

interface RouteParams {
  params: {
    jobId: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Verify authentication
    const authUser = await verifyUser(request);
    const { jobId } = params;

    if (!jobId) {
      return NextResponse.json(
        { error: 'jobId is required' },
        { status: 400 }
      );
    }

    // Get job and verify ownership
    const job = getJob(jobId);

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    if (job.userId !== authUser.uid) {
      return NextResponse.json(
        { error: 'Unauthorized: You do not own this job' },
        { status: 403 }
      );
    }

    // Check if build is complete
    if (job.status !== 'complete') {
      return NextResponse.json(
        { error: `Build is ${job.status}. Wait for completion before previewing.` },
        { status: 400 }
      );
    }

    // Read generated files from .cache directory
    const cacheDir = path.join(process.cwd(), '.cache', 'vibecode', jobId, 'generated');

    if (!existsSync(cacheDir)) {
      return NextResponse.json(
        { error: 'Generated files not found' },
        { status: 404 }
      );
    }

    // Find index.html or main entry point
    const indexPath = path.join(cacheDir, 'index.html');
    const appPath = path.join(cacheDir, 'app', 'page.tsx');
    const srcPath = path.join(cacheDir, 'src');

    let htmlContent = '';

    // Strategy 1: Direct HTML file
    if (existsSync(indexPath)) {
      htmlContent = await fs.readFile(indexPath, 'utf-8');

      // Inject base tag to resolve relative paths
      htmlContent = injectBaseTag(htmlContent, jobId);
    }
    // Strategy 2: Next.js app (needs bundling)
    else if (existsSync(appPath) || existsSync(srcPath)) {
      htmlContent = await bundleNextJsApp(cacheDir, jobId);
    }
    // Strategy 3: React app
    else {
      htmlContent = await bundleReactApp(cacheDir, jobId);
    }

    // Serve the bundled HTML
    return new Response(htmlContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store, must-revalidate',
        'X-Frame-Options': 'SAMEORIGIN',
        'Content-Security-Policy': "default-src 'self' 'unsafe-inline' 'unsafe-eval' https: http: data: blob:;",
      },
    });

  } catch (error: any) {
    console.error('[Preview API] Error:', error);
    return NextResponse.json(
      {
        error: error.message || 'Failed to load preview',
        code: 'PREVIEW_ERROR',
      },
      { status: 500 }
    );
  }
}

/**
 * Inject base tag for relative path resolution
 */
function injectBaseTag(html: string, jobId: string): string {
  const baseTag = `<base href="/api/preview/${jobId}/" />`;

  if (html.includes('<head>')) {
    return html.replace('<head>', `<head>\n  ${baseTag}`);
  } else {
    return `<!DOCTYPE html><html><head>${baseTag}</head><body>${html}</body></html>`;
  }
}

/**
 * Bundle Next.js app into single HTML
 */
async function bundleNextJsApp(cacheDir: string, jobId: string): Promise<string> {
  // Read app/page.tsx or src/app/page.tsx
  const possiblePaths = [
    path.join(cacheDir, 'app', 'page.tsx'),
    path.join(cacheDir, 'src', 'app', 'page.tsx'),
    path.join(cacheDir, 'app', 'page.jsx'),
    path.join(cacheDir, 'src', 'app', 'page.jsx'),
  ];

  let pageContent = '';
  for (const pagePath of possiblePaths) {
    if (existsSync(pagePath)) {
      pageContent = await fs.readFile(pagePath, 'utf-8');
      break;
    }
  }

  if (!pageContent) {
    throw new Error('No page component found in generated app');
  }

  // Extract JSX content and create a simple preview
  // This is a simplified approach - for production, you'd want proper bundling
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview - ${jobId}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: system-ui, -apple-system, sans-serif;
    }
  </style>
</head>
<body>
  <div id="preview-root">
    <div class="p-8">
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-4">
        <h2 class="text-xl font-bold text-blue-900 mb-2">🎨 Preview Mode</h2>
        <p class="text-blue-700">Your Next.js app is being rendered. For full functionality, download the code and run it locally.</p>
      </div>
      <div class="prose max-w-none">
        <pre class="bg-gray-100 p-4 rounded overflow-auto"><code>${escapeHtml(pageContent)}</code></pre>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Bundle React app into single HTML
 */
async function bundleReactApp(cacheDir: string, jobId: string): Promise<string> {
  // Look for common entry points
  const entryPoints = [
    'App.tsx',
    'App.jsx',
    'index.tsx',
    'index.jsx',
    'src/App.tsx',
    'src/App.jsx',
  ];

  let appContent = '';
  for (const entry of entryPoints) {
    const entryPath = path.join(cacheDir, entry);
    if (existsSync(entryPath)) {
      appContent = await fs.readFile(entryPath, 'utf-8');
      break;
    }
  }

  if (!appContent) {
    // If no entry point found, list all files
    const files = await fs.readdir(cacheDir, { recursive: true });
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview - ${jobId}</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="p-8">
  <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
    <h2 class="text-xl font-bold text-yellow-900 mb-2">⚠️ Preview Not Available</h2>
    <p class="text-yellow-700 mb-4">No entry point found. Generated files:</p>
    <ul class="list-disc list-inside text-sm text-yellow-600">
      ${files.slice(0, 20).map(f => `<li>${escapeHtml(String(f))}</li>`).join('\n')}
    </ul>
    <p class="text-yellow-700 mt-4">Download the code to run it locally.</p>
  </div>
</body>
</html>
    `.trim();
  }

  // Create a simple preview
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview - ${jobId}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel">
    ${appContent}
  </script>
</body>
</html>
  `.trim();
}

/**
 * Escape HTML for safe display
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * Handle OPTIONS for CORS
 */
export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    },
  });
}
