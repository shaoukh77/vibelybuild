/**
 * Next.js Middleware
 *
 * 1. Add Content Security Policy headers for iframe embedding
 * 2. Configure CORS for preview servers
 * 3. Protect routes based on subscription plan
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // PAYWALL: Protected routes that require a subscription
  const protectedRoutes = ['/build', '/ads'];
  const isProtected = protectedRoutes.some(route => pathname.startsWith(route));

  if (isProtected) {
    // Check if user is authenticated (basic check via cookie)
    const authToken = request.cookies.get('auth-token') ||
                      request.cookies.get('__session'); // Firebase session cookie

    if (!authToken) {
      // Not logged in - redirect to login with return URL
      const url = new URL('/login', request.url);
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }

    // Note: We can't check Firestore plan here directly in middleware
    // because middleware runs on Edge Runtime.
    // The page components will check the plan and show a paywall if needed.
  }

  const response = NextResponse.next();

  // For build page and preview routes, add permissive CSP headers for iframe embedding
  if (pathname.startsWith('/build') || pathname.startsWith('/preview')) {
    // Remove restrictive X-Frame-Options if present
    response.headers.delete('X-Frame-Options');

    // Set permissive Content Security Policy
    // Allow iframes from localhost (preview servers on ports 4110-4990)
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https: http:",
      "font-src 'self' data:",
      "connect-src 'self' http://localhost:* https://*",
      "frame-src 'self' http://localhost:* https://*",
      "frame-ancestors 'self' http://localhost:* https://*",
      "worker-src 'self' blob:",
    ].join('; ');

    response.headers.set('Content-Security-Policy', csp);

    // CORS headers for API routes
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }

  // For API routes, add CORS headers
  if (pathname.startsWith('/api')) {
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }

  return response;
}

// Configure which routes use this middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - login, signup, pricing, early-access (public pages)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|login|signup|pricing|early-access|checkout|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
