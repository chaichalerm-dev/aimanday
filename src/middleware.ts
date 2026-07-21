import { NextResponse, type NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const isDev = process.env.NODE_ENV === 'development';

// /app stays public — guests can use the tool, they just won't get saved history.
// /history and /account still require login since both are meaningless without an account.
// (API routes with the same prefixes, e.g. /api/history, are NOT covered here — they
// enforce their own getServerSession() check as defense-in-depth; see route handlers.)
function isProtectedPage(pathname: string): boolean {
  return (
    pathname === '/history' || pathname.startsWith('/history/') ||
    pathname === '/account' || pathname.startsWith('/account/')
  );
}

// Per-request nonce lets script-src drop 'unsafe-inline' entirely — an inline
// <script> (ours in layout.tsx, or Next's own hydration scripts) only runs if it
// carries this nonce. 'strict-dynamic' lets scripts loaded BY a nonce'd script run
// too; browsers too old to understand it fall back to the 'self' allowlist instead.
function buildCsp(nonce: string): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ''}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob:",
    "media-src 'self' blob:",
    `connect-src 'self'${isDev ? ' ws:' : ''}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    'upgrade-insecure-requests',
  ].join('; ');
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (isProtectedPage(pathname)) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      const signInUrl = new URL('/login', request.url);
      signInUrl.searchParams.set('callbackUrl', `${pathname}${search}`);
      return NextResponse.redirect(signInUrl);
    }
  }

  const nonce = crypto.randomUUID().replace(/-/g, '');

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set('Content-Security-Policy', buildCsp(nonce));
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icon.svg).*)'],
};
