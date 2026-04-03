
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const sessionCookie = request.cookies.get('session')?.value

  console.log(`[middleware] ${pathname} - Session cookie: ${sessionCookie ? 'present' : 'missing'}`);

  // If the user is trying to access an admin page
  if (pathname.startsWith('/admin')) {
    // If they are on the login page, let them proceed
    if (pathname.startsWith('/admin/login')) {
      console.log('[middleware] Allowing login page');
      return NextResponse.next()
    }

    // If they have no session cookie, redirect to login
    if (!sessionCookie) {
      console.log('[middleware] No session cookie, redirecting to login');
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    // Verify the session cookie
    try {
        console.log('[middleware] Verifying session cookie...');
        const response = await fetch(new URL('/api/auth/verify', request.url), {
            headers: {
                Cookie: `session=${sessionCookie}`
            }
        });

        console.log(`[middleware] Verify response status: ${response.status}`);

        if (!response.ok) {
            console.log('[middleware] Verification response not OK, redirecting');
            const redirectResponse = NextResponse.redirect(new URL('/admin/login', request.url));
            redirectResponse.cookies.delete('session');
            return redirectResponse;
        }

        const data = await response.json();
        console.log(`[middleware] Verification result: isAuthenticated=${data?.isAuthenticated}`);
        
        if (!data?.isAuthenticated) {
            console.log('[middleware] Not authenticated, redirecting');
            const redirectResponse = NextResponse.redirect(new URL('/admin/login', request.url));
            redirectResponse.cookies.delete('session');
            return redirectResponse;
        }

        console.log('[middleware] Authentication successful, proceeding');

    } catch (error) {
        console.error('[middleware] Verification error:', error);
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
