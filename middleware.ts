import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // If there's an error with the CSRF endpoint, log it for debugging
  if (request.nextUrl.pathname === '/api/auth/csrf') {
    console.log('CSRF request path:', request.nextUrl.pathname);
    console.log('CSRF request headers:', Object.fromEntries(request.headers));
  }

  return NextResponse.next();
}

// Match all API routes except the ones that start with _next
export const config = {
  matcher: '/api/:path*',
}; 