import { firestore, auth } from '@/lib/firebase-admin';
import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { orderUpdateSchema } from '@/lib/validation/orders';

export const dynamic = 'force-static';

export async function generateStaticParams() {
  return [];
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ reference: string }> }
) {
  let reference: string | undefined;
  try {
    ({ reference } = await params);
    const body = await request.json();
    
    // Validate input data
    const validationResult = orderUpdateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({ 
        message: 'Invalid order data', 
        errors: validationResult.error.errors 
      }, { status: 400 });
    }
    
    const updateData = validationResult.data;

    console.log(`[API Orders] PUT - Updating order ${reference}:`, updateData);

    if (!reference) {
      return NextResponse.json({ message: 'Order reference is required' }, { status: 400 });
    }

    if (!firestore) {
      return NextResponse.json({ message: 'Firestore not initialized' }, { status: 500 });
    }

    const orderRef = firestore.collection('orders').doc(reference);
    const existingSnap = await orderRef.get();
    const existing = existingSnap.exists ? (existingSnap.data() as any) : {};
    const finalUpdateData: Record<string, any> = {};

    if (updateData.paymentStatus) {
      finalUpdateData.paymentStatus = updateData.paymentStatus;
      if (updateData.paymentStatus === 'paid' && existing.paymentStatus !== 'paid') {
        finalUpdateData.paidAt = new Date().toISOString();
      }
    }
    if (updateData.deliveryStatus) {
      finalUpdateData.deliveryStatus = updateData.deliveryStatus;
      if (updateData.deliveryStatus === 'delivered' && existing.deliveryStatus !== 'delivered') {
        finalUpdateData.deliveredAt = new Date().toISOString();
      }
    }
    if (updateData.deliveryDate !== undefined) {
      finalUpdateData.deliveryDate = updateData.deliveryDate;
    }

    const ownerEditable: Record<string, any> = {};
    if (updateData.guardianName !== undefined) ownerEditable.guardianName = updateData.guardianName;
    if (updateData.phone !== undefined) ownerEditable.phone = updateData.phone;
    if (updateData.deliveryAddress !== undefined) ownerEditable.deliveryAddress = updateData.deliveryAddress;
    if (updateData.studentName !== undefined) ownerEditable.studentName = updateData.studentName;
    if (updateData.studentClass !== undefined) ownerEditable.studentClass = updateData.studentClass;
    if (updateData.items !== undefined) ownerEditable.items = updateData.items;
    if (updateData.total !== undefined) ownerEditable.total = updateData.total;
    if (updateData.deliveryOption !== undefined) ownerEditable.deliveryOption = updateData.deliveryOption;
    if (updateData.paymentMethod !== undefined) ownerEditable.paymentMethod = updateData.paymentMethod;
    if (updateData.schoolId !== undefined) ownerEditable.schoolId = updateData.schoolId;
    if (updateData.schoolName !== undefined) ownerEditable.schoolName = updateData.schoolName;
    if (updateData.preferredDeliveryTime !== undefined) ownerEditable.preferredDeliveryTime = updateData.preferredDeliveryTime;

    if (Object.keys(ownerEditable).length > 0) {
      const sessionCookie = request.cookies.get('session')?.value || '';
      if (!sessionCookie) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
      }
      if (!auth) {
        return NextResponse.json({ message: 'Auth not initialized' }, { status: 500 });
      }
      const decoded = await auth.verifySessionCookie(sessionCookie, true);
      const email = (decoded as any).email || '';
      if (email !== 'neokudilonga@gmail.com') {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
      }
      const before = existing || {};
      Object.assign(finalUpdateData, ownerEditable);
      const changed: Record<string, { before: any; after: any }> = {};
      Object.keys(ownerEditable).forEach((k) => {
        changed[k] = { before: (before as any)[k], after: (ownerEditable as any)[k] };
      });
      await orderRef.collection('edits').add({
        timestamp: new Date().toISOString(),
        editorEmail: email,
        changes: changed,
      });
    }

    if (Object.keys(finalUpdateData).length === 0) {
      return NextResponse.json({ message: 'No valid fields provided for update' }, { status: 400 });
    }

    finalUpdateData.updatedAt = new Date().toISOString();

    await orderRef.update(finalUpdateData);
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

    // Enforce owner-only permission for deleting orders
    const sessionCookie = request.cookies.get('session')?.value || '';
    if (!sessionCookie) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    if (!auth) {
      return NextResponse.json({ message: 'Auth not initialized' }, { status: 500 });
    }
    const decoded = await auth.verifySessionCookie(sessionCookie, true);
    const email = (decoded as any).email || '';
    if (email !== 'neokudilonga@gmail.com') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    if (!reference) {
      return NextResponse.json({ message: 'Order reference is required' }, { status: 400 });
    }

    if (!firestore) {
      return NextResponse.json({ message: 'Firestore not initialized' }, { status: 500 });
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
