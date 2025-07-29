
import { NextResponse } from 'next/server';
import { firestore } from '@/lib/firebase-admin';
import type { School } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const body: School = await request.json();
    
    // Use the provided ID from the client-side form
    const { id, ...schoolData } = body;
    if (!id) {
        return NextResponse.json({ error: 'School ID is required' }, { status: 400 });
    }

    const schoolRef = firestore.collection('schools').doc(id);
    await schoolRef.set(schoolData);

    return NextResponse.json({ id, ...schoolData }, { status: 201 });
  } catch (error) {
    console.error('Error adding school:', error);
    return NextResponse.json({ error: 'Failed to add school' }, { status: 500 });
  }
}
