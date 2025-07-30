
import { NextResponse } from 'next/server';
import admin from 'firebase-admin';

// Service account credentials from environment variables
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

function initializeFirebaseAdmin() {
  if (!admin.apps.length) {
    console.log('[api/auth/login] Initializing Firebase Admin SDK...');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('[api/auth/login] Firebase Admin SDK initialized successfully.');
  } else {
    console.log('[api/auth/login] Firebase Admin SDK already initialized.');
  }
  return admin;
}

export async function POST(request: Request) {
  console.log('[/api/auth/login] - POST request received.');
  try {
    const adminApp = initializeFirebaseAdmin();
    const auth = adminApp.auth();

    const authorization = request.headers.get('Authorization');
    if (!authorization?.startsWith('Bearer ')) {
      console.log('[/api/auth/login] - Unauthorized: No Bearer token found.');
      return NextResponse.json({ error: 'Unauthorized: Missing Bearer token.' }, { status: 401 });
    }

    const idToken = authorization.split('Bearer ')[1];
    console.log('[/api/auth/login] - ID Token received.');

    console.log('[/api/auth/login] - Verifying ID token...');
    const decodedToken = await auth.verifyIdToken(idToken);
    console.log('[/api/auth/login] - ID Token verified successfully for UID:', decodedToken.uid);
    
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
    console.log('[/api/auth/login] - Creating session cookie...');
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
