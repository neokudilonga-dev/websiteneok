
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    let idToken: string | undefined;

    // Safely attempt to read JSON body
    try {
      const body = await request.json();
      idToken = body?.idToken;
    } catch {
      // Ignore parse errors for empty body
    }

    // Fallback to Authorization header
    if (!idToken) {
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        idToken = authHeader.substring(7);
      }
    }

    if (!idToken) {
      return NextResponse.json({ message: 'ID token is required' }, { status: 400 });
    }

    console.log('[/api/auth/login] - Verifying ID token...');
    const decodedToken = await auth.verifyIdToken(idToken);
    console.log('[/api/auth/login] - ID Token verified successfully for UID:', decodedToken.uid);

    // Session cookie will be valid for 5 days.
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days in milliseconds for Firebase Admin
    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });

    const response = NextResponse.json({ message: 'Logged in successfully' }, { status: 200 });
    // Ensure proxies/CDN do not cache this and that Set-Cookie is honored
    response.headers.set('Cache-Control', 'no-store');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    response.cookies.set('session', sessionCookie, {
      // maxAge for cookies is in SECONDS
      maxAge: Math.floor(expiresIn / 1000),
      httpOnly: true,
      secure: request.nextUrl.protocol === 'https:',
      sameSite: 'lax',
      path: '/',
      // host-only cookie (no Domain attribute) for App Hosting compatibility
    });

    return response;
  } catch (error) {
    console.error('[/api/auth/login] - Error logging in:', error);
    return NextResponse.json({ message: 'Failed to log in' }, { status: 500 });
  }
}
