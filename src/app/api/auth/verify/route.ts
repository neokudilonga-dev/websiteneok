import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/firebase-admin';

export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('session')?.value || '';

    if (!sessionCookie) {
      return NextResponse.json({ isAuthenticated: false }, { status: 200 });
    }

    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
    return NextResponse.json({ isAuthenticated: true, uid: decodedClaims.uid }, { status: 200 });
  } catch (error) {
    console.error('Error verifying session cookie:', error);
    return NextResponse.json({ isAuthenticated: false }, { status: 200 });
  }
}

