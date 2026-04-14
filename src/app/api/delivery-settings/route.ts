import { NextRequest, NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeFirebaseAdmin } from '@/lib/firebase-admin';
import type { DeliverySettings } from '@/lib/types';

// Initialize Firebase Admin
initializeFirebaseAdmin();
const db = getFirestore();

const DEFAULT_SETTINGS: Omit<DeliverySettings, 'id'> = {
  feeTalatona: 2000,
  feeOutsideTalatona: 2500,
  feeOutsideZones: 4000,
  exemptionTalatona: 70000,
  exemptionOutsideTalatona: 80000,
  updatedAt: new Date().toISOString(),
};

// GET /api/delivery-settings
export async function GET() {
  try {
    const docRef = db.collection('settings').doc('delivery');
    const doc = await docRef.get();
    
    if (!doc.exists) {
      // Return default settings if none exist
      return NextResponse.json({ id: 'delivery', ...DEFAULT_SETTINGS });
    }
    
    return NextResponse.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error('Error fetching delivery settings:', error);
    return NextResponse.json({ id: 'delivery', ...DEFAULT_SETTINGS });
  }
}

// PUT /api/delivery-settings
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    const settings: Omit<DeliverySettings, 'id'> = {
      feeTalatona: body.feeTalatona ?? DEFAULT_SETTINGS.feeTalatona,
      feeOutsideTalatona: body.feeOutsideTalatona ?? DEFAULT_SETTINGS.feeOutsideTalatona,
      feeOutsideZones: body.feeOutsideZones ?? DEFAULT_SETTINGS.feeOutsideZones,
      exemptionTalatona: body.exemptionTalatona ?? DEFAULT_SETTINGS.exemptionTalatona,
      exemptionOutsideTalatona: body.exemptionOutsideTalatona ?? DEFAULT_SETTINGS.exemptionOutsideTalatona,
      updatedAt: new Date().toISOString(),
    };
    
    const docRef = db.collection('settings').doc('delivery');
    await docRef.set(settings);
    
    return NextResponse.json({ id: 'delivery', ...settings });
  } catch (error) {
    console.error('Error updating delivery settings:', error);
    return NextResponse.json(
      { error: 'Failed to update delivery settings' },
      { status: 500 }
    );
  }
}
