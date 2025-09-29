
import { NextResponse } from 'next/server';
import { firestore } from '@/lib/firebase-admin';
import type { School } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        console.log('[api/schools] GET function started.');
        const schoolsCollection = firestore.collection('schools');
        console.log('[api/schools] schoolsCollection created.');
        const snapshot = await schoolsCollection.get();
        console.log('[api/schools] Snapshot received.');
        const schools: School[] = [];
        snapshot.forEach(doc => {
            schools.push({ id: doc.id, description: { pt: "", en: "" }, ...doc.data() } as School);
        });
        console.log('[api/schools] Schools data processed.');
        return NextResponse.json(schools, { status: 200 });
    } catch (error) {
        console.error('[api/schools] Error in GET function:', error);
        console.error('[api/schools] Error stack:', (error as any).stack);
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
