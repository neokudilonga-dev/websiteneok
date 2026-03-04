
import { firestore } from '@/lib/firebase-admin';
import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { Order } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ reference: string }> }
) {
  let reference: string | undefined;
  try {
    ({ reference } = await params);
    const { paymentStatus, deliveryStatus, deliveryDate } = await request.json(); // Expect partial update

    console.log(`[API Orders] PUT - Updating order ${reference}:`, { paymentStatus, deliveryStatus, deliveryDate });

    if (!reference) {
      return NextResponse.json({ message: 'Order reference is required' }, { status: 400 });
    }

    const orderRef = firestore.collection('orders').doc(reference);
    const updateData: { paymentStatus?: string; deliveryStatus?: string; deliveryDate?: string; updatedAt?: string } = {};

    if (paymentStatus) {
      updateData.paymentStatus = paymentStatus;
    }
    if (deliveryStatus) {
      updateData.deliveryStatus = deliveryStatus;
    }
    if (deliveryDate !== undefined) {
      updateData.deliveryDate = deliveryDate;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ message: 'No valid fields provided for update' }, { status: 400 });
    }

    updateData.updatedAt = new Date().toISOString();

    await orderRef.update(updateData);
    console.log(`[API Orders] PUT - Order ${reference} updated successfully`);
    
    revalidateTag('orders');

    return NextResponse.json({ message: 'Order updated successfully' }, { status: 200 });
  } catch (error) {
    console.error(`[API Orders] PUT - Error updating order ${reference ?? ''}:`, error);
    return NextResponse.json({ message: 'Error updating order', error: String(error) }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ reference: string }> }
) {
  let reference: string | undefined;
  try {
    ({ reference } = await params);
    console.log(`[API Orders] DELETE - Deleting order ${reference}`);

    if (!reference) {
      return NextResponse.json({ message: 'Order reference is required' }, { status: 400 });
    }

    await firestore.collection('orders').doc(reference).delete();
    console.log(`[API Orders] DELETE - Order ${reference} deleted successfully`);

    revalidateTag('orders');

    return NextResponse.json({ message: 'Order deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error(`[API Orders] DELETE - Error deleting order ${reference ?? ''}:`, error);
    return NextResponse.json({ message: 'Error deleting order', error: String(error) }, { status: 500 });
  }
}
