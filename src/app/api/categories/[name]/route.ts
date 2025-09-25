

import { NextResponse } from 'next/server';
import { firestore } from '@/lib/firebase-admin';

export async function DELETE(request: Request, { params }: { params: { name: string } }) {
    try {
        const name = decodeURIComponent(params.name);
        if (!name) {
            return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
        }

        // Use pt name as doc ID
        const docRef = firestore.collection('categories').doc(name);
        const doc = await docRef.get();
        if (!doc.exists) {
            return NextResponse.json({ error: 'Category not found' }, { status: 404 });
        }
        await docRef.delete();
        return NextResponse.json({ message: 'Category deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error deleting category:', error);
        return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
    }
}
