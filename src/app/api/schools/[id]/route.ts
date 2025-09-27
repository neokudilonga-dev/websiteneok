
import { NextResponse } from 'next/server';
import { firestore } from '@/lib/firebase-admin';
import type { School } from '@/lib/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function PUT(request: Request, context: any) {
  try {
    const { id } = context.params;
    const body: School = await request.json();
    
    const schoolRef = firestore.collection('schools').doc(id);
    // Remove id from body to avoid duplicate keys
    const { id: _bodyId, ...updateData } = body;
    await schoolRef.update(updateData);
    return NextResponse.json({ ...updateData, id }, { status: 200 });
  } catch (error) {
    console.error('Error updating school:', error);
    return NextResponse.json({ error: 'Failed to update school' }, { status: 500 });
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function DELETE(request: Request, context: any) {
    try {
        const { id } = context.params;
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
