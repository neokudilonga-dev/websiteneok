
import { NextResponse } from 'next/server';
import { firestore } from '@/lib/firebase-admin';
import type { School } from '@/lib/types';

export async function GET() {
    try {
        const schoolsCollection = firestore.collection('schools');
        const snapshot = await schoolsCollection.get();
        const schools: School[] = [];
        snapshot.forEach(doc => {
            schools.push({ id: doc.id, description: { pt: "", en: "" }, ...doc.data() } as School);
        });
        return NextResponse.json(schools, { status: 200 });
    } catch (error) {
        console.error('Error fetching schools:', error);
        return NextResponse.json({ error: 'Failed to fetch schools' }, { status: 500 });
    }
}


export async function POST(request: Request) {
  try {
    const body: School = await request.json();
    
    // Use the provided ID from the client-side form
    const { id, ...schoolData } = body;
    const schoolDataWithDescription = {
      description: { pt: "", en: "" },
      ...schoolData,
    };
    if (!id) {
        return NextResponse.json({ error: 'School ID is required' }, { status: 400 });
    }

    const schoolRef = firestore.collection('schools').doc(id);
    await schoolRef.set(schoolDataWithDescription);

    return NextResponse.json({ id, ...schoolDataWithDescription }, { status: 201 });
  } catch (error) {
    console.error('Error adding school:', error);
    return NextResponse.json({ error: 'Failed to add school' }, { status: 500 });
  }
}
