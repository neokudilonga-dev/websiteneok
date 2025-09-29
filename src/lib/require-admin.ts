import 'server-only';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/firebase-admin';

const allowedAdmins = [
  'neokudilonga@gmail.com',
  'anaruimelo@gmail.com',
  'joaonfmelo@gmail.com',
];

export async function requireAdmin() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session')?.value || '';
  if (!sessionCookie) {
    redirect('/admin/login');
  }

  try {
    const decoded = await auth.verifySessionCookie(sessionCookie, true);
    const email = (decoded as any).email || '';
    if (!allowedAdmins.includes(email)) {
      redirect('/admin/login');
    }
    return decoded;
  } catch {
    redirect('/admin/login');
  }
}