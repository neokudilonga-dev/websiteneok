
import { firestore } from '@/lib/firebase-admin';
import { NextRequest, NextResponse } from 'next/server';
import { Order } from '@/lib/types';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ reference: string }> }
) {
  try {
    const { reference } = await params;
    const updatedOrder: Order = await request.json();

    if (!reference) {
      return NextResponse.json({ message: 'Order reference is required' }, { status: 400 });
    }

    const orderRef = firestore.collection('orders').doc(reference);
    const { paymentStatus, deliveryStatus } = updatedOrder;

    await orderRef.update({
      paymentStatus,
      deliveryStatus,
    });

    return NextResponse.json({ message: 'Order updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ message: 'Error updating order' }, { status: 500 });
  }
}
