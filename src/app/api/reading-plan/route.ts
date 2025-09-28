
import { NextResponse } from 'next/server';
import { firestore } from '@/lib/firebase-admin';
import type { ReadingPlanItem } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const readingPlanCollection = firestore.collection('readingPlan');
    const snapshot = await readingPlanCollection.get();
    
    if (snapshot.empty) {
      return NextResponse.json([], { status: 200 });
    }

    const readingPlan: ReadingPlanItem[] = [];
    snapshot.forEach(doc => {
      readingPlan.push(doc.data() as ReadingPlanItem);
    });

    return NextResponse.json(readingPlan, { status: 200 });
  } catch (error) {
    console.error('Error fetching reading plan:', error);
    return NextResponse.json({ error: 'Failed to fetch reading plan' }, { status: 500 });
  }
}
