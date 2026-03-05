
import { firestore, auth } from '@/lib/firebase-admin';
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
    const body = await request.json();
    const { paymentStatus, deliveryStatus, deliveryDate, guardianName, phone, deliveryAddress, studentName, studentClass, items, total, deliveryOption, paymentMethod, schoolId, schoolName, preferredDeliveryTime } = body;

    console.log(`[API Orders] PUT - Updating order ${reference}:`, { paymentStatus, deliveryStatus, deliveryDate });

    if (!reference) {
      return NextResponse.json({ message: 'Order reference is required' }, { status: 400 });
    }

    const orderRef = firestore.collection('orders').doc(reference);
    const existingSnap = await orderRef.get();
    const existing = existingSnap.exists ? (existingSnap.data() as any) : {};
    const updateData: Record<string, any> = {};

    if (paymentStatus) {
      updateData.paymentStatus = paymentStatus;
      if (paymentStatus === 'paid' && existing.paymentStatus !== 'paid') {
        updateData.paidAt = new Date().toISOString();
      }
    }
    if (deliveryStatus) {
      updateData.deliveryStatus = deliveryStatus;
      if (deliveryStatus === 'delivered' && existing.deliveryStatus !== 'delivered') {
        updateData.deliveredAt = new Date().toISOString();
      }
    }
    if (deliveryDate !== undefined) {
      updateData.deliveryDate = deliveryDate;
    }

    const ownerEditable: Record<string, any> = {};
    if (guardianName !== undefined) ownerEditable.guardianName = guardianName;
    if (phone !== undefined) ownerEditable.phone = phone;
    if (deliveryAddress !== undefined) ownerEditable.deliveryAddress = deliveryAddress;
    if (studentName !== undefined) ownerEditable.studentName = studentName;
    if (studentClass !== undefined) ownerEditable.studentClass = studentClass;
    if (items !== undefined) ownerEditable.items = items;
    if (total !== undefined) ownerEditable.total = total;
    if (deliveryOption !== undefined) ownerEditable.deliveryOption = deliveryOption;
    if (paymentMethod !== undefined) ownerEditable.paymentMethod = paymentMethod;
    if (schoolId !== undefined) ownerEditable.schoolId = schoolId;
    if (schoolName !== undefined) ownerEditable.schoolName = schoolName;
    if (preferredDeliveryTime !== undefined) ownerEditable.preferredDeliveryTime = preferredDeliveryTime;

    if (Object.keys(ownerEditable).length > 0) {
      const sessionCookie = request.cookies.get('session')?.value || '';
      if (!sessionCookie) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
      }
      const decoded = await auth.verifySessionCookie(sessionCookie, true);
      const email = (decoded as any).email || '';
      if (email !== 'neokudilonga@gmail.com') {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
      }
      const before = existing || {};
      Object.assign(updateData, ownerEditable);
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

    // Enforce owner-only permission for deleting orders
    const sessionCookie = request.cookies.get('session')?.value || '';
    if (!sessionCookie) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const decoded = await auth.verifySessionCookie(sessionCookie, true);
    const email = (decoded as any).email || '';
    if (email !== 'neokudilonga@gmail.com') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

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
