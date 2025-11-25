# Notifications System Setup Guide

## Overview
This project includes a complete notification system with Firebase Cloud Functions and real-time frontend updates.

## Features Implemented
- ✅ Like notifications (when someone likes your post)
- ✅ Comment notifications (when someone comments on your post)
- ✅ Follow notifications (when someone follows you)
- ✅ Real-time unread count badge
- ✅ Notification dropdown panel in TopNav
- ✅ Mark as read / Mark all as read
- ✅ Firestore security rules
- ✅ Optional daily email digest (commented out)

---

## 🚀 Initial Setup

### 1. Install Firebase CLI Globally
```bash
npm install -g firebase-tools
```

### 2. Login to Firebase
```bash
firebase login
```

### 3. Initialize Firebase Project (if not already done)
```bash
firebase init
```
Select:
- Firestore
- Functions (TypeScript)
- Storage
- Emulators

### 4. Install Functions Dependencies
```bash
cd functions
npm install
cd ..
```

---

## 🛠️ Local Development

### Option 1: Run Everything with Emulators (Recommended)

#### Start All Emulators + Next.js Dev Server
```bash
# Terminal 1: Start Firebase Emulators
firebase emulators:start

# Terminal 2: Start Next.js Dev Server
npm run dev
```

#### Emulator URLs:
- **Emulator UI**: http://localhost:4000
- **Firestore Emulator**: localhost:8080
- **Auth Emulator**: localhost:9099
- **Functions Emulator**: localhost:5001
- **Storage Emulator**: localhost:9199
- **Next.js App**: http://localhost:3000

### Option 2: Functions Only
```bash
# Build and serve functions emulator only
cd functions
npm run serve
```

### Option 3: Watch Mode (Auto-rebuild on changes)
```bash
# Terminal 1: Watch TypeScript compilation
cd functions
npm run build:watch

# Terminal 2: Start emulators
firebase emulators:start

# Terminal 3: Start Next.js
cd ..
npm run dev
```

---

## 📝 Connect Your App to Emulators

Update `src/lib/firebase.js` to use emulators in development:

```javascript
import { connectAuthEmulator } from "firebase/auth";
import { connectFirestoreEmulator } from "firebase/firestore";
import { connectStorageEmulator } from "firebase/storage";
import { connectFunctionsEmulator } from "firebase/functions";

// After initializing Firebase
if (process.env.NODE_ENV === 'development') {
  connectAuthEmulator(auth, "http://localhost:9099");
  connectFirestoreEmulator(db, "localhost", 8080);
  connectStorageEmulator(storage, "localhost", 9199);
  connectFunctionsEmulator(functions, "localhost", 5001);
}
```

---

## 🧪 Testing Notifications Locally

1. **Start Emulators**: `firebase emulators:start`
2. **Start Next.js**: `npm run dev`
3. **Open App**: http://localhost:3000/feed
4. **Sign in** with test account
5. **Test triggers**:
   - Like a post → Check bell icon for notification
   - Comment on a post → Check notification
   - Follow a user → Check notification
6. **Check Emulator UI**: http://localhost:4000
   - View Firestore data under `notifications/{userId}/items`
   - View Function logs in Functions tab

---

## 📦 Deployment

### Deploy Everything
```bash
firebase deploy
```

### Deploy Functions Only
```bash
firebase deploy --only functions
```

### Deploy Firestore Rules Only
```bash
firebase deploy --only firestore:rules
```

### Deploy Storage Rules Only
```bash
firebase deploy --only storage:rules
```

### Deploy Specific Function
```bash
firebase deploy --only functions:onLikeCreated
firebase deploy --only functions:onCommentCreated
firebase deploy --only functions:onFollowCreated
```

---

## 🔍 View Logs

### Local (Emulator)
View in Emulator UI: http://localhost:4000 → Functions tab

### Production Logs
```bash
# View all function logs
firebase functions:log

# Tail logs in real-time
firebase functions:log --only onLikeCreated

# View logs for specific function
firebase functions:log --only onCommentCreated --limit 50
```

---

## 🗄️ Data Model

### Notifications Collection Structure
```
notifications/
  {userId}/
    items/
      {notificationId}:
        {
          type: "like" | "comment" | "follow",
          actorId: string,
          postId: string | null,
          commentId: string | null,
          text: string,
          read: boolean,
          createdAt: timestamp,
          readAt: timestamp? (added when marked as read)
        }
```

### Example Notification Documents

#### Like Notification
```json
{
  "type": "like",
  "actorId": "user123",
  "postId": "post456",
  "commentId": null,
  "text": "John Doe liked your post",
  "read": false,
  "createdAt": "2025-11-13T10:30:00Z"
}
```

#### Comment Notification
```json
{
  "type": "comment",
  "actorId": "user789",
  "postId": "post456",
  "commentId": "comment101",
  "text": "Jane Smith commented on your post",
  "read": false,
  "createdAt": "2025-11-13T11:00:00Z"
}
```

#### Follow Notification
```json
{
  "type": "follow",
  "actorId": "user999",
  "postId": null,
  "commentId": null,
  "text": "Alice Johnson started following you",
  "read": false,
  "createdAt": "2025-11-13T12:00:00Z"
}
```

---

## 🔐 Security Rules (Already Configured)

### Firestore Rules
```javascript
match /notifications/{userId} {
  allow read: if request.auth.uid == userId;

  match /items/{notificationId} {
    allow read, update: if request.auth.uid == userId;
    allow create: if false; // Only Cloud Functions can create
    allow delete: if request.auth.uid == userId;
  }
}
```

---

## 📧 Optional: Enable Daily Email Digest

To enable the daily email digest feature:

1. **Uncomment the function** in `functions/src/index.ts`:
   ```typescript
   export const dailyEmailDigest = functions.pubsub...
   ```

2. **Install email service** (e.g., SendGrid, Mailgun):
   ```bash
   cd functions
   npm install @sendgrid/mail
   ```

3. **Configure email service** in the function

4. **Deploy**:
   ```bash
   firebase deploy --only functions:dailyEmailDigest
   ```

5. **Test locally**:
   ```bash
   firebase functions:shell
   ```
   Then run:
   ```javascript
   dailyEmailDigest()
   ```

---

## 🐛 Troubleshooting

### Functions not triggering in production
1. Check Firebase Console → Functions tab for errors
2. View logs: `firebase functions:log`
3. Verify Firestore Rules allow reads for Cloud Functions (use admin SDK)

### Notifications not appearing in UI
1. Check browser console for errors
2. Verify user is signed in
3. Check Firestore Console → `notifications/{userId}/items`
4. Verify real-time listeners are connected

### Emulators not starting
1. Check if ports are already in use
2. Kill existing processes:
   ```bash
   lsof -ti:4000,5001,8080,9099,9199 | xargs kill -9
   ```
3. Clear emulator data:
   ```bash
   rm -rf .firebase/
   ```

### TypeScript compilation errors
```bash
cd functions
npm run build
```
Fix any errors shown, then redeploy.

---

## 📊 Monitoring in Production

1. **Firebase Console**: https://console.firebase.google.com
2. **Functions Dashboard**: Monitor invocations, errors, execution time
3. **Firestore Usage**: Check read/write counts
4. **Set up Alerts**: Configure email alerts for function failures

---

## 🔄 Update Functions

1. Edit `functions/src/index.ts`
2. Build: `cd functions && npm run build`
3. Deploy: `firebase deploy --only functions`
4. Monitor: `firebase functions:log`

---

## ✅ Testing Checklist

- [ ] Start emulators successfully
- [ ] Create a post
- [ ] Like the post from another account → Check notification bell
- [ ] Comment on the post → Check notification
- [ ] Follow a user → Check notification
- [ ] Click notification → Navigates to correct page
- [ ] Mark notification as read → Badge count decreases
- [ ] Mark all as read → All notifications marked
- [ ] Check Emulator UI → View data in Firestore
- [ ] Check Function logs → See console logs
- [ ] Deploy to production → Verify in Firebase Console
- [ ] Test in production environment

---

## 📚 Additional Resources

- [Firebase Functions Documentation](https://firebase.google.com/docs/functions)
- [Firebase Emulator Suite](https://firebase.google.com/docs/emulator-suite)
- [Firestore Triggers](https://firebase.google.com/docs/functions/firestore-events)
- [Cloud Scheduler (for cron jobs)](https://firebase.google.com/docs/functions/schedule-functions)

---

## 💡 Tips

1. **Use Emulators for Development**: Avoid charges and test safely
2. **Monitor Usage**: Set up billing alerts in Firebase Console
3. **Optimize Functions**: Keep them lightweight, use caching
4. **Index Firestore Queries**: Add composite indexes as needed
5. **Version Control**: Commit `functions/` folder to git
6. **Environment Variables**: Use Firebase Functions config for secrets

---

## 🎉 You're All Set!

The notification system is now fully configured and ready to use. Start the emulators and test the complete flow locally before deploying to production.

For questions or issues, check the Firebase Console logs or the browser console for detailed error messages.
