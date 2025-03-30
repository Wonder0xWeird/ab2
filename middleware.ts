import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname, hostname } = request.nextUrl;

  // If there's an error with the CSRF endpoint, log it for debugging
  if (pathname === '/api/auth/csrf') {
    console.log('CSRF request path:', pathname);
    console.log('CSRF request headers:', Object.fromEntries(request.headers));
  }

  // For authentication-related pages, ensure we're on the main domain
  if ((pathname.startsWith('/auth/signin') || pathname === '/auth') &&
    !hostname.match(/^ab2\.observer$/)) {
    // Create the redirect URL to the main domain
    const redirectUrl = new URL(
      pathname,
      `https://ab2.observer`
    );

    // Copy any query parameters
    redirectUrl.search = request.nextUrl.search;

    console.log(`Redirecting from ${hostname}${pathname} to ${redirectUrl.toString()}`);

    // Redirect to the main domain with the same path
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

// Match all routes that might need redirection
export const config = {
  matcher: [
    '/api/:path*',
    '/auth/:path*',
    '/auth'
  ],
}; 