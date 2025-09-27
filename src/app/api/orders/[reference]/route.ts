
import { NextResponse } from 'next/server';
import { firestore } from '@/lib/firebase-admin';

export async function PUT(request: Request, context: any) {
  try {
    const { reference } = params;
    const body = await request.json();
    
    if (!body.paymentStatus && !body.deliveryStatus) {
        return NextResponse.json({ error: 'Either paymentStatus or deliveryStatus is required' }, { status: 400 });
    }

    const orderRef = firestore.collection('orders').doc(reference);
    await orderRef.update(body);

    return NextResponse.json({ reference, ...body }, { status: 200 });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
