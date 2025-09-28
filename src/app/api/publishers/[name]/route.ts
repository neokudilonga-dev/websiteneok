
import { firestore } from '@/lib/firebase-admin';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params;

    if (!name) {
      return NextResponse.json({ message: 'Publisher name is required' }, { status: 400 });
    }

    const publisherRef = firestore.collection('publishers').doc(name);
    await publisherRef.delete();

    return NextResponse.json({ message: 'Publisher deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting publisher:', error);
    return NextResponse.json({ message: 'Error deleting publisher' }, { status: 500 });
  }
}
