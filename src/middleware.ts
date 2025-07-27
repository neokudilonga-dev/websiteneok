
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from 'firebase-admin';
import { firestore } from '@/lib/firebase-admin'; // Needed for auth to be initialized

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const sessionCookie = request.cookies.get('session')?.value

  if (pathname.startsWith('/admin')) {
    // Let the login page through
    if (pathname.startsWith('/admin/login')) {
      return NextResponse.next()
    }

    // If there's no session cookie, redirect to login
    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    // Verify the session cookie directly
    try {
      await auth().verifySessionCookie(sessionCookie, true);
      // If verification is successful, let the request proceed
      return NextResponse.next();
    } catch (error) {
      // If verification fails, redirect to login and clear the invalid cookie
      console.error('Middleware verification error:', error);
      const response = NextResponse.redirect(new URL('/admin/login', request.url));
      response.cookies.set({
        name: 'session',
        value: '',
        maxAge: -1,
      });
      return response;
    }
  }

  return NextResponse.next();
}

// This matcher ensures the middleware runs on all admin routes
// EXCEPT for the login page and static assets.
export const config = {
  matcher: [
    '/admin((?!/login|_next/static|_next/image|favicon.ico).*)',
  ],
}
