/**
 * Auth Me API - Get Current User Info
 * GET /api/auth/me
 *
 * Returns authenticated user information
 */

import { NextResponse } from 'next/server';
import { verifyUser } from '@/lib/verifyUser';
import { cleanError } from '@/utils/cleanError';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const user = await verifyUser(request);

    return NextResponse.json({
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        name: user.name,
        picture: user.picture
      }
    });

  } catch (error) {
    if (error.code === 'AUTH_MISSING' || error.code === 'AUTH_INVALID') {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: 401 }
      );
    }

    const cleanedError = cleanError(error);
    return NextResponse.json(
      { error: cleanedError.message },
      { status: 500 }
    );
  }
}
