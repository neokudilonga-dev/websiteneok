
import { NextResponse } from 'next/server';
import { firestore } from '@/lib/firebase-admin';
import type { Order } from '@/lib/types';

export async function GET() {
  try {
    const ordersCollection = firestore.collection('orders');
    const snapshot = await ordersCollection.orderBy('date', 'desc').get();
    
    if (snapshot.empty) {
      return NextResponse.json([], { status: 200 });
    }

    const orders: Order[] = [];
    snapshot.forEach(doc => {
      orders.push(doc.data() as Order);
    });

    return NextResponse.json(orders, { status: 200 });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

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
