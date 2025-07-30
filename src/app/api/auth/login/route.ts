
import { NextResponse } from 'next/server';
import { auth } from '@/lib/firebase-admin';

export async function POST(request: Request) {
  console.log('[/api/auth/login] - POST request received.');
  try {
    const authorization = request.headers.get('Authorization');
    if (!authorization?.startsWith('Bearer ')) {
      console.log('[/api/auth/login] - Unauthorized: No Bearer token found.');
      return NextResponse.json({ error: 'Unauthorized: Missing Bearer token.' }, { status: 401 });
    }

    const idToken = authorization.split('Bearer ')[1];
    
    console.log('[/api/auth/login] - Verifying ID token...');
    const decodedToken = await auth.verifyIdToken(idToken);
    console.log('[/api/auth/login] - ID Token verified successfully for UID:', decodedToken.uid);
    
    // Session cookie will be valid for 5 days.
    const expiresIn = 60 * 60 * 24 * 5 * 1000;
    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });

    const options = {
      name: 'session',
      value: sessionCookie,
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    };

    const response = NextResponse.json({ status: 'success' }, { status: 200 });
    response.cookies.set(options);

    console.log('[/api/auth/login] - Sending success response with session cookie.');
    return response;

  } catch (error: any) {
    console.error('[/api/auth/login] - CRITICAL ERROR:', {
        message: error?.message,
        code: error?.code,
        name: error?.name,
        stack: error?.stack,
        raw: error,
    });
    return NextResponse.json({ 
      error: 'Internal Server Error during authentication.', 
      debug: {
        message: error?.message,
        code: error?.code,
        name: error?.name,
      }
    }, { status: 500 });
  }
}
