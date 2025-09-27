
import { NextResponse, NextRequest } from 'next/server';
import { firestore } from '@/lib/firebase-admin';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function DELETE(request: NextRequest, context: any) {
    try {
        const { name } = context.params;
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
