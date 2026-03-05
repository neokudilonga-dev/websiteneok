
import { NextResponse } from 'next/server';
import { getCachedReadingPlan } from '@/lib/admin-cache';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const items = await getCachedReadingPlan();
    return NextResponse.json(items, { status: 200 });
  } catch (error) {
    console.error('Error fetching reading plan:', error);
    return NextResponse.json({ error: 'Failed to fetch reading plan' }, { status: 500 });
  }
}
