/**
 * User Plan API
 * GET /api/user/plan
 *
 * Returns the current user's subscription plan and metadata.
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyUser } from '@/lib/verifyUser';
import { getUserPlan } from '@/lib/user/userPlan';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authUser = await verifyUser(request);

    // Get user plan
    const planData = await getUserPlan(authUser.uid);

    if (!planData) {
      return NextResponse.json({
        plan: 'free',
        buildsThisMonth: 0,
        buildLimit: 0,
        subscriptionStatus: null
      });
    }

    return NextResponse.json({
      plan: planData.plan,
      planActivatedAt: planData.planActivatedAt,
      buildsThisMonth: planData.buildsThisMonth || 0,
      buildLimit: planData.buildLimit || 0,
      subscriptionStatus: planData.subscriptionStatus,
      stripeCustomerId: planData.stripeCustomerId
    });

  } catch (error: any) {
    console.error('[User Plan API] Error:', error);
    return NextResponse.json(
      {
        error: error.message || 'Failed to get user plan',
        code: 'USER_PLAN_ERROR',
      },
      { status: 500 }
    );
  }
}
