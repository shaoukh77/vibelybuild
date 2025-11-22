# VibeBuild Production Deployment Guide

## 📋 Overview

This guide covers deploying VibeBuild with a **split architecture**:
- **Frontend (Next.js)** → Vercel
- **Backend (Preview Servers)** → Railway or Render

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  vibelybuildai.com                      │
│                  (Vercel - Next.js)                     │
│                                                         │
│  - Landing Page                                        │
│  - Pricing Page                                        │
│  - Auth (Firebase)                                     │
│  - UI Components                                       │
│  - Static Assets                                       │
└─────────────────┬───────────────────────────────────────┘
                  │
                  │ API Calls (HTTPS + Secret Key)
                  │
┌─────────────────▼───────────────────────────────────────┐
│             api.vibelybuildai.com                      │
│             (Railway/Render - Node.js)                  │
│                                                         │
│  - Preview Server Management                           │
│  - Build Orchestration                                 │
│  - Process Management                                  │
│  - Dynamic Port Allocation (4110-4990)                 │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Part 1: Deploy Backend (Railway or Render)

### Option A: Railway Deployment

#### 1. Install Railway CLI

```bash
npm install -g @railway/cli
railway login
```

#### 2. Create New Project

```bash
cd vibelybuild
railway init
```

#### 3. Set Environment Variables

```bash
railway variables set NODE_ENV=production
railway variables set PORT=3001
railway variables set FIREBASE_ADMIN_PROJECT_ID=your-project-id
railway variables set FIREBASE_ADMIN_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
railway variables set FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour\nKey\nHere\n-----END PRIVATE KEY-----\n"
railway variables set FRONTEND_URL=https://vibelybuildai.com
railway variables set API_SECRET_KEY=$(openssl rand -base64 32)
railway variables set CACHE_DIR=/tmp/vibecode
railway variables set PREVIEW_PORT_RANGE_START=4110
railway variables set PREVIEW_PORT_RANGE_END=4990
```

#### 4. Deploy

```bash
npm run deploy:railway
```

#### 5. Get Backend URL

```bash
railway domain
# Copy the URL (e.g., https://vibelybuild-backend.railway.app)
```

---

### Option B: Render Deployment

#### 1. Create New Web Service

1. Go to https://dashboard.render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: vibelybuild-backend
   - **Region**: Oregon (or closest to your users)
   - **Branch**: main
   - **Build Command**: `npm install && npm run build:backend`
   - **Start Command**: `npm run start:backend`
   - **Plan**: Starter ($7/month minimum)

#### 2. Add Environment Variables

In Render dashboard, add:

```
NODE_ENV=production
PORT=3001
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=your-service-account@email.com
FIREBASE_ADMIN_PRIVATE_KEY=your-private-key
FRONTEND_URL=https://vibelybuildai.com
API_SECRET_KEY=generate-a-random-32-char-string
CACHE_DIR=/tmp/vibecode
PREVIEW_PORT_RANGE_START=4110
PREVIEW_PORT_RANGE_END=4990
```

#### 3. Add Persistent Disk

1. Go to "Disks" tab
2. Click "Add Disk"
3. Configure:
   - **Name**: vibecode-cache
   - **Mount Path**: /tmp/vibecode
   - **Size**: 10 GB

#### 4. Deploy

Click "Create Web Service" - Render will auto-deploy.

#### 5. Get Backend URL

Copy from dashboard (e.g., https://vibelybuild-backend.onrender.com)

---

## 🌐 Part 2: Deploy Frontend (Vercel)

### 1. Install Vercel CLI

```bash
npm install -g vercel
vercel login
```

### 2. Link Project

```bash
cd vibelybuild
vercel link
```

### 3. Set Environment Variables

In Vercel dashboard or via CLI:

```bash
# Firebase Configuration
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY production
vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN production
vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID production
vercel env add NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET production
vercel env add NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID production
vercel env add NEXT_PUBLIC_FIREBASE_APP_ID production

# Backend URL (from Railway/Render)
vercel env add NEXT_PUBLIC_API_URL production
# Example: https://vibelybuild-backend.railway.app

# Frontend URL
vercel env add NEXT_PUBLIC_FRONTEND_URL production
# Example: https://vibelybuildai.com

# API Secret (must match backend)
vercel env add API_SECRET_KEY production
# Use the same value from Railway/Render
```

### 4. Deploy

```bash
npm run deploy:vercel
```

---

## 🌍 Part 3: Domain Configuration (vibelybuildai.com)

### Step 1: Purchase Domain

1. Go to Namecheap, GoDaddy, or Cloudflare
2. Purchase `vibelybuildai.com`

### Step 2: Configure DNS for Frontend

#### Option A: Using Vercel DNS (Recommended)

1. Go to Vercel Dashboard → Project Settings → Domains
2. Click "Add Domain"
3. Enter: `vibelybuildai.com`
4. Vercel will show nameservers:
   ```
   ns1.vercel-dns.com
   ns2.vercel-dns.com
   ```
5. Go to your domain registrar
6. Update nameservers to Vercel's nameservers
7. Wait 24-48 hours for DNS propagation

#### Option B: Using A Records

If keeping your existing DNS provider:

1. In Vercel Dashboard → Domains, click "Add Domain"
2. Vercel will show an IP address (e.g., `76.76.21.21`)
3. In your DNS provider, add these records:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   TTL: 3600

   Type: A
   Name: www
   Value: 76.76.21.21
   TTL: 3600
   ```

### Step 3: Configure DNS for Backend

Add these DNS records for `api.vibelybuildai.com`:

#### For Railway:

1. Get your Railway domain (e.g., `vibelybuild-backend.railway.app`)
2. Add CNAME record:
   ```
   Type: CNAME
   Name: api
   Value: vibelybuild-backend.railway.app
   TTL: 3600
   ```

#### For Render:

1. Get your Render domain (e.g., `vibelybuild-backend.onrender.com`)
2. Add CNAME record:
   ```
   Type: CNAME
   Name: api
   Value: vibelybuild-backend.onrender.com
   TTL: 3600
   ```

### Step 4: Enable SSL

- **Vercel**: Automatically provisions SSL certificates
- **Railway**: Automatically provisions SSL for custom domains
- **Render**: Automatically provisions SSL for custom domains

### Step 5: Update Environment Variables

After DNS is configured, update URLs:

```bash
# Frontend (Vercel)
vercel env rm NEXT_PUBLIC_API_URL production
vercel env add NEXT_PUBLIC_API_URL production
# Value: https://api.vibelybuildai.com

vercel env rm NEXT_PUBLIC_FRONTEND_URL production
vercel env add NEXT_PUBLIC_FRONTEND_URL production
# Value: https://vibelybuildai.com

# Backend (Railway/Render)
railway variables set FRONTEND_URL=https://vibelybuildai.com
# OR for Render: update in dashboard
```

### Step 6: Redeploy

```bash
# Redeploy frontend
vercel --prod

# Redeploy backend
railway up
# OR trigger redeploy in Render dashboard
```

---

## 🔒 Security Checklist

### 1. API Secret Key

Generate a secure random key:

```bash
openssl rand -base64 32
```

Use this same key in both:
- Frontend: `API_SECRET_KEY`
- Backend: `API_SECRET_KEY`

### 2. Firebase Service Account

1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate New Private Key"
3. Download JSON file
4. Extract values for environment variables:
   ```
   FIREBASE_ADMIN_PROJECT_ID=<project_id>
   FIREBASE_ADMIN_CLIENT_EMAIL=<client_email>
   FIREBASE_ADMIN_PRIVATE_KEY=<private_key>
   ```

### 3. CORS Configuration

Update `server/index.ts` CORS origins:

```typescript
app.use(cors({
  origin: [
    'https://vibelybuildai.com',
    'https://www.vibelybuildai.com'
  ],
  credentials: true
}));
```

### 4. Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null
                         && request.auth.uid == userId;
    }

    match /waitlist/{docId} {
      allow create: if request.auth != null;
      allow read, update, delete: if false;
    }
  }
}
```

Deploy rules:
```bash
firebase deploy --only firestore:rules
```

---

## 📊 Monitoring & Logging

### Vercel Logs

```bash
vercel logs
vercel logs --follow
```

### Railway Logs

```bash
railway logs
railway logs --follow
```

### Render Logs

Available in Render Dashboard → Logs tab

### Health Checks

```bash
# Backend health
curl https://api.vibelybuildai.com/health

# Expected response:
{
  "status": "healthy",
  "timestamp": "2025-01-22T10:00:00Z",
  "uptime": 12345,
  "env": "production"
}
```

---

## 🧪 Testing Production

### 1. Test Backend API

```bash
# Start preview (with API secret)
curl -X POST https://api.vibelybuildai.com/api/preview/start \
  -H "Authorization: Bearer YOUR_API_SECRET_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "buildId": "test123",
    "projectPath": "/tmp/test",
    "userId": "test-user"
  }'
```

### 2. Test Frontend

```bash
# Visit production site
open https://vibelybuildai.com

# Test pages
open https://vibelybuildai.com/pricing
open https://vibelybuildai.com/early-access
```

### 3. Test Build Flow

1. Sign up on production site
2. Click "Start Building Free"
3. Complete checkout
4. Create a test build
5. Verify preview loads

---

## 🔄 CI/CD Pipeline

### Auto-Deploy on Push

#### Vercel (Frontend)

Automatically deploys on:
- Push to `main` → Production
- Pull Requests → Preview deployments

#### Railway (Backend)

Automatically deploys on push to `main`:

```bash
# Enable auto-deploy
railway link
railway up --detach
```

#### Render (Backend)

Auto-deploys enabled by default for connected repos.

---

## 📈 Scaling Configuration

### Vercel

- **Free Plan**: 100 GB bandwidth/month
- **Pro Plan**: $20/month - Unlimited bandwidth
- Auto-scales automatically

### Railway

- **Starter Plan**: $5/month
- **Developer Plan**: $20/month
- Scales based on CPU/RAM usage

### Render

- **Starter Plan**: $7/month - 0.5 GB RAM
- **Standard Plan**: $25/month - 2 GB RAM
- Auto-scales with traffic

---

## 🚨 Troubleshooting

### Issue: Backend not reachable

```bash
# Check backend health
curl https://api.vibelybuildai.com/health

# Check environment variables
railway variables
# OR check Render dashboard

# Check logs
railway logs --tail 100
```

### Issue: CORS errors

1. Verify `FRONTEND_URL` matches production domain
2. Check CORS configuration in `server/index.ts`
3. Redeploy backend

### Issue: Preview servers not starting

1. Check `CACHE_DIR` is writable
2. Verify port range is available
3. Check disk space (Railway/Render)
4. Review backend logs

### Issue: Firebase auth not working

1. Add production domain to Firebase authorized domains
2. Go to Firebase Console → Authentication → Settings → Authorized domains
3. Add: `vibelybuildai.com`

---

## 📝 Post-Deployment Checklist

- [ ] Frontend deployed to Vercel
- [ ] Backend deployed to Railway/Render
- [ ] Custom domains configured
- [ ] SSL certificates active
- [ ] Environment variables set
- [ ] API secret keys match
- [ ] Firebase auth configured
- [ ] Firestore rules deployed
- [ ] Health checks passing
- [ ] Test build flow works
- [ ] Monitoring enabled
- [ ] Backups configured

---

## 🔗 Useful Links

- **Frontend**: https://vibelybuildai.com
- **Backend API**: https://api.vibelybuildai.com
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Railway Dashboard**: https://railway.app/dashboard
- **Render Dashboard**: https://dashboard.render.com
- **Firebase Console**: https://console.firebase.google.com

---

## 💡 Pro Tips

1. **Use Vercel Preview Deployments** for testing before production
2. **Enable Vercel Analytics** for performance monitoring
3. **Set up Sentry** for error tracking
4. **Use Railway CLI** for quick backend debugging
5. **Monitor disk usage** on backend server (cache can grow)
6. **Set up backup cron jobs** for Firestore data
7. **Use environment-specific Firebase projects** (dev/staging/prod)

---

## 🆘 Support

If you encounter issues:

1. Check logs: `railway logs` or Vercel/Render dashboard
2. Verify environment variables
3. Test health endpoints
4. Review this guide
5. Check GitHub Issues

---

**Last Updated**: 2025-01-22
**Version**: 1.0.0
**Status**: Production Ready
