
import { NextResponse } from 'next/server';
import { firestore } from '@/lib/firebase-admin';

export async function DELETE(request: Request, { params }: { params: { name: string } }) {
    try {
        const name = decodeURIComponent(params.name);
        if (!name) {
            return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
        }

        const categoriesCollection = firestore.collection('categories');
        const querySnapshot = await categoriesCollection.where('name', '==', name).limit(1).get();

        if (querySnapshot.empty) {
            return NextResponse.json({ error: 'Category not found' }, { status: 404 });
        }

        const doc = querySnapshot.docs[0];
        await doc.ref.delete();

        return NextResponse.json({ message: 'Category deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error deleting category:', error);
        return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
    }
}
