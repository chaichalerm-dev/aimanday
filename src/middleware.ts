export { default } from 'next-auth/middleware';

// /app stays public — guests can use the tool, they just won't get saved history.
// /history and /account still require login since both are meaningless without an account.
export const config = {
  matcher: ['/history/:path*', '/account/:path*'],
};
