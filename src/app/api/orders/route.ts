import { NextResponse } from 'next/server';
import { firestore } from '@/lib/firebase-admin';
import type { Order } from '@/lib/types';
import { sendOrderConfirmationEmail, sendAdminOrderNotification } from '@/lib/email-service';

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const orderData = await request.json();

    if (!firestore) {
      return NextResponse.json({ success: false, error: 'Firestore not initialized' }, { status: 500 });
    }

    const orderRef = firestore.collection('orders').doc();
    const order: Order = {
      ...orderData,
      reference: orderRef.id,
      paymentStatus: 'unpaid',
      deliveryStatus: 'not_delivered',
      createdAt: new Date().toISOString()
    };

    await orderRef.set(order);

    // Send email notifications (non-blocking)
    try {
      // Send confirmation to customer if email provided
      if (order.email) {
        await sendOrderConfirmationEmail(order);
      }
      // Send notification to admin
      await sendAdminOrderNotification(order);
    } catch (emailError) {
      // Log email errors but don't fail the order creation
      console.error('Error sending order emails:', emailError);
    }

    return NextResponse.json({
      success: true,
      reference: orderRef.id,
      order
    });
  } catch (error: any) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    if (!firestore) {
      return NextResponse.json({ success: false, error: 'Firestore not initialized' }, { status: 500 });
    }

    const snapshot = await firestore.collection('orders').orderBy('createdAt', 'desc').get();
    const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
    
    return NextResponse.json({ success: true, orders });
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
