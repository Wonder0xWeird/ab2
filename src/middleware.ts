import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { parseSubdomain } from './utils/subdomain';

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const hostname = request.headers.get('host') || '';

  // Debug logging
  console.log(`Middleware processing: ${hostname}${pathname}${request.nextUrl.search}`);

  // --- Subdomain Logic & Auth Redirection --- 

  const subdomain = parseSubdomain(hostname);
  const url = request.nextUrl.clone(); // Clone for potential modifications

  // --- Add Concept Subdomain Rewrite Logic --- 
  // Check if subdomain is a single lowercase letter (a-z)
  if (subdomain && /^[a-z]$/.test(subdomain) && pathname === '/') {
    // Rewrite e.g., w.localhost:3000/ to /w
    url.pathname = `/${subdomain}`;
    console.log(`Rewriting concept subdomain ${hostname}${pathname} to ${url.pathname}`);
    return NextResponse.rewrite(url);
  }
  // --- End Concept Subdomain Rewrite Logic --- 

  // 1. Handle Auth redirection for 'contribute' subdomain
  if (pathname.startsWith('/auth/') && subdomain === 'contribute' && !searchParams.has('returnToContribute')) {
    const redirectUrl = new URL(pathname, `https://ab2.observer`);
    // Copy existing query parameters
    for (const [key, value] of searchParams.entries()) {
      redirectUrl.searchParams.set(key, value);
    }
    redirectUrl.searchParams.set('returnToContribute', 'true');
    console.log(`Redirecting auth path from contribute subdomain: ${hostname}${pathname} to ${redirectUrl.toString()}`);
    return NextResponse.redirect(redirectUrl);
  }

  // 2. Handle Admin subdomain rewrite
  if (pathname === '/' && subdomain === 'seed') {
    url.pathname = '/seed'; // Rewrite seed.ab2.observer/ to /seed
    console.log(`Rewriting admin subdomain ${hostname}${pathname} to ${url.pathname}`);
    return NextResponse.rewrite(url);
  }

  // --- Route Protection for /seed --- 

  // Check if the *final* path (after potential rewrite) starts with /seed
  const finalPathname = url.pathname; // Use the potentially rewritten path
  if (finalPathname.startsWith('/seed')) {
    console.log('Checking auth for path:', finalPathname);
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    console.log('Token for access check:', token);

    // If no token, redirect immediately using an absolute URL
    if (!token) {
      console.log('Redirecting unauthorized user (no token found)');
      const redirectUrl = new URL('/auth/signin', request.url); // Use original request URL for base
      redirectUrl.searchParams.set('callbackUrl', url.toString()); // Callback to potentially rewritten URL
      return NextResponse.redirect(redirectUrl);
    }

    // If token exists, allow proceeding; page will handle role check
    console.log('Token found, proceeding to page for role check for path:', finalPathname);
  }

  // Allow request to continue (either untouched or after rewrite)
  return NextResponse.next();
}

// Updated matcher to cover all relevant paths
export const config = {
  matcher: [
    '/',             // Root path (for seed subdomain rewrite)
    '/seed/:path*',  // Seed path protection (only checks for token presence now)
    '/auth/:path*',  // Contribute auth path redirection
    // Add other paths if the concept rewrite might interfere
    // e.g., '/api/:path*', '/static/:path*'
  ],
}; 