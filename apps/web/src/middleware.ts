import { NextRequest, NextResponse } from 'next/server';

const ECO_BOOKLET_PDF_PATH = '/jeux-a-imprimer-green-cottage.pdf';

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname !== ECO_BOOKLET_PDF_PATH) {
    return NextResponse.next();
  }

  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = '/';
  redirectUrl.searchParams.set('ecoBooklet', 'access-required');

  return NextResponse.redirect(redirectUrl);
}

export const config = {
  matcher: ['/jeux-a-imprimer-green-cottage.pdf'],
};
