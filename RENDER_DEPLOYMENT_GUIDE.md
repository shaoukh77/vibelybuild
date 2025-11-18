# 🚀 VibeCode - Render.com Deployment Guide

## **Complete Production Deployment for Render.com**

This guide will walk you through deploying your VibeCode backend to Render.com with full support for:
- ✅ Long-running builds (no timeouts)
- ✅ Real-time SSE log streaming
- ✅ Firebase Admin SDK
- ✅ OpenAI GPT-4 Turbo integration
- ✅ Zero HTML responses (JSON only)
- ✅ Always-on server

---

## 📋 **Prerequisites**

1. **Render.com Account** - Sign up at https://render.com
2. **GitHub Repository** - Push your code to GitHub
3. **Firebase Project** - Have your Firebase service account JSON ready
4. **OpenAI API Key** - From https://platform.openai.com/api-keys
5. **GitHub Personal Access Token** - For publishing generated apps

---

## 🔧 **Step 1: Prepare Your Project**

### 1.1 Verify package.json

Your `package.json` should have these scripts:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start -p $PORT",
    "lint": "next lint"
  }
}
```

**IMPORTANT**: Render.com uses the `$PORT` environment variable. The `-p $PORT` is critical!

### 1.2 Verify Next.js Configuration

Your `next.config.mjs` should be minimal:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Render.com optimizations
  compress: true,
  poweredByHeader: false,

  // Allow longer API routes for builds
  serverRuntimeConfig: {
    maxDuration: 600 // 10 minutes
  }
};

export default nextConfig;
```

---

## 🎯 **Step 2: Create Web Service on Render**

### 2.1 Create New Web Service

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Select your `vibelybuild` project

### 2.2 Configure Service Settings

| Setting | Value |
|---------|-------|
| **Name** | `vibelybuild-prod` |
| **Environment** | `Node` |
| **Region** | Choose closest to users |
| **Branch** | `main` (or your default branch) |
| **Root Directory** | `vibelybuild` (if nested) |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |
| **Plan Type** | **Starter** ($7/mo) or higher |

**CRITICAL**: Free tier will sleep after 15 minutes of inactivity. Use Starter or higher for production.

### 2.3 Configure Instance Type

- **Minimum**: Starter (512 MB RAM)
- **Recommended**: Standard (2 GB RAM) for heavy builds

---

## 🔐 **Step 3: Environment Variables**

Add these in Render Dashboard → Environment → Environment Variables:

### **Required Variables**

```bash
# Node Environment
NODE_ENV=production

# Firebase Client (Public)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyABfVFnrD8bnG8d5sCbjZ9nexVgEq0Nes8
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=vibelybuild-ai.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=vibelybuild-ai
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=vibelybuild-ai.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1054875147631
NEXT_PUBLIC_FIREBASE_APP_ID=1:1054875147631:web:09f0f0901238559fdb9c9a
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-KSMXBQQ37B

# Firebase Admin (Server) - IMPORTANT!
FIREBASE_PROJECT_ID=vibelybuild-ai
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@vibelybuild-ai.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# OpenAI Configuration
OPENAI_API_KEY=sk-proj-...
OPENAI_MODEL=gpt-4-turbo

# GitHub Publishing (Optional but Recommended)
GITHUB_TOKEN=ghp_...
GITHUB_OWNER=your-github-username
GITHUB_DEFAULT_BRANCH=main
```

### **How to Get Firebase Private Key**

1. Go to Firebase Console: https://console.firebase.google.com
2. Select your project → **Settings** → **Service Accounts**
3. Click **"Generate New Private Key"**
4. Download the JSON file
5. Copy the values:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_PRIVATE_KEY` (keep the `\n` characters!)

**IMPORTANT**: The private key must be wrapped in quotes and contain literal `\n` characters:
```
"-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBg...\n-----END PRIVATE KEY-----\n"
```

---

## ⚙️ **Step 4: Advanced Settings**

### 4.1 Health Check Path

Set in Render Dashboard → Settings → Health Check:

```
Health Check Path: /api/health
```

This ensures Render knows your server is alive.

### 4.2 Auto-Deploy

Enable in Dashboard → Settings:

- ✅ Auto-Deploy: **Yes** (deploys on every push to main)

### 4.3 Persistent Disks (Optional)

If you need to store build artifacts:

1. Go to **Disks** → **Add Disk**
2. Mount Path: `/var/data`
3. Size: 1 GB (or more)

---

## 🚀 **Step 5: Deploy!**

1. Click **"Create Web Service"**
2. Render will:
   - Clone your repository
   - Run `npm install && npm run build`
   - Run `npm start`
   - Expose your app at `https://vibelybuild-prod.onrender.com`

### Monitor Deployment

Watch the **Logs** tab for:
```
[Firebase Admin] ✅ Successfully initialized
[Health] Server listening on port XXXXX
[Next.js] Ready on http://0.0.0.0:XXXXX
```

---

## ✅ **Step 6: Verify Deployment**

### 6.1 Test Health Endpoint

```bash
curl https://vibelybuild-prod.onrender.com/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-11-18T...",
  "uptime": "123s",
  "environment": "production",
  "version": "1.0.0"
}
```

### 6.2 Test Authentication

```bash
# Get your Firebase ID token from your app
curl -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  https://vibelybuild-prod.onrender.com/api/auth/me
```

Expected response:
```json
{
  "success": true,
  "user": {
    "uid": "...",
    "email": "user@example.com",
    "name": "User Name"
  }
}
```

### 6.3 Test Build Creation

From your frontend:
```javascript
const response = await authFetch('https://vibelybuild-prod.onrender.com/api/build', {
  method: 'POST',
  body: JSON.stringify({
    userId: 'your-user-id',
    prompt: 'Create a todo app with React',
    target: 'web'
  })
});

const data = await response.json();
console.log(data); // { success: true, id: "...", status: "queued" }
```

### 6.4 Test SSE Streaming

```bash
curl -N -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  "https://vibelybuild-prod.onrender.com/api/build/stream?id=BUILD_ID"
```

Expected output (streaming):
```
data: {"type":"connected","buildId":"..."}

data: {"type":"status","status":"running","appName":"My App"}

data: {"type":"log","message":"🚀 Starting VibeCode build pipeline..."}

data: {"type":"done","status":"complete"}
```

---

## 🔍 **Step 7: Troubleshooting**

### Issue: "Firebase Admin initialization failed"

**Solution**: Verify `FIREBASE_PRIVATE_KEY` has proper `\n` characters:
```bash
# Correct format (with \n):
"-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"

# Wrong format (no \n):
"-----BEGIN PRIVATE KEY-----MIIEvQ...-----END PRIVATE KEY-----"
```

### Issue: "Port already in use"

**Solution**: Ensure `package.json` has `-p $PORT`:
```json
"start": "next start -p $PORT"
```

### Issue: SSE stream returns HTML

**Solution**: Already fixed! All error handlers return JSON. Check your `Authorization` header.

### Issue: Build timeout

**Solution**: Render's timeout is 30 minutes for Starter plan. VibeCode builds timeout at 10 minutes (configurable in `buildQueue.js`).

### Issue: Server sleeps (Free Tier)

**Solution**: Upgrade to Starter plan ($7/mo) or higher. Free tier sleeps after 15 minutes.

---

## 📊 **Step 8: Monitoring & Logs**

### Real-time Logs

View in Render Dashboard → **Logs**:
```
[Build ABC123] Starting VibeCode build for user XYZ
[Build ABC123] Blueprint generation complete
[Build ABC123] GitHub publish success
```

### Metrics

View in Render Dashboard → **Metrics**:
- CPU usage
- Memory usage
- Request count
- Response time

### Alerts

Set up in Dashboard → **Notifications**:
- Deploy failed
- Service down
- High memory usage

---

## 🔄 **Step 9: Update Frontend URLs**

Update your frontend `authFetch` calls:

```javascript
// Before (local dev)
const API_BASE_URL = 'http://localhost:3000';

// After (production)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://vibelybuild-prod.onrender.com';
```

Add to your `.env.local`:
```bash
NEXT_PUBLIC_API_URL=https://vibelybuild-prod.onrender.com
```

---

## 🎯 **Step 10: Custom Domain (Optional)**

### Add Custom Domain

1. Go to Render Dashboard → **Settings** → **Custom Domains**
2. Click **"Add Custom Domain"**
3. Enter your domain: `api.vibelycode.com`
4. Add DNS records to your domain provider:

```
Type: CNAME
Name: api
Value: vibelybuild-prod.onrender.com
```

5. Wait for DNS propagation (5-60 minutes)
6. Render will auto-provision SSL certificate

---

## 🔐 **Security Checklist**

Before going live, verify:

- ✅ All environment variables are set
- ✅ Firebase security rules are production-ready
- ✅ No API keys in source code
- ✅ CORS headers configured (if needed)
- ✅ Rate limiting enabled (built-in: 3 concurrent builds)
- ✅ Error messages don't expose sensitive data (cleanError.js)
- ✅ Authentication required on all protected routes
- ✅ HTTPS enforced (automatic on Render)

---

## 📈 **Performance Optimization**

### 1. Enable Compression

Already enabled in `next.config.mjs`:
```javascript
compress: true
```

### 2. Optimize Build Queue

In `buildQueue.js`, adjust concurrency:
```javascript
const MAX_CONCURRENT_BUILDS = 5; // Increase for Standard plan
const BUILD_TIMEOUT = 15 * 60 * 1000; // 15 minutes
```

### 3. Cache Static Assets

Render automatically caches with CloudFlare CDN.

### 4. Monitor Memory Usage

Builds can be memory-intensive. Monitor in Dashboard and upgrade if needed.

---

## 🆘 **Getting Help**

**Render.com Support**:
- Documentation: https://render.com/docs
- Community: https://community.render.com
- Support: support@render.com

**VibeCode Issues**:
- Check logs in Render Dashboard
- Verify all environment variables
- Test endpoints with curl
- Review Firebase Console for auth issues

---

## ✅ **Deployment Checklist**

Before marking deployment as complete:

- [ ] Service created on Render.com
- [ ] All environment variables configured
- [ ] Health check endpoint returns 200
- [ ] Firebase Admin SDK initialized
- [ ] OpenAI API key working
- [ ] GitHub integration working (optional)
- [ ] SSE streaming endpoint working
- [ ] Build creation endpoint working
- [ ] Authentication working
- [ ] Custom domain configured (optional)
- [ ] Frontend pointing to production URL
- [ ] Monitoring and alerts set up

---

## 🎉 **You're Live!**

Your VibeCode backend is now running on Render.com with:
- ✅ Zero downtime
- ✅ Auto-scaling
- ✅ Automatic SSL
- ✅ Real-time log streaming
- ✅ Production-grade infrastructure

**Next Steps**:
1. Deploy your frontend (Vercel/Netlify)
2. Point frontend API calls to your Render.com URL
3. Monitor logs and metrics
4. Iterate and improve!

---

## 📚 **Additional Resources**

- [Render.com Documentation](https://render.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Server-Sent Events Specification](https://html.spec.whatwg.org/multipage/server-sent-events.html)

---

**Built with ❤️ by the VibeCode Team**
