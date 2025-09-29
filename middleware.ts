
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const sessionCookie = request.cookies.get('session')?.value

  // If the user is trying to access an admin page
  if (pathname.startsWith('/admin')) {
    // If they are on the login page, let them proceed
    if (pathname.startsWith('/admin/login')) {
      return NextResponse.next()
    }

    // If they have no session cookie, redirect to login
    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    // Verify the session cookie
    try {
        const response = await fetch(new URL('/api/auth/verify', request.url), {
            headers: {
                Cookie: `session=${sessionCookie}`
            }
        });

        if (!response.ok) {
            // If verification fails, redirect to login and clear the invalid cookie
            const redirectResponse = NextResponse.redirect(new URL('/admin/login', request.url));
            redirectResponse.cookies.delete('session');
            return redirectResponse;
        }

        const data = await response.json();
        if (!data?.isAuthenticated) {
            const redirectResponse = NextResponse.redirect(new URL('/admin/login', request.url));
            redirectResponse.cookies.delete('session');
            return redirectResponse;
        }

    } catch (error) {
        console.error('Middleware verification error:', error);
        const redirectResponse = NextResponse.redirect(new URL('/admin/login', request.url));
        redirectResponse.cookies.delete('session');
        return redirectResponse;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
}
