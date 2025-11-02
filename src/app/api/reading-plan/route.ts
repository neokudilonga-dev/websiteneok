
import { NextResponse } from 'next/server';
import { firestore } from '@/lib/firebase-admin';
import type { ReadingPlanItem } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Prefer the canonical 'readingPlan' collection, but fall back to legacy 'readingPlans'
    const primary = firestore.collection('readingPlan');
    let snapshot = await primary.get();

    if (snapshot.empty) {
      const legacy = firestore.collection('readingPlans');
      const legacySnap = await legacy.get();
      if (!legacySnap.empty) {
        snapshot = legacySnap;
      }
    }

    const items: ReadingPlanItem[] = [];
    snapshot.forEach(doc => {
      items.push(doc.data() as ReadingPlanItem);
    });

    return NextResponse.json(items, { status: 200 });
  } catch (error) {
    console.error('Error fetching reading plan:', error);
    return NextResponse.json({ error: 'Failed to fetch reading plan' }, { status: 500 });
  }
}
