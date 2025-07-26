
import { NextResponse } from 'next/server';
import { firestore } from '@/lib/firebase-admin';
import type { School } from '@/lib/types';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body: School = await request.json();
    
    // The name object is complex, so we need to handle it properly.
    // The rest of the properties can be spread.
    const { name, ...restOfBody } = body;

    const schoolRef = firestore.collection('schools').doc(id);
    await schoolRef.update({
        'name.pt': name.pt,
        'name.en': name.en,
        ...restOfBody
    });

    return NextResponse.json({ id, ...body }, { status: 200 });
  } catch (error) {
    console.error('Error updating school:', error);
    return NextResponse.json({ error: 'Failed to update school' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const schoolRef = firestore.collection('schools').doc(id);
        await schoolRef.delete();
        
        // Optional: Also delete associated reading plan items
        const readingPlanQuery = firestore.collection('readingPlan').where('schoolId', '==', id);
        const readingPlanSnapshot = await readingPlanQuery.get();
        const batch = firestore.batch();
        readingPlanSnapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });
        await batch.commit();

        return NextResponse.json({ message: 'School and associated reading plan items deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error deleting school:', error);
        return NextResponse.json({ error: 'Failed to delete school' }, { status: 500 });
    }
}
