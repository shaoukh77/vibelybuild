# 🚀 VibeCode Backend - Deployment Guide

## Production Deployment on Render.com

### Prerequisites

1. **Firebase Project** with:
   - Firestore Database enabled
   - Firebase Authentication enabled
   - Service Account credentials downloaded

2. **OpenAI API Key** for GPT-4.1

3. **GitHub Account** (optional, for code publishing)

---

## Step 1: Prepare Firebase Service Account

### Download Service Account Key

1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate New Private Key"
3. Save the JSON file securely
4. Convert to single-line JSON for Render.com:

```bash
# On Mac/Linux
cat serviceAccountKey.json | jq -c '.' | pbcopy

# Or manually remove all newlines
```

---

## Step 2: Deploy to Render.com

### Create New Web Service

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:

**Build Settings:**
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`
- **Environment:** `Node`
- **Node Version:** `20.x` (or latest LTS)

**Environment Variables:**

Add all variables from `.env.example`:

| Key | Value | Notes |
|-----|-------|-------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Your Firebase API key | From Firebase console |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | your-project.firebaseapp.com | From Firebase console |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | your-project-id | From Firebase console |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | your-project.appspot.com | From Firebase console |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | 123456789 | From Firebase console |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | 1:123:web:abc | From Firebase console |
| `FIREBASE_SERVICE_ACCOUNT_KEY` | {"type":"service_account"...} | **One-line JSON!** |
| `OPENAI_API_KEY` | sk-proj-xxxxx | From OpenAI dashboard |
| `AI_MODEL` | gpt-4-turbo-preview | Or gpt-4-1106-preview |
| `NODE_ENV` | production | Important! |
| `GITHUB_TOKEN` | ghp_xxxxx | Optional |
| `GITHUB_OWNER` | your-username | Optional |

---

## Step 3: Configure Firestore Rules

Deploy these rules to Firebase:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Builds collection
    match /builds/{buildId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update: if request.auth != null && resource.data.userId == request.auth.uid;
    }

    // Build logs collection
    match /buildLogs/{logId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
    }
  }
}
```

---

## Step 4: Verify Deployment

### Test Health Check

```bash
curl https://your-app.onrender.com/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-01-18T...",
  "uptime": "123s",
  "environment": "production"
}
```

### Test Authentication

```bash
curl -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  https://your-app.onrender.com/api/auth/me
```

### Test Build Creation

```bash
curl -X POST https://your-app.onrender.com/api/build \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "YOUR_USER_ID",
    "prompt": "Create a todo app with authentication",
    "target": "web"
  }'
```

---

## Step 5: Monitor Logs

```bash
# View Render logs
render logs --tail

# Check for errors
render logs | grep ERROR
```

---

## Troubleshooting

### Issue: "Firebase Admin initialization failed"

**Solution:**
- Verify `FIREBASE_SERVICE_ACCOUNT_KEY` is a single-line JSON
- Check all quotes are properly escaped
- Ensure the service account has Firestore and Auth permissions

### Issue: "OpenAI API rate limit"

**Solution:**
- Check your OpenAI usage limits
- Upgrade to higher tier if needed
- Implement request queuing (already done in buildQueue.js)

### Issue: "Server keeps sleeping"

**Solution:**
- Upgrade to Render Paid plan (keeps server always alive)
- Or set up a ping service (every 5 minutes):
  ```bash
  curl https://your-app.onrender.com/serverAlive.txt
  ```

### Issue: "SSE streams not working"

**Solution:**
- Verify `X-Accel-Buffering: no` header is set (already done)
- Check Render doesn't buffer responses
- Ensure client handles SSE properly with EventSource

---

## Performance Optimization

### 1. Enable Build Caching

Add to `package.json`:
```json
{
  "cacheDirectories": [
    ".next/cache"
  ]
}
```

### 2. Database Indexing

Create composite index in Firebase:
- Collection: `buildLogs`
- Fields: `buildId` (Ascending), `userId` (Ascending), `createdAt` (Ascending)

### 3. Rate Limiting

Already configured in `buildQueue.js`:
- Max 3 concurrent builds
- 10-minute timeout per build

---

## Scaling

### Horizontal Scaling

Render auto-scales with:
- Multiple instances
- Load balancing
- Zero downtime deploys

### Vertical Scaling

Upgrade instance size in Render dashboard.

---

## Security Checklist

- [x] Firebase Admin SDK properly initialized
- [x] All API routes verify Firebase tokens
- [x] No sensitive data in logs
- [x] CORS properly configured
- [x] Rate limiting enabled
- [x] Input validation on all endpoints
- [x] Error messages don't leak internal info

---

## Monitoring

### Key Metrics to Track

1. **Build Success Rate**
   - Query Firestore: `builds where status == 'complete'`

2. **Average Build Time**
   - Calculate: `completedAt - createdAt`

3. **API Response Times**
   - Monitor: `/api/build`, `/api/build/stream`

4. **Error Rates**
   - Track: 5xx responses

### Recommended Tools

- **Render Metrics** (built-in)
- **Firebase Console** (Firestore usage)
- **OpenAI Dashboard** (API usage)
- **Sentry** (error tracking)

---

## Support

Issues? Check:
1. Render logs
2. Firebase Console → Firestore → Rules
3. OpenAI usage dashboard
4. GitHub Actions (if using CI/CD)

---

**Your VibeCode backend is now production-ready!** 🎉
