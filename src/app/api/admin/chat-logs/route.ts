
import { firestore } from '@/lib/firebase-admin';
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/require-admin';

export const dynamic = "force-static";

export async function GET() {
  try {
    // Check if the user is an admin
    await requireAdmin();

    if (!firestore) {
      return NextResponse.json({ message: 'Firestore not initialized' }, { status: 500 });
    }

    const snapshot = await firestore
      .collection('chatLogs')
      .orderBy('timestamp', 'desc')
      .limit(100)
      .get();

    const logs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json(logs, { status: 200 });
  } catch (error) {
    console.error('[API Chat Logs] Error fetching logs:', error);
    return NextResponse.json({ message: 'Error fetching logs' }, { status: 500 });
  }
}
