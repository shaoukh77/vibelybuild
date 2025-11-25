# 🎨 AI Ads Generator - Documentation

Complete guide for the AI Ads Generator feature in VibeBuild.

---

## 📋 Overview

The AI Ads Generator creates professional marketing graphics using OpenAI's DALL·E 3. It generates **2 unique ad variations** per request and saves them locally for download.

---

## 🏗️ Architecture

### Files Created:
```
src/
├── app/
│   └── api/
│       └── ads/
│           └── generate/
│               └── route.ts          ← API endpoint
└── lib/
    └── ads/
        ├── imageGenerator.ts         ← DALL·E 3 integration
        └── imageSaver.ts             ← File management

public/
└── generated_ads/                    ← Generated images storage
    └── <sessionId>/
        ├── ad1.png
        └── ad2.png
```

---

## 🔌 API Endpoint

### POST `/api/ads/generate`

Generates 2 professional ad graphics.

**Authentication:** Required (Firebase JWT)

**Request Body:**
```json
{
  "title": "Product Name",
  "description": "Detailed product description",
  "audience": "Target audience description",
  "platform": "Facebook | Instagram | LinkedIn | Twitter | TikTok | Google"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "images": [
    {
      "url": "/generated_ads/abc123xyz/ad1.png",
      "filename": "ad1.png"
    },
    {
      "url": "/generated_ads/abc123xyz/ad2.png",
      "filename": "ad2.png"
    }
  ],
  "sessionId": "abc123xyz",
  "generatedAt": "2025-11-19T19:00:00.000Z",
  "duration": "12500ms"
}
```

**Error Responses:**

| Status | Code | Description |
|--------|------|-------------|
| 401 | AUTH_REQUIRED | Missing or invalid authentication |
| 400 | VALIDATION_ERROR | Missing required fields |
| 400 | INVALID_JSON | Malformed JSON in request |
| 400 | CONTENT_POLICY | Content violates OpenAI policies |
| 429 | RATE_LIMIT | OpenAI rate limit exceeded |
| 500 | API_KEY_MISSING | OpenAI API key not configured |
| 500 | QUOTA_EXCEEDED | OpenAI quota exceeded |
| 503 | NETWORK_ERROR | Network/timeout error |

---

## 🧪 Testing

### Method 1: Using cURL

**Valid Request:**
```bash
curl -X POST http://localhost:3000/api/ads/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -d '{
    "title": "Fitness Pro",
    "description": "AI-powered fitness app with meal tracking",
    "audience": "busy professionals aged 25-40",
    "platform": "Facebook"
  }'
```

**Test Script:**
```bash
./test-ads-api.sh
```

### Method 2: Using Postman

1. **Method:** POST
2. **URL:** `http://localhost:3000/api/ads/generate`
3. **Headers:**
   - `Content-Type: application/json`
   - `Authorization: Bearer <your-firebase-token>`
4. **Body (raw JSON):**
   ```json
   {
     "title": "Fitness Pro Launch",
     "description": "AI-powered fitness app with meal tracking and personalized workout plans",
     "audience": "busy professionals aged 25-40",
     "platform": "Facebook"
   }
   ```

### Method 3: Using JavaScript/Fetch

```javascript
const response = await fetch('/api/ads/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${firebaseToken}`
  },
  body: JSON.stringify({
    title: 'Fitness Pro',
    description: 'AI-powered fitness app with meal tracking',
    audience: 'busy professionals aged 25-40',
    platform: 'Facebook'
  })
});

const data = await response.json();
console.log(data.images); // Array of generated images
```

---

## 🎨 Image Specifications

- **Format:** PNG
- **Size:** 1024×1024 pixels (square)
- **Quality:** Standard (DALL·E 3)
- **Variations:** 2 unique designs per request
  - Variation 1: Vibrant, eye-catching style
  - Variation 2: Minimalist, modern style
- **Naming:** `ad1.png`, `ad2.png`

---

## 💰 Pricing & Limits

- **Cost:** $0.040 per image (DALL·E 3 standard quality)
- **Per Request:** 2 images = **$0.08**
- **Rate Limits:**
  - OpenAI API: 5 requests/minute (default)
  - Sequential generation to avoid rate limits
- **Timeout:** 60 seconds max

---

## 🔐 Environment Variables

Required in `.env.local`:

```bash
# OpenAI API Key for DALL·E 3
OPENAI_API_KEY=sk-your-openai-api-key-here
```

---

## 🎯 Platform-Specific Features

The generator optimizes prompts based on the selected platform:

| Platform | Tone | Style Focus |
|----------|------|-------------|
| Facebook | Friendly, engaging, social-first | Broad appeal, shareability |
| Instagram | Aesthetic, visual storytelling | Instagram-worthy, trendy |
| LinkedIn | Professional, business-focused | Corporate, B2B branding |
| Twitter | Bold, attention-grabbing | Concise, impactful |
| TikTok | Fun, dynamic, energetic | Gen Z appeal, viral potential |
| Google | Clean, conversion-focused | Search-optimized, direct |

---

## 🛡️ Error Handling

All errors are handled gracefully with user-friendly messages:

```typescript
// Example error response
{
  "success": false,
  "error": "Rate limit exceeded. Please try again in a few minutes.",
  "code": "RATE_LIMIT"
}
```

**Error Codes:**
- `AUTH_REQUIRED` - User must authenticate
- `VALIDATION_ERROR` - Check input fields
- `RATE_LIMIT` - Wait before retrying
- `CONTENT_POLICY` - Adjust prompt content
- `API_KEY_ERROR` - Contact support
- `NETWORK_ERROR` - Retry request

---

## 🧹 Maintenance

### Cleanup Old Files

Generated ads are stored permanently by default. To clean up old files:

```typescript
import { cleanupOldAds } from '@/lib/ads/imageSaver';

// Delete ads older than 7 days
const deletedCount = await cleanupOldAds(7);
console.log(`Deleted ${deletedCount} old ad directories`);
```

**Recommended:** Set up a daily cron job to run cleanup.

---

## 📊 Monitoring

### Logs to Watch

**Success:**
```
[Ads API] Received ad generation request
[Ads API] User authenticated: XrrTXdzBJG...
[Ads API] Validation passed
[Image Generator] Starting generation of 2 ad images...
[Image Generator] Ad 1 generated successfully
[Image Generator] Ad 2 generated successfully
[Ads API] Generation complete in 12500ms
```

**Failure:**
```
[Ads API] Authentication failed: Invalid token
[Image Generator] Failed to generate ad 1: Rate limit exceeded
```

---

## 🚀 Production Checklist

- [ ] OpenAI API key configured in production environment
- [ ] `/public/generated_ads/` directory exists with write permissions
- [ ] Rate limiting implemented for high-traffic scenarios
- [ ] Daily cleanup job scheduled
- [ ] Monitoring/logging configured
- [ ] Error alerts set up for quota/rate limit issues
- [ ] Consider migrating to S3/R2 for scalable storage
- [ ] Add usage analytics tracking

---

## 🔄 Future Enhancements

### Potential Improvements:
1. **Cloud Storage:** Move from local disk to S3/CloudFlare R2
2. **Queue System:** Add job queue (Bull/BullMQ) for high traffic
3. **Customization:** Allow custom image dimensions
4. **Templates:** Pre-built ad templates for faster generation
5. **A/B Testing:** Track performance metrics per ad variation
6. **Batch Generation:** Generate multiple campaigns at once
7. **Brand Assets:** Upload logo/brand colors for consistency

---

## 📞 Support

**Common Issues:**

1. **"API key not configured"**
   - Add `OPENAI_API_KEY` to `.env.local`
   - Restart dev server

2. **"Rate limit exceeded"**
   - Wait 60 seconds
   - Reduce concurrent requests
   - Consider upgrading OpenAI plan

3. **"Content policy violation"**
   - Review product description
   - Avoid prohibited content
   - Rephrase prompts

4. **Images not saving**
   - Check `/public/generated_ads/` exists
   - Verify write permissions
   - Check disk space

---

## ✅ Verification

To verify the installation:

1. ✅ Files created in correct locations
2. ✅ `OPENAI_API_KEY` in `.env.local`
3. ✅ `/public/generated_ads/` directory exists
4. ✅ Dev server running without errors
5. ✅ Test request returns 200 status
6. ✅ Images accessible at returned URLs

---

**Created:** 2025-11-19
**Version:** 1.0.0
**Status:** Production Ready ✅
