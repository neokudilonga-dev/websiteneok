import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/firebase-admin';

export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('session')?.value || '';

    if (!sessionCookie) {
      return NextResponse.json({ isAuthenticated: false }, { status: 200 });
    }

    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);

    // Enforce admin allowlist during verification so middleware rejects non-admin users
    const allowedAdmins = [
      'neokudilonga@gmail.com',
      'anaruimelo@gmail.com',
      'joaonfmelo@gmail.com',
    ];
    const email = (decodedClaims as any).email || '';
    if (!allowedAdmins.includes(email)) {
      return NextResponse.json({ isAuthenticated: false }, { status: 200 });
    }

    return NextResponse.json({ isAuthenticated: true, uid: decodedClaims.uid }, { status: 200 });
  } catch (error) {
    console.error('Error verifying session cookie:', error);
    return NextResponse.json({ isAuthenticated: false }, { status: 200 });
  }
}

