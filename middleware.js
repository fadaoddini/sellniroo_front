// middleware.js
import { NextResponse } from 'next/server';

export function middleware(request) {
  const pathname = request.nextUrl.pathname;
  
  const redirects = {
    '/kanaf': '/کناف',
    '/lsf': '/الـاسـاف',
    '/gach': '/گچ',
    '/gypsum': '/گچ',
  };
  
  if (redirects[pathname]) {
    return NextResponse.redirect(
      new URL(redirects[pathname], request.url),
      301
    );
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/kanaf', '/lsf', '/gach', '/gypsum'],
};