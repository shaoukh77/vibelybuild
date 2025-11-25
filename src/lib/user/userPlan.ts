/**
 * User Plan Management
 *
 * Firebase functions to manage user subscription plans and access control.
 */

import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export type UserPlan = 'free' | 'starter' | 'pro' | 'enterprise';

export interface UserPlanData {
  plan: UserPlan;
  planActivatedAt?: any;
  stripeCustomerId?: string;
  subscriptionStatus?: 'active' | 'canceled' | 'past_due' | 'trialing';
  buildsThisMonth?: number;
  buildLimit?: number;
  buildsToday?: number;
  dailyBuildLimit?: number;
  lastBuildDate?: string; // YYYY-MM-DD format
  createdAt?: any;
  updatedAt?: any;
}

/**
 * Get user plan from Firestore
 */
export async function getUserPlan(userId: string): Promise<UserPlanData | null> {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return null;
    }

    const data = userDoc.data();
    const plan = data.plan || 'free';

    return {
      plan,
      planActivatedAt: data.planActivatedAt,
      stripeCustomerId: data.stripeCustomerId,
      subscriptionStatus: data.subscriptionStatus,
      buildsThisMonth: data.buildsThisMonth || 0,
      buildLimit: data.buildLimit || getBuildLimitForPlan(plan),
      buildsToday: data.buildsToday || 0,
      dailyBuildLimit: data.dailyBuildLimit || getDailyBuildLimitForPlan(plan),
      lastBuildDate: data.lastBuildDate,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    };
  } catch (error) {
    console.error('Error getting user plan:', error);
    return null;
  }
}

/**
 * Set user plan in Firestore
 */
export async function setUserPlan(
  userId: string,
  plan: UserPlan,
  metadata?: Partial<UserPlanData>
): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);

    const planData: any = {
      plan,
      buildLimit: getBuildLimitForPlan(plan),
      updatedAt: serverTimestamp(),
      ...metadata
    };

    // Set planActivatedAt if not already set
    if (!metadata?.planActivatedAt) {
      planData.planActivatedAt = serverTimestamp();
    }

    await setDoc(userRef, planData, { merge: true });

    console.log(`[UserPlan] Set plan for user ${userId}: ${plan}`);
  } catch (error) {
    console.error('Error setting user plan:', error);
    throw error;
  }
}

/**
 * Check if user has access to a feature
 */
export async function hasFeatureAccess(
  userId: string,
  feature: 'build' | 'ads' | 'api' | 'teams'
): Promise<boolean> {
  try {
    const planData = await getUserPlan(userId);

    if (!planData) {
      return false;
    }

    const { plan } = planData;

    switch (feature) {
      case 'build':
        // All plans except 'free' have build access
        return plan !== 'free';

      case 'ads':
        // All plans except 'free' have ads access
        return plan !== 'free';

      case 'api':
        // Only pro and enterprise have API access
        return plan === 'pro' || plan === 'enterprise';

      case 'teams':
        // Only pro and enterprise have team access
        return plan === 'pro' || plan === 'enterprise';

      default:
        return false;
    }
  } catch (error) {
    console.error('Error checking feature access:', error);
    return false;
  }
}

/**
 * Check if user can create a new build (within limits)
 */
export async function canCreateBuild(userId: string): Promise<{
  allowed: boolean;
  reason?: string;
  buildsRemaining?: number;
  dailyBuildsRemaining?: number;
  isTrial?: boolean;
}> {
  try {
    const planData = await getUserPlan(userId);

    if (!planData) {
      return {
        allowed: false,
        reason: 'No plan found. Please subscribe to a plan.'
      };
    }

    const {
      plan,
      buildsThisMonth = 0,
      buildLimit = 0,
      buildsToday = 0,
      dailyBuildLimit = 0,
      lastBuildDate
    } = planData;

    // Check if daily count needs reset
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const needsDailyReset = lastBuildDate !== today;

    const currentBuildsToday = needsDailyReset ? 0 : buildsToday;

    // FREE plan has daily trial limits (3 builds/day)
    if (plan === 'free') {
      if (currentBuildsToday >= dailyBuildLimit) {
        return {
          allowed: false,
          reason: `Daily trial limit reached (${dailyBuildLimit} builds/day). Upgrade to Starter for 5 builds/month.`,
          buildsRemaining: 0,
          dailyBuildsRemaining: 0,
          isTrial: true
        };
      }

      return {
        allowed: true,
        buildsRemaining: -1,
        dailyBuildsRemaining: dailyBuildLimit - currentBuildsToday,
        isTrial: true
      };
    }

    // Pro and Enterprise have unlimited builds
    if (plan === 'pro' || plan === 'enterprise') {
      return {
        allowed: true,
        buildsRemaining: -1, // Unlimited
        dailyBuildsRemaining: -1,
        isTrial: false
      };
    }

    // Starter plan has monthly limit
    if (buildsThisMonth >= buildLimit) {
      return {
        allowed: false,
        reason: `Monthly build limit reached (${buildLimit} builds/month). Upgrade to Pro for unlimited builds.`,
        buildsRemaining: 0,
        dailyBuildsRemaining: -1,
        isTrial: false
      };
    }

    return {
      allowed: true,
      buildsRemaining: buildLimit - buildsThisMonth,
      dailyBuildsRemaining: -1,
      isTrial: false
    };
  } catch (error) {
    console.error('Error checking build access:', error);
    return {
      allowed: false,
      reason: 'Error checking build access. Please try again.'
    };
  }
}

/**
 * Increment user's monthly and daily build count
 */
export async function incrementBuildCount(userId: string): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      throw new Error('User not found');
    }

    const data = userDoc.data();
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const lastBuildDate = data.lastBuildDate;

    // Reset daily count if it's a new day
    const buildsToday = lastBuildDate === today ? (data.buildsToday || 0) + 1 : 1;
    const buildsThisMonth = (data.buildsThisMonth || 0) + 1;

    await setDoc(userRef, {
      buildsThisMonth,
      buildsToday,
      lastBuildDate: today,
      lastBuildAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true });

    console.log(`[UserPlan] Incremented build count for user ${userId}: ${buildsThisMonth} monthly, ${buildsToday} today`);
  } catch (error) {
    console.error('Error incrementing build count:', error);
    throw error;
  }
}

/**
 * Reset monthly build count (run this monthly via cron)
 */
export async function resetMonthlyBuildCount(userId: string): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);

    await setDoc(userRef, {
      buildsThisMonth: 0,
      updatedAt: serverTimestamp()
    }, { merge: true });

    console.log(`[UserPlan] Reset build count for user ${userId}`);
  } catch (error) {
    console.error('Error resetting build count:', error);
    throw error;
  }
}

/**
 * Get monthly build limit for a plan
 */
function getBuildLimitForPlan(plan: UserPlan): number {
  switch (plan) {
    case 'free':
      return -1; // No monthly limit for free (daily limit applies)
    case 'starter':
      return 5; // 5 builds per month during pre-beta
    case 'pro':
      return -1; // Unlimited
    case 'enterprise':
      return -1; // Unlimited
    default:
      return 0;
  }
}

/**
 * Get daily build limit for a plan
 */
function getDailyBuildLimitForPlan(plan: UserPlan): number {
  switch (plan) {
    case 'free':
      return 3; // 3 builds per day for trial users
    case 'starter':
      return -1; // No daily limit (monthly limit applies)
    case 'pro':
      return -1; // Unlimited
    case 'enterprise':
      return -1; // Unlimited
    default:
      return 0;
  }
}

/**
 * Initialize user plan (called on signup)
 */
export async function initializeUserPlan(userId: string, email: string): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    const today = new Date().toISOString().split('T')[0];

    await setDoc(userRef, {
      plan: 'free',
      email,
      buildsThisMonth: 0,
      buildLimit: -1,
      buildsToday: 0,
      dailyBuildLimit: 3,
      lastBuildDate: today,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true });

    console.log(`[UserPlan] Initialized FREE trial plan for user ${userId} with 3 builds/day`);
  } catch (error) {
    console.error('Error initializing user plan:', error);
    throw error;
  }
}
