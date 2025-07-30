
import { NextResponse } from 'next/server';
import { auth } from '@/lib/firebase-admin'; // Corrected import
import { firestore } from '@/lib/firebase-admin';

export async function POST(request: Request) {
  console.log('[/api/auth/login] - POST request received.');
  try {
    const authorization = request.headers.get('Authorization');
    if (!authorization?.startsWith('Bearer ')) {
      console.log('[/api/auth/login] - Unauthorized: No Bearer token found.');
      return NextResponse.json({ error: 'Unauthorized: Missing Bearer token.' }, { status: 401 });
    }

    const idToken = authorization.split('Bearer ')[1];
    console.log('[/api/auth/login] - ID Token received.');

    console.log('[/api/auth/login] - Verifying ID token...');
    // Corrected usage of the imported auth instance
    const decodedToken = await auth.verifyIdToken(idToken);
    console.log('[/api/auth/login] - ID Token verified successfully for UID:', decodedToken.uid);
    
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
    console.log('[/api/auth/login] - Creating session cookie...');
     // Corrected usage of the imported auth instance
    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });
    console.log('[/api/auth/login] - Session cookie created successfully.');

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
    console.error('[/api/auth/login] - CRITICAL ERROR:', error);
    // Return a detailed error response to the client
    return NextResponse.json({ 
      error: 'Internal Server Error during authentication.', 
      details: error.message, 
      code: error.code 
    }, { status: 500 });
  }
}
