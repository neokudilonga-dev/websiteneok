import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { auth } from '@/lib/firebase-admin';

export async function GET() {
  const session = (await cookies()).get('session')?.value || '';

  if (!session) {
    return NextResponse.json({ isLogged: false }, { status: 401 });
  }
  
  try {
    const decodedClaims = await auth.verifySessionCookie(session, true);

    if (!decodedClaims) {
      return NextResponse.json({ isLogged: false }, { status: 401 });
    }

    return NextResponse.json({ isLogged: true, uid: decodedClaims.uid }, { status: 200 });
  } catch (error) {
    console.error('[/api/auth/verify] - Session cookie verification failed. Error:', error);
    return NextResponse.json({ isLogged: false }, { status: 401 });
  }
}

