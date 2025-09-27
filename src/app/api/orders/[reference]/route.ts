
import { NextResponse, NextRequest } from 'next/server';
import { firestore } from '@/lib/firebase-admin';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function PUT(request: NextRequest, context: any) {
  try {
    const { reference } = context.params;
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
