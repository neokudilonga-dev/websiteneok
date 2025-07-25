import { NextResponse } from 'next/server';
import { firestore } from '@/lib/firebase-admin';
import type { School } from '@/lib/types';

export async function GET() {
  try {
    const schoolsCollection = firestore.collection('schools');
    const snapshot = await schoolsCollection.get();
    
    if (snapshot.empty) {
      return NextResponse.json([], { status: 200 });
    }

    const schools: School[] = [];
    snapshot.forEach(doc => {
      schools.push({ id: doc.id, ...doc.data() } as School);
    });

    return NextResponse.json(schools, { status: 200 });
  } catch (error) {
    console.error('Error fetching schools:', error);
    return NextResponse.json({ error: 'Failed to fetch schools' }, { status: 500 });
  }
}
