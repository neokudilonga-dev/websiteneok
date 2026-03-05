import { NextRequest, NextResponse } from 'next/server';
import { firestore, auth } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ reference: string }> }
) {
  try {
    const sessionCookie = request.cookies.get('session')?.value || '';
    if (!sessionCookie) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const decoded = await auth.verifySessionCookie(sessionCookie, true);
    const email = (decoded as any).email || '';
    const allowedAdmins = new Set([
      'neokudilonga@gmail.com',
      'anaruimelo@gmail.com',
      'joaonfmelo@gmail.com',
    ]);
    if (!allowedAdmins.has(email)) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { reference } = await params;
    if (!reference) {
      return NextResponse.json({ message: 'Order reference is required' }, { status: 400 });
    }

    const snap = await firestore
      .collection('orders')
      .doc(reference)
      .collection('edits')
      .orderBy('timestamp', 'desc')
      .limit(50)
      .get();

    const edits = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return NextResponse.json(edits, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching edits' }, { status: 500 });
  }
}
