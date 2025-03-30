import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname, hostname, searchParams } = request.nextUrl;

  // Debug logging to help diagnose the redirect issue
  console.log(`Middleware processing: ${hostname}${pathname}${request.nextUrl.search}`);

  // If there's an error with the CSRF endpoint, log it for debugging
  if (pathname === '/api/auth/csrf') {
    console.log('CSRF request path:', pathname);
    console.log('CSRF request headers:', Object.fromEntries(request.headers));
  }

  // Check if we're on the contribute subdomain
  const isContributeSubdomain = hostname === 'contribute.ab2.observer';

  // Check if returnToContribute parameter is present
  const hasReturnToContribute = searchParams.has('returnToContribute');
  const returnToContribute = searchParams.get('returnToContribute') === 'true';

  // Only redirect auth paths when on contribute subdomain
  // And don't redirect if we're already handling a returnToContribute flow
  if (pathname.startsWith('/auth/') &&
    isContributeSubdomain &&
    !hasReturnToContribute) {

    // Create the redirect URL to the main domain with the returnToContribute parameter
    const redirectUrl = new URL(
      pathname,
      `https://ab2.observer`
    );

    // Copy existing query parameters
    for (const [key, value] of searchParams.entries()) {
      redirectUrl.searchParams.set(key, value);
    }

    // Add returnToContribute parameter
    redirectUrl.searchParams.set('returnToContribute', 'true');

    console.log(`Redirecting from ${hostname}${pathname}${request.nextUrl.search} to ${redirectUrl.toString()}`);

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