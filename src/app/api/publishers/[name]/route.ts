
import { NextResponse } from 'next/server';
import { firestore } from '@/lib/firebase-admin';

export async function DELETE(request: Request, { params }: { params: { name: string } }) {
    try {
        const name = decodeURIComponent(params.name);
        if (!name) {
            return NextResponse.json({ error: 'Publisher name is required' }, { status: 400 });
        }

        const publisherRef = firestore.collection('publishers').doc(name);
        await publisherRef.delete();

        return NextResponse.json({ message: 'Publisher deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error deleting publisher:', error);
        return NextResponse.json({ error: 'Failed to delete publisher' }, { status: 500 });
    }
}
