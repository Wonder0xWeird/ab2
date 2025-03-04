import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { parseSubdomain } from './utils/subdomain';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get('host') || '';

  // Get subdomain from hostname
  const subdomain = parseSubdomain(hostname);

  // Clone the URL
  const url = request.nextUrl.clone();

  // If we're at the root path and have a subdomain
  if (pathname === '/' && subdomain) {
    // Rewrite to the appropriate page
    url.pathname = `/${subdomain}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: '/',
}; 