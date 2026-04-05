
import { firestore } from '@/lib/firebase-admin';
import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';

export async function POST(request: NextRequest) {
  try {
    const { schools } = await request.json();
    
    if (!Array.isArray(schools)) {
      return NextResponse.json({ message: 'Invalid data format' }, { status: 400 });
    }

    if (!firestore) {
      return NextResponse.json({ message: 'Firestore not initialized' }, { status: 500 });
    }

    const batch = firestore.batch();
    
    schools.forEach((school: { id: string; order: number }) => {
      const schoolRef = firestore!.collection('schools').doc(school.id);
      batch.update(schoolRef, { order: school.order });
    });

    await batch.commit();
    
    try {
      revalidateTag('schools');
    } catch (e) {
      console.warn('RevalidateTag failed:', e);
    }

    return NextResponse.json({ message: 'Schools reordered successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error reordering schools:', error);
    return NextResponse.json({ message: 'Error reordering schools', error: String(error) }, { status: 500 });
  }
}
