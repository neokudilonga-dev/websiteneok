
import { firestore } from '@/lib/firebase-admin';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email')?.toLowerCase().trim();
    const reference = searchParams.get('reference')?.toUpperCase().trim();

    if (!email || !reference) {
      return NextResponse.json({ message: 'Email and reference are required' }, { status: 400 });
    }

    console.log(`[API Orders Search] Searching for order: ${reference} with email: ${email}`);

    if (!firestore) {
      return NextResponse.json({ message: 'Firestore not initialized' }, { status: 500 });
    }

    const orderRef = firestore.collection('orders').doc(reference);
    const doc = await orderRef.get();

    if (!doc.exists) {
      console.log(`[API Orders Search] Order ${reference} not found`);
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }

    const orderData = doc.data();

    // Verify email matches
    if (orderData?.email?.toLowerCase().trim() !== email) {
      console.log(`[API Orders Search] Email mismatch for order ${reference}`);
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }

    // Return only necessary public info
    const publicOrder = {
      reference: orderData.reference,
      date: orderData.date,
      createdAt: orderData.createdAt,
      paymentStatus: orderData.paymentStatus,
      paidAt: orderData.paidAt,
      deliveryStatus: orderData.deliveryStatus,
      deliveredAt: orderData.deliveredAt,
      deliveryDate: orderData.deliveryDate,
      total: orderData.total,
      guardianName: orderData.guardianName,
      preferredDeliveryTime: orderData.preferredDeliveryTime,
      items: orderData.items.map((item: any) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price
      }))
    };

    return NextResponse.json(publicOrder, { status: 200 });
  } catch (error) {
    console.error('[API Orders Search] Error searching order:', error);
    return NextResponse.json({ message: 'Error searching order' }, { status: 500 });
  }
}
