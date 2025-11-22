# Live Preview Feature - Complete Implementation

## Overview

The Live Preview feature allows users to see their generated Next.js apps running in real-time within the VibeCode builder interface. Instead of just viewing code files, users can now interact with their actual generated applications through an embedded iframe.

## Features Implemented

### 1. **Preview Server Manager** (`src/lib/builder/PreviewServerManager.ts`)

A robust system for managing temporary Next.js development servers:

- **Automatic Port Allocation**: Assigns random ports (5000-5999) to avoid conflicts
- **Lifecycle Management**:
  - Auto-starts when build completes
  - Auto-kills after 5 minutes of inactivity
  - Cleanup on process termination
- **Process Isolation**: Runs each preview in a separate child process
- **Error Handling**: Handles startup failures, port conflicts, and crashes
- **Resource Cleanup**: Properly releases resources when servers stop

**Key Functions**:
```typescript
startPreviewServer(jobId: string): Promise<{ previewUrl: string; port: number }>
stopPreviewServer(jobId: string): boolean
getPreviewServer(jobId: string): PreviewServer | null
stopAllPreviewServers(): void
```

### 2. **API Endpoints**

#### **POST /api/build/preview/start**
Starts a preview server for a completed build.

**Request**:
```json
{
  "buildId": "abc123"
}
```

**Response (Success)**:
```json
{
  "success": true,
  "previewUrl": "http://localhost:5123/",
  "port": 5123,
  "buildId": "abc123"
}
```

**Response (Error)**:
```json
{
  "error": "Build not found"
}
```

**Error Cases**:
- `401`: Unauthorized (missing/invalid token)
- `403`: Forbidden (build doesn't belong to user)
- `404`: Build not found
- `400`: Build not complete
- `503`: Port already in use
- `504`: Server startup timeout

#### **POST /api/build/preview/stop**
Stops a running preview server.

**Request**:
```json
{
  "buildId": "abc123"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Preview server stopped successfully",
  "buildId": "abc123"
}
```

### 3. **Enhanced Live Preview Panel** (`src/app/build/components/LivePreviewPanel.tsx`)

Complete redesign of the preview panel with dual-mode functionality:

#### **View Modes**:

1. **App Preview Mode** (Default)
   - Shows the running app in an iframe
   - Real-time interaction with generated app
   - Preview controls (refresh, stop)
   - Status indicators

2. **Code View Mode**
   - File tree navigator
   - Code viewer with syntax highlighting
   - File selection
   - Preserves all original functionality

#### **UI States**:

1. **No Build Selected**
   - Empty state with helpful message

2. **Build in Progress**
   - Loading animation
   - Skeleton UI preview

3. **Preview Starting**
   - Spinning loader
   - "Starting preview server..." message
   - Timeout indicator (60 seconds)

4. **Preview Running**
   - Iframe displaying the app
   - Green status bar with URL
   - Refresh and stop buttons
   - Full interaction enabled

5. **Preview Error**
   - Error icon and message
   - "Try Again" button
   - Specific error details

6. **Preview Not Started**
   - Empty state
   - "Start Preview" button
   - Manual trigger option

#### **Controls**:
- 🔄 **Refresh Button**: Reload the iframe
- ⏹️ **Stop Button**: Stop the preview server
- 👁️ **App Preview Tab**: Switch to iframe view
- 📄 **Code View Tab**: Switch to file tree view

### 4. **Auto-Start Behavior**

When a build completes:
1. BuildOrchestrator marks job as `complete`
2. SSE streams `done` event to frontend
3. Frontend detects `buildComplete` state change
4. LivePreviewPanel automatically calls `startPreviewServer()`
5. Preview server spawns and returns URL
6. UI switches to "App Preview" mode
7. Iframe loads and displays the app

### 5. **Security Features**

- **Port Range Restriction**: Only uses ports 5000-5999
- **Authentication**: All endpoints require Firebase auth token
- **Authorization**: Users can only preview their own builds
- **Path Validation**: Prevents directory traversal attacks
- **Iframe Sandbox**: Restricts iframe permissions
- **Process Isolation**: Each preview runs in isolated process

## File Structure

```
vibelybuild/
├── src/
│   ├── lib/
│   │   └── builder/
│   │       ├── BuildOrchestrator.ts       # Existing build system
│   │       └── PreviewServerManager.ts    # NEW: Server management
│   ├── app/
│   │   ├── api/
│   │   │   └── build/
│   │   │       └── preview/
│   │   │           ├── start/
│   │   │           │   └── route.ts       # NEW: Start endpoint
│   │   │           └── stop/
│   │   │               └── route.ts       # NEW: Stop endpoint
│   │   └── build/
│   │       ├── page.js                    # Build page (unchanged)
│   │       └── components/
│   │           └── LivePreviewPanel.tsx   # UPDATED: Enhanced preview
├── .cache/
│   └── vibecode/
│       └── <jobId>/
│           └── generated/                  # Generated Next.js app
│               ├── package.json
│               ├── next.config.js
│               └── src/...
└── LIVE_PREVIEW_FEATURE.md                # This file
```

## How It Works

### Build → Preview Flow

```
1. User submits build prompt
   ↓
2. BuildOrchestrator generates code
   ↓
3. Files saved to .cache/vibecode/<jobId>/generated/
   ↓
4. Build marked as complete
   ↓
5. Frontend detects completion
   ↓
6. LivePreviewPanel calls /api/build/preview/start
   ↓
7. PreviewServerManager spawns Next.js dev server
   ↓
8. Server starts on random port (e.g., 5234)
   ↓
9. Preview URL returned: http://localhost:5234
   ↓
10. Iframe loads and displays the app
```

### Server Lifecycle

```
Start
  ↓
[Port Allocation] → Random port from 5000-5999
  ↓
[Spawn Process] → npx next dev -p <port> -H 0.0.0.0
  ↓
[Monitor Output] → Wait for "Ready" message (max 60s)
  ↓
[Running] → Server accessible via http://localhost:<port>
  ↓
[Auto-Timeout] → Kill after 5 minutes
  ↓
[Cleanup] → Release port, remove from registry
  ↓
Stop
```

## Local Development

### Prerequisites

1. Node.js 18+ installed
2. Firebase Admin credentials configured
3. Environment variables set (`.env.local`)

### Running Locally

1. **Start the main dev server**:
   ```bash
   cd vibelybuild
   npm run dev
   ```
   Main app runs at: `http://localhost:3000`

2. **Build an app**:
   - Go to `/build` page
   - Enter a prompt (e.g., "Build a todo app")
   - Click "Build App"
   - Wait for build to complete

3. **Preview automatically starts**:
   - Preview server spawns on random port (e.g., `5123`)
   - Iframe displays at `http://localhost:5123`
   - You can interact with the generated app

4. **Test controls**:
   - Click 🔄 to refresh the preview
   - Click ⏹️ to stop the server
   - Click "Code View" to see files
   - Click "App Preview" to return to iframe

### Testing Edge Cases

1. **Port Conflict**:
   ```bash
   # Manually occupy a port to test conflict handling
   npx http-server -p 5100
   ```

2. **Server Crash**:
   - Edit generated app to have syntax errors
   - Preview should show error state

3. **Timeout**:
   - Wait 5 minutes
   - Server should auto-stop

4. **Multiple Builds**:
   - Create multiple builds
   - Each should get its own port
   - Switch between builds to test server reuse

## Deployment Considerations

### Production Deployment (Render.com)

**Important**: The current implementation works for **local development only**. For production deployment on Render.com:

#### Option 1: Static Build (Recommended)

Instead of running live dev servers in production:

1. **Build Static Bundle**:
   ```typescript
   // In BuildOrchestrator, after generating files:
   await runBuildCommand(jobId); // npm run build
   await exportStatic(jobId);    // npm run export
   ```

2. **Serve Static Files**:
   - Save built files to `/public/previews/<buildId>/`
   - Serve via: `https://yourdomain.com/previews/<buildId>/`
   - Update iframe src to use static URL

3. **Benefits**:
   - No port management needed
   - No process spawning
   - Faster load times
   - Better security
   - Works with serverless deployments

#### Option 2: Dedicated Preview Service

For truly dynamic previews in production:

1. **Separate Preview Server**:
   - Deploy a separate service for preview servers
   - Use containerization (Docker)
   - Reverse proxy to expose previews
   - Use Redis to track server states

2. **Architecture**:
   ```
   Main App (Render.com)
         ↓
   Preview Service API
         ↓
   Container Orchestrator (Docker Swarm / K8s)
         ↓
   Individual Preview Containers
   ```

3. **Implementation**:
   - Create `/api/build/preview/start` that calls preview service
   - Preview service creates Docker container
   - Returns public URL (e.g., `https://preview-abc123.yourdomain.com`)
   - Auto-cleanup after timeout

### Environment Variables

Add to `.env.local` or Render environment:

```bash
# Preview Server Config
PREVIEW_PORT_MIN=5000
PREVIEW_PORT_MAX=5999
PREVIEW_TIMEOUT_MS=300000  # 5 minutes
PREVIEW_STARTUP_TIMEOUT_MS=60000  # 60 seconds

# Production Mode
NODE_ENV=production
PREVIEW_MODE=static  # or "dynamic"
```

### Security Checklist

- [ ] Preview servers only accessible from localhost (development)
- [ ] Authentication required for all endpoints
- [ ] User can only access their own builds
- [ ] Port range restricted
- [ ] Timeouts enforced
- [ ] Process limits in place
- [ ] Static builds for production
- [ ] No sensitive data in generated apps

## Troubleshooting

### Preview Server Won't Start

**Symptom**: "Failed to start preview server" error

**Solutions**:
1. Check if generated app has valid `package.json`
2. Verify `next` is installed in generated app
3. Check port availability
4. Review server logs in console
5. Ensure build completed successfully

### Preview Shows Blank Page

**Symptom**: Iframe loads but shows white/blank page

**Solutions**:
1. Click refresh button
2. Check generated app for errors
3. Open preview URL directly in new tab
4. Check browser console for errors
5. Verify Next.js server is running

### Port Already in Use

**Symptom**: "Port already in use" error

**Solutions**:
1. Click "Try Again" - will use different port
2. Stop other preview servers
3. Restart main dev server
4. Check for orphaned Node processes

### Timeout Errors

**Symptom**: "Server startup timeout" error

**Solutions**:
1. Check if generated app has dependencies
2. Run `npm install` in generated folder manually
3. Increase `PREVIEW_STARTUP_TIMEOUT_MS`
4. Check for build errors in generated code

## API Usage Examples

### JavaScript/TypeScript

```typescript
// Start preview
async function startPreview(buildId: string) {
  const token = await firebase.auth().currentUser.getIdToken();

  const response = await fetch('/api/build/preview/start', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ buildId }),
  });

  const data = await response.json();

  if (data.success) {
    console.log('Preview URL:', data.previewUrl);
    return data.previewUrl;
  } else {
    throw new Error(data.error);
  }
}

// Stop preview
async function stopPreview(buildId: string) {
  const token = await firebase.auth().currentUser.getIdToken();

  await fetch('/api/build/preview/stop', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ buildId }),
  });

  console.log('Preview stopped');
}
```

### cURL

```bash
# Start preview
curl -X POST http://localhost:3000/api/build/preview/start \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -d '{"buildId":"abc123"}'

# Stop preview
curl -X POST http://localhost:3000/api/build/preview/stop \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -d '{"buildId":"abc123"}'
```

## Future Enhancements

### Planned Features

1. **Multi-Tab Preview**
   - Preview multiple pages simultaneously
   - Device frame simulation (mobile, tablet, desktop)
   - Responsive preview toggling

2. **Hot Reload Integration**
   - Edit code in Code View
   - See changes instantly in Preview
   - Two-way sync

3. **Preview Sharing**
   - Generate shareable preview links
   - Time-limited public access
   - Embed previews in external sites

4. **Performance Monitoring**
   - Track preview server resource usage
   - Auto-scale port range
   - Queue management for high traffic

5. **Advanced Controls**
   - Console output viewer
   - Network request inspector
   - React DevTools integration

## Support

For issues or questions:

1. Check the troubleshooting section above
2. Review server logs in terminal
3. Check browser console for errors
4. Verify Firebase authentication
5. Ensure build completed successfully

## Credits

Implemented by: Claude Code
Date: 2025-01-20
Version: 1.0.0
