# Vercel Deployment Guide - VibelyBuild.AI

## Overview

VibelyBuild.AI is now a **fully serverless application** that runs entirely on Vercel. All backend functionality has been migrated from Express/Node to Next.js API routes.

**Key Changes:**
- ✅ No separate backend server needed
- ✅ All APIs run as Next.js API routes
- ✅ Serverless preview system
- ✅ Single deployment on Vercel
- ✅ Simplified architecture

---

## Architecture

### Before (Dual Deployment)
```
┌─────────────────┐         ┌─────────────────┐
│  Vercel         │         │  Render.com     │
│  (Frontend)     │────────▶│  (Backend)      │
│  Next.js        │  HTTPS  │  Express Server │
└─────────────────┘         └─────────────────┘
```

### After (Single Deployment)
```
┌──────────────────────────────┐
│         Vercel               │
│  ┌────────────────────────┐  │
│  │  Next.js App Router    │  │
│  │  - Frontend Pages      │  │
│  │  - API Routes          │  │
│  │  - Preview System      │  │
│  └────────────────────────┘  │
└──────────────────────────────┘
```

---

## API Routes

All API routes are now under `src/app/api/`:

### Build Management
- `POST /api/build` - Create new build
- `POST /api/build-app` - Execute build pipeline
- `GET /api/build/list` - List user builds
- `GET /api/build/logs` - Get build logs
- `GET /api/build/output` - Get build output
- `DELETE /api/build/delete` - Delete build
- `GET /api/build/stream` - Stream build logs (SSE)
- `POST /api/build/start` - Start build process

### Preview System (Serverless)
- `GET /api/preview/[jobId]` - Serve generated app preview
- `GET /api/build/preview?jobId=XYZ` - Get preview status
- `POST /api/build/preview/stop` - Stop preview (no-op)
- `POST /api/build/preview/restart` - Restart preview

### Publishing
- `POST /api/publish` - Publish to GitHub
- `GET /api/publish/[id]` - Get published app
- `POST /api/store/publish` - Store publish

### Other
- `GET /api/health` - Health check
- `GET /api/auth/me` - Get user info
- `POST /api/ads/generate` - Generate AI ads
- `GET /api/download/[buildId]` - Download build artifact

---

## Deployment Steps

### 1. Prerequisites

- Vercel account ([vercel.com](https://vercel.com))
- Firebase project with Authentication, Firestore, and Storage enabled
- At least one AI API key (OpenAI, Anthropic, Google, or Groq)

### 2. Deploy to Vercel

#### Option A: Import from GitHub

1. Push your code to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your repository
4. Vercel will auto-detect Next.js

#### Option B: Deploy from CLI

```bash
npm install -g vercel
vercel
```

### 3. Configure Environment Variables

Go to **Project Settings > Environment Variables** and add:

#### Firebase (Client - Public)
```
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123:web:abc123
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-ABC123 (optional)
```

#### Firebase (Server - Secret)
```
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY_HERE\n-----END PRIVATE KEY-----\n"
```

#### AI Providers (At least one)
```
OPENAI_API_KEY=sk-proj-...
OPENAI_MODEL=gpt-4-turbo
# OR
ANTHROPIC_API_KEY=sk-ant-...
# OR
GOOGLE_API_KEY=...
# OR
GROQ_API_KEY=gsk_...
```

#### GitHub (Optional - for publishing)
```
GITHUB_TOKEN=ghp_...
GITHUB_OWNER=your-username
GITHUB_DEFAULT_BRANCH=main
```

#### Other
```
NODE_ENV=production
DEBUG=false
```

### 4. Deploy

Click **Deploy** or run:

```bash
vercel --prod
```

---

## Serverless Preview System

### How It Works

1. **Build Completion**: When a build finishes, files are saved to `.cache/vibecode/[jobId]/generated/`
2. **Preview Request**: User requests `/api/preview/[jobId]`
3. **File Serving**: API route reads files, bundles them, and serves as HTML
4. **Rendering**: Frontend displays in iframe

### Supported App Types

- ✅ HTML/CSS/JS apps (direct serving)
- ✅ React apps (bundled with Babel standalone)
- ⚠️ Next.js apps (code preview only - download for full functionality)

### Limitations

Serverless previews cannot:
- Run long-running dev servers
- Execute npm install/build in real-time
- Support server-side rendering with live reload

For full functionality, users should download and run the generated code locally.

---

## File Structure

```
vibelybuild/
├── src/
│   ├── app/
│   │   ├── api/              # All API routes
│   │   │   ├── build/        # Build management
│   │   │   ├── preview/      # Preview system
│   │   │   ├── publish/      # Publishing
│   │   │   └── [...]
│   │   ├── build/            # Build UI page
│   │   └── layout.js         # Root layout
│   ├── components/           # React components
│   └── lib/
│       ├── api/
│       │   └── backendClient.ts  # API client (now uses relative paths)
│       ├── builder/
│       │   └── BuildOrchestrator.ts  # Build system
│       ├── authFetch.js      # Auth helper
│       └── [...]
├── public/                   # Static assets
├── .env.local               # Local environment variables
├── .env.example             # Environment template
├── .env.production.example  # Production template (Vercel)
├── vercel.json              # Vercel configuration
├── package.json             # Dependencies
└── next.config.mjs          # Next.js configuration
```

---

## Removed Files/Directories

The following were removed during migration:

- ❌ `server/` - Express backend
- ❌ `render.yaml` - Render configuration
- ❌ `render-build.sh` - Render build script
- ❌ `railway.json` - Railway configuration
- ❌ `tsconfig.backend.json` - Backend TypeScript config
- ❌ `express` and `cors` npm packages

---

## Environment Variables (Vercel)

### Required

| Variable | Type | Description |
|----------|------|-------------|
| `NEXT_PUBLIC_FIREBASE_*` | Public | Firebase client config |
| `FIREBASE_PROJECT_ID` | Secret | Firebase admin project ID |
| `FIREBASE_CLIENT_EMAIL` | Secret | Firebase admin email |
| `FIREBASE_PRIVATE_KEY` | Secret | Firebase admin private key |
| At least one AI key | Secret | OpenAI/Anthropic/Google/Groq |

### Optional

| Variable | Type | Description |
|----------|------|-------------|
| `GITHUB_TOKEN` | Secret | For publishing to GitHub |
| `GITHUB_OWNER` | Secret | GitHub username |
| `DEBUG` | Secret | Enable debug logging |

### No Longer Needed

- ~~`NEXT_PUBLIC_API_URL`~~ - Backend URL (removed)
- ~~`API_SECRET_KEY`~~ - Backend auth key (removed)
- ~~`FRONTEND_URL`~~ - CORS origin (removed)
- ~~`PORT`~~ - Vercel manages ports automatically

---

## Testing Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env.local
# Edit .env.local with your API keys
```

### 3. Run Development Server
```bash
npm run dev
```

Visit: http://localhost:3000

### 4. Test Build
```bash
npm run build
npm start
```

---

## Vercel Configuration (`vercel.json`)

```json
{
  "version": 2,
  "name": "vibelybuild",
  "regions": ["iad1"],
  "functions": {
    "api/**/*.ts": { "maxDuration": 60 },
    "api/**/*.js": { "maxDuration": 60 }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Access-Control-Allow-Methods", "value": "GET,OPTIONS,PATCH,DELETE,POST,PUT" }
      ]
    }
  ]
}
```

**Key Settings:**
- `maxDuration: 60` - Serverless functions can run up to 60 seconds (upgrade for more)
- CORS headers for API routes
- No external rewrites needed

---

## Troubleshooting

### Build Fails

**Error**: `Cannot find module '../../../../../server/preview/previewManager'`
- **Cause**: Old imports referencing deleted Express backend
- **Fix**: Should be fixed by migration. If not, search for `from '../../../server` and update imports

### Preview Not Working

**Error**: Preview shows error or blank page
- **Cause**: Generated files not found or incorrect format
- **Fix**: Check `.cache/vibecode/[jobId]/generated/` directory exists
- **Check**: Logs in `/api/preview/[jobId]/route.ts`

### Environment Variables Missing

**Error**: `Firebase config missing` or `AI provider error`
- **Cause**: Environment variables not set in Vercel
- **Fix**: Go to Project Settings > Environment Variables and add all required vars
- **Tip**: Use `.env.production.example` as reference

### Serverless Function Timeout

**Error**: `FUNCTION_INVOCATION_TIMEOUT`
- **Cause**: Build takes longer than 60 seconds
- **Fix**: Upgrade to Pro plan (5-minute limit) or optimize build process
- **Workaround**: Break large builds into smaller steps

---

## Performance Tips

### 1. Enable Caching

```typescript
// In API routes
export const revalidate = 3600; // Cache for 1 hour
```

### 2. Optimize Build Output

- Minimize generated file size
- Use code splitting
- Compress assets

### 3. Use Edge Functions (Coming Soon)

For faster global response times, consider migrating lightweight API routes to Vercel Edge Functions.

---

## Migration Summary

### What Changed

1. **Backend Architecture**
   - Removed standalone Express server
   - Converted all routes to Next.js API routes
   - Implemented serverless preview system

2. **API Client**
   - Updated `backendClient.ts` to use relative paths
   - Removed `NEXT_PUBLIC_API_URL` dependency
   - All API calls now go to `/api/*`

3. **Preview System**
   - Replaced long-running preview servers with static file serving
   - Created `/api/preview/[jobId]` endpoint
   - Simplified preview state management

4. **Configuration**
   - Removed Render/Railway config files
   - Updated `vercel.json` for single deployment
   - Cleaned up environment variables

### What Stayed the Same

- Frontend UI and UX
- Build generation logic
- Firebase integration
- AI provider integration
- Authentication system
- File structure (except `server/` removal)

---

## Next Steps

1. ✅ Deploy to Vercel
2. ✅ Configure environment variables
3. ✅ Test build and preview functionality
4. 🔄 Monitor Vercel dashboard for errors
5. 🔄 Set up custom domain (optional)
6. 🔄 Configure Firebase security rules
7. 🔄 Set up monitoring/analytics

---

## Support

- **Documentation**: Check this guide and other MD files in the repo
- **Vercel Issues**: [vercel.com/support](https://vercel.com/support)
- **Firebase Issues**: [firebase.google.com/support](https://firebase.google.com/support)

---

## Cost Estimate

### Vercel
- **Hobby (Free)**: 100GB bandwidth, 60s function duration
- **Pro ($20/mo)**: 1TB bandwidth, 300s function duration, analytics

### Firebase
- **Spark (Free)**: 1GB storage, 10GB download, 50K reads
- **Blaze (Pay-as-you-go)**: ~$5-20/mo for small apps

### AI APIs
- **OpenAI**: ~$0.01-0.03 per build
- **Anthropic**: ~$0.008-0.024 per build

**Total**: ~$0-25/mo depending on usage

---

## Conclusion

Your VibelyBuild.AI app is now fully serverless and ready for Vercel! 🚀

All backend logic runs as Next.js API routes, making deployment and scaling effortless. No more managing separate servers!
