# Live Preview Feature - Quick Start Guide

## What's New?

Your VibeCode builder now shows **REAL running apps** instead of just code files!

When you build an app, you'll see:
- ✅ **Live iframe preview** with the actual generated Next.js app
- ✅ **Interactive UI** - click buttons, navigate pages, test features
- ✅ **Tab switching** between "App Preview" and "Code View"
- ✅ **Auto-start** - preview launches automatically when build completes
- ✅ **Controls** - refresh, stop, and restart preview servers

## How to Use (3 Steps)

### 1. Start Your Dev Server

```bash
cd vibelybuild
npm run dev
```

Your main app runs at: http://localhost:3000

### 2. Build an App

1. Navigate to http://localhost:3000/build
2. Sign in with Google (if not already signed in)
3. Enter a prompt (example: "Build a todo app with dark mode")
4. Click "Build App"
5. Watch the build logs stream

### 3. See Your App Live!

When the build completes:
- Preview server **automatically starts** (takes ~1-2 minutes)
- Installing dependencies and launching Next.js dev server
- **Iframe appears** showing your generated app running
- You can **interact** with it - click buttons, fill forms, navigate pages

## UI Walkthrough

### Main Build Page (3 Columns)

```
┌────────────┬───────────────┬──────────────────┐
│   Prompt   │  Build Logs   │  Live Preview    │
│  & Builds  │               │                  │
│            │               │  [App Preview]   │
│            │               │  [Code View]     │
│            │               │                  │
│            │               │  ┌──────────────┐│
│            │               │  │  Your App    ││
│            │               │  │  Running     ││
│            │               │  │  Here!       ││
│            │               │  └──────────────┘│
└────────────┴───────────────┴──────────────────┘
```

### Preview Panel Tabs

**👁️ App Preview** (Default)
- Shows running app in iframe
- Preview URL: `http://localhost:5XXX` (random port)
- Controls: 🔄 Refresh | ⏹️ Stop

**📄 Code View**
- File tree navigator
- Code viewer with syntax highlighting
- Browse generated files

### Preview States

1. **Starting** 🔄
   - Spinner animation
   - "Installing dependencies..."
   - Progress message

2. **Running** ✅
   - Green status bar with URL
   - Interactive iframe
   - Full app functionality

3. **Error** ⚠️
   - Error message
   - "Try Again" button
   - Specific error details

## Testing the Feature

### Test Case 1: Simple App
```
Prompt: "Build a simple landing page with a hero section"
Expected: Preview shows the landing page with hero
```

### Test Case 2: Multi-Page App
```
Prompt: "Build a portfolio site with home, about, and contact pages"
Expected: Preview shows all pages, navigation works
```

### Test Case 3: Interactive App
```
Prompt: "Build a todo app with add, delete, and mark complete"
Expected: Preview allows adding/deleting todos, checkboxes work
```

## Controls & Features

### Refresh Preview
- Click 🔄 button to reload iframe
- Useful after making changes
- Preserves preview server

### Stop Preview
- Click ⏹️ button to stop server
- Releases port and resources
- Can restart manually

### Switch Views
- **App Preview**: See running app
- **Code View**: Browse source files
- Toggle anytime during session

### Auto-Restart
- Preview auto-starts when build completes
- No manual intervention needed
- Smart port allocation (5000-5999)

## Troubleshooting

### "Preview server failed to start"

**Possible Causes:**
- Dependencies didn't install correctly
- Port already in use
- Generated app has errors

**Solutions:**
1. Click "Try Again"
2. Check browser console for errors
3. Review build logs for issues
4. Restart main dev server

### "Blank white screen in preview"

**Solutions:**
1. Wait 10-20 seconds for Next.js to compile
2. Click refresh button (🔄)
3. Open preview URL in new tab to see errors
4. Check generated app for syntax errors

### "Preview timeout"

**Cause:** Dependency installation or server startup took too long

**Solutions:**
1. Check internet connection (for npm install)
2. Try again - dependencies are cached after first install
3. Manually install: `cd .cache/vibecode/<buildId>/generated && npm install`

### Preview server won't stop

**Solution:**
1. Restart main dev server
2. Kill Node processes manually:
   ```bash
   lsof -ti:5XXX | xargs kill -9  # Replace 5XXX with port
   ```

## File Structure

```
vibelybuild/
├── src/
│   ├── lib/builder/
│   │   ├── BuildOrchestrator.ts       # Build system
│   │   └── PreviewServerManager.ts    # NEW: Preview servers
│   ├── app/
│   │   ├── api/build/preview/
│   │   │   ├── start/route.ts         # NEW: Start API
│   │   │   └── stop/route.ts          # NEW: Stop API
│   │   └── build/
│   │       └── components/
│   │           └── LivePreviewPanel.tsx  # UPDATED: Enhanced UI
├── .cache/vibecode/                   # Generated apps
│   └── <buildId>/
│       └── generated/
│           ├── package.json
│           ├── node_modules/          # Auto-installed
│           └── src/...
└── LIVE_PREVIEW_FEATURE.md            # Full documentation
```

## Advanced Usage

### Manual Preview Control

```typescript
// In browser console or React component

// Start preview
const response = await fetch('/api/build/preview/start', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${yourToken}`,
  },
  body: JSON.stringify({ buildId: 'your-build-id' }),
});

const data = await response.json();
console.log('Preview URL:', data.previewUrl);

// Stop preview
await fetch('/api/build/preview/stop', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${yourToken}`,
  },
  body: JSON.stringify({ buildId: 'your-build-id' }),
});
```

### Check Running Servers

```bash
# See all preview servers
lsof -i :5000-5999

# Kill specific preview
lsof -ti:5123 | xargs kill -9  # Replace 5123 with actual port
```

### Access Preview Directly

Open the preview URL in a new browser tab:
```
http://localhost:5123  # Use the actual port shown in UI
```

## Production Deployment

**⚠️ Important:** This feature is designed for **local development only**.

For production on Render.com:
- Preview servers won't work (no child process spawning)
- Use **static build approach** instead
- See `LIVE_PREVIEW_FEATURE.md` for production strategies

### Production Alternative

Instead of live servers, generate static builds:
1. Run `npm run build` on generated app
2. Export static files to `/public/previews/<buildId>/`
3. Serve via static URL: `https://yourdomain.com/previews/<buildId>/`

## Performance Tips

### First Preview Startup
- Takes 1-2 minutes (npm install + Next.js compile)
- Subsequent previews are faster (dependencies cached)
- Port reuse when switching back to same build

### Resource Usage
- Each preview uses ~200-400MB RAM
- Auto-cleanup after 5 minutes of inactivity
- Max 100 ports available (5000-5999)

### Speed Optimization
1. Use Code View while waiting for preview
2. Preview runs in background, work continues
3. Dependencies installed once per build
4. Server stays alive for 5 minutes (reusable)

## What's Preserved

All original features still work:

✅ **SSE Build Logs** - Real-time streaming
✅ **File Tree Viewer** - Browse generated files
✅ **Code Preview** - Syntax-highlighted source
✅ **ZIP Download** - Export complete project
✅ **Build History** - View past builds
✅ **Firebase Auth** - Secure access control

## Next Steps

1. **Try it now**: Build a simple app and see the preview
2. **Test interactions**: Click buttons, fill forms, navigate pages
3. **Browse code**: Switch to Code View to inspect files
4. **Download**: Export the ZIP and run locally
5. **Deploy**: Push to Vercel/Netlify for production

## Support

Need help?
- Check `LIVE_PREVIEW_FEATURE.md` for detailed documentation
- Review build logs for errors
- Open browser console for debugging
- Ensure Firebase auth is working

## Example Session

```bash
# 1. Start dev server
npm run dev

# 2. Browser: http://localhost:3000/build
# 3. Enter prompt: "Build a calculator app"
# 4. Click "Build App"
# 5. Wait for logs to complete
# 6. Preview automatically starts
# 7. See calculator running in iframe
# 8. Click buttons - it works!
# 9. Switch to Code View to see the source
# 10. Download ZIP to run locally
```

## Video Demo (Imagined Flow)

1. User lands on build page
2. Types "Build a weather app"
3. Clicks "Build App"
4. Logs stream in real-time
5. "Starting preview server..." appears
6. Spinner for 1-2 minutes
7. Weather app appears in iframe
8. User clicks search, enters city
9. Weather data appears (mock)
10. User clicks Code View tab
11. Sees React components
12. Downloads ZIP
13. Runs `npm run dev` locally
14. Same app runs on localhost:3000!

---

**Enjoy your new live preview feature! 🎉**

Built with ❤️ by Claude Code
