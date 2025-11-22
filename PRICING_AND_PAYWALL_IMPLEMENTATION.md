# Pricing & Paywall Implementation Guide

## Overview

Complete pricing page and paywall system for VibeBuild with:
- 3 pricing tiers (Starter FREE, Pro/Enterprise coming soon)
- Fake Stripe checkout simulation
- Firebase-based plan tracking
- Middleware route protection
- Beta UI elements (badge, banner)
- Early access waitlist
- Client-side paywall component

## Architecture

### 1. Pricing System

**Tiers:**
- **Starter** - $0/mo (normally $10, FREE during Pre-Beta)
  - 5 app builds per month
  - Next.js web apps only
  - Live preview with hot-reload
  - Code export & download
  - Community support

- **Pro** - $29/mo (Coming Soon)
  - Unlimited builds
  - iOS & Android apps
  - API access
  - Team collaboration (3 users)
  - Priority support

- **Enterprise** - $99/mo (Coming Soon)
  - Everything in Pro
  - Unlimited team members
  - Custom AI training
  - SLA guarantees
  - Dedicated account manager

### 2. Firebase Structure

**Users Collection (`users/{uid}`):**
```typescript
{
  plan: 'free' | 'starter' | 'pro' | 'enterprise',
  planActivatedAt: Timestamp,
  stripeCustomerId: string,
  subscriptionStatus: 'active' | 'canceled' | 'past_due' | 'trialing',
  buildsThisMonth: number,
  buildLimit: number,
  email: string,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

**Waitlist Collection (`waitlist/{id}`):**
```typescript
{
  email: string,
  name: string | null,
  interests: string[],
  source: 'early-access-page',
  createdAt: Timestamp,
  status: 'pending' | 'approved' | 'invited'
}
```

### 3. Route Protection

**Middleware (`src/middleware.ts`):**
- Checks authentication for `/build` and `/ads`
- Redirects to `/login` if not authenticated
- Client-side plan check happens in page components

**Protected Routes:**
- `/build` - Requires Starter plan or higher
- `/ads` - Requires Starter plan or higher

**Public Routes:**
- `/` - Landing page
- `/pricing` - Pricing page
- `/early-access` - Waitlist signup
- `/checkout` - Fake Stripe checkout
- `/login`, `/signup` - Authentication

## File Structure

```
vibelybuild/
├── src/
│   ├── app/
│   │   ├── pricing/
│   │   │   └── page.tsx              # Pricing page with 3 tiers
│   │   ├── checkout/
│   │   │   └── page.tsx              # Fake Stripe checkout
│   │   ├── early-access/
│   │   │   └── page.tsx              # Waitlist signup
│   │   └── api/
│   │       └── user/
│   │           └── plan/
│   │               └── route.ts      # GET user plan API
│   ├── components/
│   │   ├── BetaBadge.tsx             # "PRE-BETA" badge
│   │   ├── BetaBanner.tsx            # Yellow warning banner
│   │   └── Paywall.tsx               # Client-side access control
│   ├── lib/
│   │   └── user/
│   │       └── userPlan.ts           # Firebase plan management
│   └── middleware.ts                 # Route protection
└── PRICING_AND_PAYWALL_IMPLEMENTATION.md
```

## Usage

### 1. Check User Plan (Client-Side)

```typescript
'use client';

import { getUserPlan } from '@/lib/user/userPlan';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';

export function MyComponent() {
  const { user } = useAuth();
  const [planData, setPlanData] = useState(null);

  useEffect(() => {
    if (user) {
      getUserPlan(user.uid).then(setPlanData);
    }
  }, [user]);

  return (
    <div>
      <p>Current plan: {planData?.plan}</p>
      <p>Builds this month: {planData?.buildsThisMonth}/{planData?.buildLimit}</p>
    </div>
  );
}
```

### 2. Protect a Page with Paywall

```typescript
'use client';

import { Paywall } from '@/components/Paywall';

export default function BuildPage() {
  return (
    <Paywall requiredFeature="build">
      {/* Your protected content */}
      <div>
        <h1>Build Your App</h1>
        {/* ... */}
      </div>
    </Paywall>
  );
}
```

### 3. Check Build Limits Before Creating

```typescript
import { canCreateBuild, incrementBuildCount } from '@/lib/user/userPlan';

async function handleCreateBuild(userId: string) {
  // Check if user can create a build
  const { allowed, reason, buildsRemaining } = await canCreateBuild(userId);

  if (!allowed) {
    // Show error to user
    alert(reason);
    return;
  }

  // Create the build
  const buildId = await createBuild(/* ... */);

  // Increment build count
  await incrementBuildCount(userId);

  console.log(`Builds remaining: ${buildsRemaining}`);
}
```

### 4. Set User Plan (After Checkout)

```typescript
import { setUserPlan } from '@/lib/user/userPlan';

async function handleCheckoutSuccess(userId: string) {
  await setUserPlan(userId, 'starter', {
    stripeCustomerId: 'fake_cus_123',
    subscriptionStatus: 'active'
  });

  console.log('User upgraded to Starter plan');
}
```

### 5. Add Beta Banner to Layout

```typescript
import { BetaBanner } from '@/components/BetaBanner';
import { BetaBadge } from '@/components/BetaBadge';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {/* Beta Banner */}
        <BetaBanner />

        {/* Navbar */}
        <nav>
          <div>VibeBuild</div>
          <BetaBadge />
        </nav>

        {/* Page Content */}
        {children}
      </body>
    </html>
  );
}
```

## API Routes

### GET /api/user/plan

Get current user's plan and metadata.

**Response:**
```json
{
  "plan": "starter",
  "planActivatedAt": "2025-01-22T10:00:00Z",
  "buildsThisMonth": 2,
  "buildLimit": 5,
  "subscriptionStatus": "active",
  "stripeCustomerId": "fake_cus_abc123"
}
```

## Fake Checkout Flow

The checkout page simulates a Stripe payment flow:

1. User selects Starter plan on `/pricing`
2. Redirects to `/checkout?plan=starter`
3. Shows fake payment form (no real card processing)
4. Simulates 2-second processing delay
5. Updates Firebase user document with plan
6. Redirects to `/build` on success

**Success Actions:**
```typescript
// In checkout page
await setDoc(doc(db, 'users', userId), {
  plan: 'starter',
  planActivatedAt: serverTimestamp(),
  stripeCustomerId: `fake_cus_${userId.slice(0, 10)}`,
  subscriptionStatus: 'active',
  updatedAt: serverTimestamp()
}, { merge: true });
```

## Beta UI Elements

### 1. Beta Badge

Small "PRE-BETA" badge for navbar:

```tsx
import { BetaBadge } from '@/components/BetaBadge';

<BetaBadge className="ml-2" />
```

### 2. Beta Banner

Yellow banner at top of page:

```tsx
import { BetaBanner } from '@/components/BetaBanner';

<BetaBanner />
```

Features:
- Dismissible (click X)
- Shows warning message
- Link to join waitlist
- Responsive design

## Early Access Waitlist

### Features

- Email collection (required)
- Name field (optional)
- Interest selection (6 categories)
- Duplicate email prevention
- Success confirmation screen
- Firebase storage

### Form Fields

```typescript
{
  email: string,           // Required
  name: string,            // Optional
  interests: string[],     // Optional, multi-select
  source: 'early-access-page',
  createdAt: Timestamp,
  status: 'pending'
}
```

### Interest Categories

1. Web Apps
2. Mobile Apps
3. API Integration
4. AI Features
5. Team Collaboration
6. Enterprise Features

## Firestore Security Rules

Add these rules to protect user data:

```javascript
// Firestore Security Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users can only read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Anyone can write to waitlist (for signups)
    match /waitlist/{docId} {
      allow create: if request.auth != null;
      allow read, update, delete: if false; // Admin only via Firebase Console
    }
  }
}
```

## Testing

### 1. Test Pricing Page

```bash
# Visit pricing page
open http://localhost:3000/pricing

# Click "Start Building Free" on Starter plan
# Should redirect to /checkout?plan=starter
```

### 2. Test Fake Checkout

```bash
# Complete checkout
# Should show 2-second processing animation
# Should update Firestore with plan: "starter"
# Should redirect to /build
```

### 3. Test Paywall

```bash
# Without subscription
# Visit /build
# Should show paywall blocking access

# With Starter subscription
# Visit /build
# Should show builder page
```

### 4. Test Build Limits

```typescript
// In browser console
import { canCreateBuild } from '@/lib/user/userPlan';

const userId = 'your-user-id';
const result = await canCreateBuild(userId);
console.log(result);
// Output: { allowed: true, buildsRemaining: 5 }

// After creating 5 builds
const result2 = await canCreateBuild(userId);
console.log(result2);
// Output: { allowed: false, reason: 'Monthly build limit reached...', buildsRemaining: 0 }
```

### 5. Test Waitlist

```bash
# Visit early access page
open http://localhost:3000/early-access

# Fill out form and submit
# Check Firestore console for new document in waitlist collection
```

## Configuration

### Build Limits

Modify in `src/lib/user/userPlan.ts`:

```typescript
function getBuildLimitForPlan(plan: UserPlan): number {
  switch (plan) {
    case 'free':
      return 0;
    case 'starter':
      return 5; // Change this number
    case 'pro':
      return -1; // -1 = unlimited
    case 'enterprise':
      return -1;
    default:
      return 0;
  }
}
```

### Plan Features

Modify feature access in `hasFeatureAccess()`:

```typescript
export async function hasFeatureAccess(
  userId: string,
  feature: 'build' | 'ads' | 'api' | 'teams'
): Promise<boolean> {
  const { plan } = await getUserPlan(userId);

  switch (feature) {
    case 'build':
      return plan !== 'free'; // Starter and above
    case 'ads':
      return plan !== 'free'; // Starter and above
    case 'api':
      return plan === 'pro' || plan === 'enterprise'; // Pro and above
    case 'teams':
      return plan === 'pro' || plan === 'enterprise'; // Pro and above
  }
}
```

## Best Practices

1. **Always check plan before creating builds:**
   ```typescript
   const { allowed } = await canCreateBuild(userId);
   if (!allowed) return;
   ```

2. **Increment build count after successful creation:**
   ```typescript
   await incrementBuildCount(userId);
   ```

3. **Use Paywall component for protected pages:**
   ```typescript
   <Paywall requiredFeature="build">
     <YourProtectedContent />
   </Paywall>
   ```

4. **Show build limits in UI:**
   ```typescript
   const { buildsRemaining } = await canCreateBuild(userId);
   return <p>Builds remaining: {buildsRemaining}</p>;
   ```

5. **Handle plan upgrades gracefully:**
   ```typescript
   if (!allowed) {
     router.push('/pricing');
   }
   ```

## Monthly Build Reset

To reset monthly build counts, create a Cloud Function or cron job:

```typescript
// Cloud Function (runs monthly)
export const resetMonthlyBuilds = functions.pubsub
  .schedule('0 0 1 * *') // First day of month at midnight
  .onRun(async () => {
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);

    const batch = writeBatch(db);
    snapshot.docs.forEach(doc => {
      batch.update(doc.ref, {
        buildsThisMonth: 0,
        updatedAt: serverTimestamp()
      });
    });

    await batch.commit();
    console.log('Monthly builds reset complete');
  });
```

## Future Enhancements

- [ ] Real Stripe integration
- [ ] Subscription management page
- [ ] Invoice history
- [ ] Plan upgrade/downgrade flow
- [ ] Proration handling
- [ ] Webhook handlers for Stripe events
- [ ] Email notifications for limits
- [ ] Usage analytics dashboard
- [ ] Team member invitations

---

**Last Updated:** 2025-01-22
**Version:** 1.0.0
**Status:** Pre-Beta
