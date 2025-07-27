
import { NextResponse } from 'next/server';
import { auth } from 'firebase-admin';
import { cookies } from 'next/headers';
import { firestore } from '@/lib/firebase-admin';

export async function GET() {
  const session = cookies().get('session')?.value || '';

  //Validate if the cookie exist in the request
  if (!session) {
    return NextResponse.json({ isLogged: false }, { status: 401 });
  }

  //Use Firebase Admin to verify the session cookie.
  try {
    const decodedClaims = await auth().verifySessionCookie(session, true);

    if (!decodedClaims) {
      return NextResponse.json({ isLogged: false }, { status: 401 });
    }

    return NextResponse.json({ isLogged: true, uid: decodedClaims.uid }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ isLogged: false }, { status: 401 });
  }
}
