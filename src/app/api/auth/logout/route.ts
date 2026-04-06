import { NextResponse } from 'next/server';

export const dynamic = "force-static";

export async function POST() {
  const options = {
    name: 'session',
    value: '',
    maxAge: -1,
  };

  const response = NextResponse.json({ status: 'success' }, { status: 200 });
  response.cookies.set(options);

  return response;
}
