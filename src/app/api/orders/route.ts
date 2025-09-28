
import { firestore } from '@/lib/firebase-admin';
import { NextRequest, NextResponse } from 'next/server';
import { Order } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const order: Order = await request.json();
    const orderRef = firestore.collection('orders').doc(order.reference);
    await orderRef.set(order);
    return NextResponse.json({ message: 'Order created successfully' }, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ message: 'Error creating order' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const ordersSnapshot = await firestore.collection('orders').get();
    const orders: Order[] = [];
    ordersSnapshot.forEach(doc => {
      orders.push(doc.data() as Order);
    });
    return NextResponse.json(orders, { status: 200 });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ message: 'Error fetching orders' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
