
import { NextResponse } from 'next/server';
import { auth as adminAuth } from 'firebase-admin';
import { firestore } from '@/lib/firebase-admin';

export async function POST(request: Request) {
  console.log('[/api/auth/login] - POST request received.');
  try {
    const authorization = request.headers.get('Authorization');
    if (authorization?.startsWith('Bearer ')) {
      const idToken = authorization.split('Bearer ')[1];
      console.log('[/api/auth/login] - ID Token received.');

      console.log('[/api/auth/login] - Verifying ID token...');
      const decodedToken = await adminAuth().verifyIdToken(idToken);
      console.log('[/api/auth/login] - ID Token verified successfully for UID:', decodedToken.uid);
      
      const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
      console.log('[/api/auth/login] - Creating session cookie...');
      const sessionCookie = await adminAuth().createSessionCookie(idToken, { expiresIn });
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
    }
    
    console.log('[/api/auth/login] - Unauthorized: No Bearer token found.');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  } catch (error: any) {
    console.error('[/api/auth/login] - CRITICAL ERROR:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message, code: error.code }, { status: 500 });
  }
}
