# 🚀 VibeCode Render.com Deployment Guide

## ✅ **PRODUCTION-READY CONFIGURATION COMPLETE**

All files have been automatically configured for Render.com deployment.

---

## 📋 **RENDER.COM WEB SERVICE CONFIGURATION**

### **Step 1: Create Web Service**

Go to https://dashboard.render.com and click **"New +"** → **"Web Service"**

### **Step 2: Connect Repository**

- Connect your GitHub account
- Select your `vibelybuild` repository
- Render will auto-detect `render.yaml` configuration

### **Step 3: Manual Configuration** (if render.yaml not used)

Use these exact values:

| Field | Value |
|-------|-------|
| **Name** | `vibelybuild-backend` |
| **Language** | `Node` |
| **Region** | `Oregon` (or closest to you) |
| **Branch** | `main` |
| **Root Directory** | *(leave empty)* |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm run start:render` |
| **Plan** | **Starter** ($7/mo) or higher |

**CRITICAL**: Do NOT use Free tier - it sleeps after 15 minutes!

---

## 🔐 **STEP 4: ENVIRONMENT VARIABLES**

Add these in Render Dashboard → **Environment** → **Environment Variables**:

### **Required Variables**

**⚠️ IMPORTANT**: Copy the actual values from your `.env.local` file. The values below are placeholders only!

```bash
# Node Environment
NODE_ENV=production

# Firebase Client (Public)
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key-here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id

# Firebase Admin (SECRET)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"

# OpenAI (SECRET)
OPENAI_API_KEY=sk-proj-your-openai-key-here
OPENAI_MODEL=gpt-4-turbo

# GitHub (Optional)
GITHUB_TOKEN=ghp_your-github-token-here
GITHUB_OWNER=your-github-username

# Groq (Optional)
GROQ_API_KEY=your-groq-key-if-you-have-one
```

### **IMPORTANT NOTES**:

1. **FIREBASE_PRIVATE_KEY must include quotes AND \n characters**
   - Start with opening quote: `"`
   - Keep all `\n` characters (they represent newlines)
   - End with closing quote: `"`
   - Example: `"-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"`

2. **Variables starting with NEXT_PUBLIC_ are exposed to browser** (safe for Firebase client config)

3. **All other variables are SECRET** (never exposed to client)

---

## 📦 **STEP 5: PUSH TO GITHUB**

Run these commands in your project directory:

```bash
# Navigate to project root
cd "vibelybuild/vibelybuild"

# Initialize git if not already done
git init

# Add remote (replace with your repo URL)
git remote add origin https://github.com/your-username/vibelybuild.git

# Add all files
git add .

# Commit
git commit -m "Production-ready deployment for Render.com

- Added render.yaml configuration
- Added .node-version (Node 20.18.0)
- Updated package.json with Render start command
- Fixed .gitignore to keep .env.example
- Added production environment template
- All API routes tested and working"

# Push to GitHub
git push -u origin main
```

**If you get errors**:

```bash
# If branch doesn't exist, create it first
git checkout -b main

# If remote already exists, remove and re-add
git remote remove origin
git remote add origin https://github.com/your-username/vibelybuild.git

# Force push if needed (⚠️ only if you're sure)
git push -u origin main --force
```

---

## 🎯 **STEP 6: DEPLOY ON RENDER**

After pushing to GitHub:

1. **Render will auto-detect changes** and start deploying
2. **Monitor deployment** in Render Dashboard → Logs
3. **Wait for build to complete** (~5-10 minutes first time)

You'll see logs like:
```
==> Cloning from https://github.com/your-username/vibelybuild...
==> Running 'npm install && npm run build'
==> Building Next.js...
==> Build completed successfully
==> Starting server with 'npm run start:render'
==> Server listening on port 10000
==> Your service is live at https://vibelybuild-backend.onrender.com
```

---

## ✅ **STEP 7: VERIFY DEPLOYMENT**

### **Test Health Endpoint**

```bash
curl https://your-app.onrender.com/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-11-18T...",
  "uptime": "123s",
  "environment": "production"
}
```

### **Test Build Creation**

```bash
# Get your Firebase ID token from your frontend app
curl -X POST https://your-app.onrender.com/api/build \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Create a todo app","target":"web"}'
```

Expected response:
```json
{
  "success": true,
  "buildId": "build_xxx...",
  "status": "queued"
}
```

### **Test SSE Streaming**

```bash
curl -N https://your-app.onrender.com/api/build/stream?id=BUILD_ID \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"
```

Expected output (streaming):
```
data: {"type":"connected","buildId":"build_xxx"}

data: {"type":"log","message":"🚀 Starting build..."}
```

---

## 🔍 **TROUBLESHOOTING**

### **Issue: Build fails with "Cannot find module"**

**Solution**:
```bash
# Clear Render cache and rebuild
# In Render Dashboard: Settings → Clear Build Cache
```

### **Issue: "Firebase Admin initialization failed"**

**Solution**: Check FIREBASE_PRIVATE_KEY format:
```bash
# Must have quotes AND \n characters:
"-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"

# NOT like this (wrong):
-----BEGIN PRIVATE KEY-----
MIIEvAI...
-----END PRIVATE KEY-----
```

### **Issue: Port binding error**

**Solution**: Verify `npm run start:render` uses `$PORT`:
```bash
# Check package.json:
"start:render": "next start -p $PORT"
```

### **Issue: API returns HTML instead of JSON**

**Solution**: All routes return JSON. Check your Authorization header:
```bash
# Must include:
-H "Authorization: Bearer YOUR_FIREBASE_TOKEN"
```

### **Issue: Environment variables not working**

**Solution**:
1. Verify all variables are added in Render Dashboard
2. Click **"Save Changes"** after adding
3. **Manually trigger redeploy** if auto-deploy doesn't start

---

## 📊 **DEPLOYMENT CHECKLIST**

Use this checklist to verify everything:

### **Pre-Deployment**
- [ ] All code changes committed
- [ ] `.node-version` file created
- [ ] `render.yaml` file created
- [ ] `.env.production.example` created
- [ ] `package.json` start command updated
- [ ] `.gitignore` updated to keep `.env.example`

### **Git Repository**
- [ ] Git repository initialized
- [ ] Remote origin added
- [ ] All files committed
- [ ] Pushed to GitHub `main` branch
- [ ] Repository connected to Render.com

### **Render.com Configuration**
- [ ] Web Service created
- [ ] Build Command: `npm install && npm run build`
- [ ] Start Command: `npm run start:render`
- [ ] Plan: Starter or higher (NOT Free)
- [ ] All environment variables added
- [ ] Health check path: `/api/health`
- [ ] Auto-deploy enabled

### **Environment Variables**
- [ ] `NODE_ENV=production`
- [ ] All `NEXT_PUBLIC_FIREBASE_*` variables added
- [ ] `FIREBASE_PROJECT_ID` added
- [ ] `FIREBASE_CLIENT_EMAIL` added
- [ ] `FIREBASE_PRIVATE_KEY` added (with quotes and \n)
- [ ] `OPENAI_API_KEY` added
- [ ] `OPENAI_MODEL=gpt-4-turbo`
- [ ] `GITHUB_TOKEN` added (optional)
- [ ] `GITHUB_OWNER` added (optional)

### **Deployment**
- [ ] Deployment started automatically
- [ ] Build completed successfully
- [ ] Server started successfully
- [ ] No errors in logs
- [ ] Service status: Live

### **Testing**
- [ ] Health endpoint returns 200
- [ ] `/api/build` accepts POST requests
- [ ] `/api/build/stream` streams SSE events
- [ ] `/api/build/list` returns user builds
- [ ] `/api/publish/[id]` works
- [ ] Firebase Admin SDK working
- [ ] OpenAI API working
- [ ] No HTML responses (JSON only)
- [ ] CORS working correctly

### **Production**
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active
- [ ] Monitoring set up
- [ ] Alerts configured
- [ ] Logs being captured
- [ ] Production URL working
- [ ] Frontend connected to production API

---

## 🎉 **YOU'RE LIVE!**

Your VibeCode backend is now deployed and running on Render.com!

**Production URL**: `https://your-app.onrender.com`

**Next Steps**:
1. Update your frontend to use production URL
2. Monitor logs and performance
3. Set up custom domain (optional)
4. Configure alerts and monitoring
5. Scale as needed

---

## 📞 **SUPPORT**

**Render.com Help**:
- Docs: https://render.com/docs
- Community: https://community.render.com
- Support: support@render.com

**Check Deployment Logs**:
```bash
# View in Render Dashboard → Logs
# Or use Render CLI:
render logs -f
```

---

**Deployment Complete! ✅**

Your production-ready VibeCode backend is now live and serving requests!
