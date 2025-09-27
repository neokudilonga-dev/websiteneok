

import { NextResponse, NextRequest } from 'next/server';
import { firestore } from '@/lib/firebase-admin';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function DELETE(request: NextRequest, context: { params: { name: string } }) {
    try {
        const { name } = context.params;
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
