import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/firebase-admin';

export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('session')?.value || '';

    if (!sessionCookie) {
      return NextResponse.json({ isAuthenticated: false }, { status: 200 });
    }

    if (!auth) {
      return NextResponse.json({ isAuthenticated: false }, { status: 500 });
    }

    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);

    // Enforce admin allowlist and compute role
    const ownerEmail = 'neokudilonga@gmail.com';
    const allowedAdmins = new Set([
      ownerEmail,
      'anaruimelo@gmail.com',
      'joaonfmelo@gmail.com',
    ]);
    const email: string = (decodedClaims as any).email || '';
    if (!allowedAdmins.has(email)) {
      return NextResponse.json({ isAuthenticated: false }, { status: 200 });
    }
    const role = email === ownerEmail ? 'owner' : 'editor';

    return NextResponse.json({ isAuthenticated: true, uid: decodedClaims.uid, role, email }, { status: 200 });
  } catch (error) {
    console.error('Error verifying session cookie:', error);
    return NextResponse.json({ isAuthenticated: false }, { status: 200 });
  }
}

