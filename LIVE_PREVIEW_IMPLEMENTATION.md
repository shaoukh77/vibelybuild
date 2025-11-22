# Live Preview Implementation Guide

## Overview

VibeBuild's Live Preview system runs generated Next.js apps exactly like a real Next.js app with **fully working interactivity** including navigation, buttons, forms, client components, API routes, and dynamic server actions.

## Architecture

The system consists of 4 main components:

### 1. Preview Server (`server/preview/previewServer.ts`)
- Runs `next dev --turbo` (development) or `next build` + `next start` (production)
- Dynamic port allocation (4110-4990)
- Auto-build with `npm install` (cached per project)
- SSR + client-side hydration support
- CORS configuration for iframe embedding
- Retry mechanism for failed starts (3 retries max)
- Resource limits (512MB RAM)

### 2. Preview Manager (`server/preview/previewManager.ts`)
- Manages preview lifecycle
- Handles port allocation/deallocation
- Process cleanup and zombie detection
- Health monitoring
- Auto-timeout after 5 minutes of inactivity
- State persistence

### 3. Build Orchestrator (`src/lib/builder/BuildOrchestrator.ts`)
- Coordinates build pipeline
- Integrates preview server
- Real-time log streaming via SSE
- Emits status events (build_complete, preview_ready, ui_ready, build_error)

### 4. Frontend Components
- **IframePreview** (`src/components/IframePreview.tsx`) - Fully interactive iframe with refresh button
- **LivePreviewPanel** (`src/app/build/livePreviewPanel.tsx`) - 3 tab modes:
  - **UI Preview** - Running Next.js app in iframe
  - **Code Viewer** - Syntax-highlighted code
  - **File Tree** - File navigator

## API Endpoints

### GET /api/build/preview?jobId={id}
Get preview status and URL for a build.

**Response:**
```json
{
  "buildId": "abc123",
  "url": "http://localhost:4567",
  "status": "ready", // "starting" | "ready" | "error" | "not_found"
  "port": 4567,
  "startTime": 1234567890,
  "error": null
}
```

### POST /api/build/preview/restart
Restart preview server for hot-reload.

**Request:**
```json
{
  "jobId": "abc123"
}
```

**Response:**
```json
{
  "buildId": "abc123",
  "url": "http://localhost:4567",
  "status": "starting",
  "port": 4567,
  "startTime": 1234567890
}
```

### POST /api/build/preview/stop
Stop preview server and free resources.

**Request:**
```json
{
  "jobId": "abc123"
}
```

**Response:**
```json
{
  "success": true,
  "buildId": "abc123"
}
```

### GET /api/build/logs?jobId={id}
Real-time SSE stream of build logs and events.

**SSE Events:**
- `message` - Build log messages
- `fileTree` - Generated file structure
- `preview_ready` - Preview URL available (before compilation)
- `ui_ready` - Next.js compilation complete (ready to view)
- `build_error` - Build failed with error details
- `done` - Build pipeline complete

## Usage

### Starting a Preview (Development Mode)

```typescript
import { startPreview } from '@/server/preview/previewManager';

const previewInfo = await startPreview(
  buildId,
  projectPath,
  userId
);

console.log(`Preview URL: ${previewInfo.url}`);
// Output: http://localhost:4567
```

### Starting a Preview (Production Mode)

```typescript
import { startPreviewServer } from '@/server/preview/previewServer';

const previewInfo = await startPreviewServer(
  buildId,
  projectPath,
  port,
  onReady,
  0, // retryCount
  'production' // mode
);
```

### Getting Preview URL

```typescript
import { getPreviewUrl } from '@/lib/livepreview/getPreviewUrl';

const url = getPreviewUrl(buildId);
if (url) {
  console.log(`Preview is ready at ${url}`);
}
```

### Checking Preview Status

```typescript
import { getPreviewInfo, isPreviewReady } from '@/lib/livepreview/getPreviewUrl';

const info = getPreviewInfo(buildId);
console.log(info.status); // "starting" | "ready" | "error"

const ready = isPreviewReady(buildId);
if (ready) {
  // Preview is fully compiled and ready
}
```

### Frontend Integration

```typescript
'use client';

import { IframePreview } from '@/components/IframePreview';
import { useEffect, useState } from 'react';

export function MyPreview({ jobId }: { jobId: string }) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uiReady, setUiReady] = useState(false);

  useEffect(() => {
    // Subscribe to SSE for real-time updates
    const eventSource = new EventSource(`/api/build/logs?jobId=${jobId}`);

    eventSource.addEventListener('preview_ready', (e) => {
      const data = JSON.parse(e.data);
      setPreviewUrl(data.url);
    });

    eventSource.addEventListener('ui_ready', (e) => {
      const data = JSON.parse(e.data);
      setPreviewUrl(data.url);
      setUiReady(true); // Next.js is fully compiled
    });

    return () => eventSource.close();
  }, [jobId]);

  return (
    <IframePreview
      previewUrl={previewUrl}
      buildId={jobId}
      onRefresh={() => {
        // Optional: restart preview server
        fetch('/api/build/preview/restart', {
          method: 'POST',
          body: JSON.stringify({ jobId })
        });
      }}
    />
  );
}
```

## Features

### ✅ Full Next.js Interactivity
- **Navigation** - Client-side routing with `next/link`
- **Forms** - Form submission with Server Actions
- **API Routes** - `/api/*` endpoints work
- **Client Components** - `'use client'` components hydrate properly
- **Server Components** - SSR with streaming
- **Dynamic Routes** - `[id]` and `[...slug]` routes
- **Middleware** - Request/response interceptors
- **Static Assets** - Images, fonts, etc.

### ✅ Auto-Build Pipeline
1. **Dependencies** - `npm install` runs once per project (cached)
2. **Cache Clear** - `.next` and `.turbo` dirs cleared before each build
3. **Turbopack** - Enabled for faster dev builds
4. **Production Build** - Optional `next build` for optimized output

### ✅ SSR + Hydration
- Full server-side rendering
- Client-side hydration for interactive components
- Streaming SSR for faster TTFB
- Proper React 19 compatibility

### ✅ CORS + Iframe Support
- `X-Frame-Options: ALLOWALL` header
- `Content-Security-Policy` allows iframe embedding
- CORS headers for cross-origin requests
- Middleware to remove restrictive headers

### ✅ Preview Status Streaming
- **preview_ready** - Server started, installing deps
- **ui_ready** - Next.js compiled, ready to view
- **build_error** - Build failed with error details
- Real-time progress updates (0-100%)

### ✅ 3 View Modes
1. **UI Preview** - Live iframe with full interactivity
2. **Code Viewer** - Syntax-highlighted source code
3. **File Tree** - File navigator with click-to-view

### ✅ Hot-Reload on Remix
- Refresh button in iframe controls
- Automatic iframe reload
- Optional server restart via `/api/build/preview/restart`
- State preservation during reload

## File Structure

```
vibelybuild/
├── server/
│   ├── preview/
│   │   ├── previewServer.ts       # Core preview server logic
│   │   ├── previewManager.ts      # Lifecycle management
│   │   ├── processRunner.ts       # Process spawning & monitoring
│   │   └── portAllocator.ts       # Port allocation (4110-4990)
│   └── process/
│       └── runCommand.ts           # Shell command executor
├── src/
│   ├── app/
│   │   └── api/
│   │       └── build/
│   │           ├── start/route.ts       # POST - Start build
│   │           ├── logs/route.ts        # GET - SSE log stream
│   │           ├── output/route.ts      # GET - Build output
│   │           └── preview/
│   │               ├── route.ts         # GET - Preview status
│   │               ├── restart/route.ts # POST - Restart preview
│   │               └── stop/route.ts    # POST - Stop preview
│   ├── lib/
│   │   ├── builder/
│   │   │   └── BuildOrchestrator.ts  # Build pipeline coordinator
│   │   └── livepreview/
│   │       ├── attachPreview.ts      # Attach preview to build
│   │       └── getPreviewUrl.ts      # Utility functions
│   └── components/
│       ├── IframePreview.tsx         # Main preview component
│       └── PreviewTabs.tsx           # Tab switcher UI
└── .cache/
    └── vibecode/
        └── {buildId}/
            └── generated/            # Generated Next.js app
                ├── app/
                ├── package.json
                ├── next.config.js
                └── middleware.ts
```

## Configuration

### Port Range
Previews use ports **4110-4990** (configurable in `portAllocator.ts`)

### Timeouts
- **Build timeout**: 5 minutes
- **Preview startup**: 2 minutes
- **Inactive preview cleanup**: 5 minutes
- **Health check interval**: 2 minutes

### Resource Limits
- **Max RAM**: 512MB per preview
- **Max retries**: 3 attempts
- **Max concurrent previews**: 880 (based on port range)

## Development vs Production Mode

### Development Mode (default)
```bash
npx next dev --turbo --port {port}
```
- Fast startup with Turbopack
- Hot module replacement
- No build step required
- Lower memory usage

### Production Mode
```bash
npx next build
npx next start --port {port}
```
- Optimized build
- Smaller bundle size
- Production-ready performance
- Slower startup (build time)

## Error Handling

### Build Errors
- Streamed via SSE `build_error` event
- Displayed in UI with retry button
- Logged to `.cache/vibecode/{buildId}/logs/build.log`

### Preview Server Errors
- Automatic retry (3 attempts)
- Port cleanup on failure
- Zombie process detection
- Health monitoring with auto-restart

### Network Errors
- CORS headers configured
- Iframe sandbox attributes set
- Error fallback UI with manual refresh

## Testing

### Test Preview Locally

```bash
# Start a build
curl -X POST http://localhost:3000/api/build/start \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Build a todo app", "target": "web"}'

# Get job logs (SSE stream)
curl -N http://localhost:3000/api/build/logs?jobId={jobId}

# Check preview status
curl http://localhost:3000/api/build/preview?jobId={jobId}

# Restart preview
curl -X POST http://localhost:3000/api/build/preview/restart \
  -H "Content-Type: application/json" \
  -d '{"jobId": "{jobId}"}'
```

### Monitor Active Previews

```typescript
import { getAllActivePreviews } from '@/server/preview/previewManager';

const previews = getAllActivePreviews();
console.log(`${previews.length} active previews`);

previews.forEach(p => {
  console.log(`Build ${p.buildId}: ${p.url} (${p.status})`);
});
```

## Troubleshooting

### Preview Not Starting
1. Check if port is available: `lsof -i :{port}`
2. Verify dependencies installed: `ls .cache/vibecode/{buildId}/generated/node_modules`
3. Check build logs: `cat .cache/vibecode/{buildId}/logs/build.log`
4. Try restarting: `POST /api/build/preview/restart`

### Iframe Not Loading
1. Check CORS headers in browser DevTools
2. Verify `X-Frame-Options` is set to `ALLOWALL`
3. Check iframe sandbox attributes
4. Open preview URL in new tab to debug

### Preview Server Crashed
- Automatic health check runs every 2 minutes
- Zombie processes cleaned on startup
- Check process runner logs for crash details
- Manually restart via API

## Best Practices

1. **Use Development Mode** for faster iteration
2. **Production Mode** only for final testing
3. **Monitor Memory Usage** - 512MB limit per preview
4. **Clean Up Old Previews** - Auto-timeout after 5 minutes
5. **Handle SSE Events** properly in frontend
6. **Test CORS** if deploying to different domain
7. **Use Refresh Button** instead of full server restart

## Next Steps

- [ ] Add WebSocket support for faster updates
- [ ] Implement preview sharing (public URLs)
- [ ] Add screenshot capture API
- [ ] Support multiple device viewports
- [ ] Add performance metrics dashboard
- [ ] Implement preview versioning

---

**Last Updated:** 2025-01-22
**Version:** 1.0.0
**Maintainer:** VibeBuild Team
