import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { parseSubdomain } from './utils/subdomain';

// Define reserved subdomains corresponding to top-level app directories
const staticSubdomains = new Set(['observer', 'muse', 'docs', 'seed', 'contribute', 'auth']); // Add others if needed

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const hostname = request.headers.get('host') || '';
  const url = request.nextUrl.clone(); // Clone for potential modifications

  // Debug logging
  console.log(`Middleware processing: ${hostname}${pathname}${request.nextUrl.search}`);

  const subdomain = parseSubdomain(hostname);

  // --- Dynamic Subdomain Routing (Only for root path '/' on subdomains) ---
  if (subdomain && pathname === '/') {
    if (staticSubdomains.has(subdomain)) {
      // Rewrite static subdomains (e.g., observer.domain/ -> /observer)
      url.pathname = `/${subdomain}`;
      console.log(`Rewriting static subdomain ${hostname}${pathname} to ${url.pathname}`);
      return NextResponse.rewrite(url);
    } else if (/^[a-z]$/.test(subdomain)) {
      // Rewrite single-letter concept subdomains (e.g., w.domain/ -> /w)
      // This will be caught by the /[cid]/page.tsx dynamic route
      url.pathname = `/${subdomain}`;
      console.log(`Rewriting concept subdomain ${hostname}${pathname} to ${url.pathname}`);
      return NextResponse.rewrite(url);
    }
    // If subdomain exists but doesn't match static or concept pattern,
    // and path is '/', let it fall through (maybe serves root page or 404)
  }
  // --- End Dynamic Subdomain Routing ---

  // --- Auth Redirection for 'contribute' subdomain ---
  // This checks the original pathname, which is fine here.
  if (pathname.startsWith('/auth/') && subdomain === 'contribute' && !searchParams.has('returnToContribute')) {
    const redirectUrl = new URL(pathname, `https://ab2.observer`); // Use main domain for auth
    for (const [key, value] of searchParams.entries()) {
      redirectUrl.searchParams.set(key, value);
    }
    redirectUrl.searchParams.set('returnToContribute', 'true');
    console.log(`Redirecting auth path from contribute subdomain: ${hostname}${pathname} to ${redirectUrl.toString()}`);
    return NextResponse.redirect(redirectUrl);
  }

  // --- Route Protection for /seed ---
  const finalPathname = url.pathname; // Use the potentially rewritten path for protection checks
  if (finalPathname.startsWith('/seed')) {
    console.log('Checking auth for path:', finalPathname);
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    console.log('Token for access check:', token);

    if (!token) {
      console.log('Redirecting unauthorized user (no token found) from path:', finalPathname);
      const redirectUrl = new URL('/auth/signin', request.url);
      redirectUrl.searchParams.set('callbackUrl', url.toString()); // Callback to final/rewritten URL
      return NextResponse.redirect(redirectUrl);
    }
    console.log('Token found, proceeding to page for role check for path:', finalPathname);
  }

  // --- Default: Allow request to continue ---
  // If no rewrites or redirects happened, let Next.js handle the request normally
  return NextResponse.next();
}

// Simplified matcher: run middleware on most paths except internal/static/api
export const config = {
  matcher: [
    // Match paths that don't start with /api, /_next/static, /_next/image, or /favicon.ico
    '/((?!api|_next/static|_next/image|favicon.ico).)*',
    // Explicitly include root path, which might be missed by the above negative lookahead
    '/',
  ],
}; 