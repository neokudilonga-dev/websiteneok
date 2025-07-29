
import { NextResponse } from 'next/server';
import { firestore } from '@/lib/firebase-admin';
import type { Order } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const body: Order = await request.json();
    if (!body.reference) {
        return NextResponse.json({ error: 'Order reference is required' }, { status: 400 });
    }
    
    // Set payment and delivery status on creation
    body.paymentStatus = body.paymentMethod === 'transferencia' ? 'unpaid' : 'cod';
    body.deliveryStatus = 'not_delivered';

    const orderRef = firestore.collection('orders').doc(body.reference);
    await orderRef.set(body);

    return NextResponse.json(body, { status: 201 });
  } catch (error) {
    console.error('Error adding order:', error);
    return NextResponse.json({ error: 'Failed to add order' }, { status: 500 });
  }
}
