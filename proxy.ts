import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const url = request.nextUrl
  const hostname = request.headers.get('host') || ''

  // 1. Deteksi Subdomain: undangan.gemma.web.id
  if (hostname.includes('undangan.gemma.web.id')) {
    // Jika user mengakses root subdomain, arahkan (rewrite) ke folder /undangan
    // Tapi jangan rewrite jika path-nya sudah diawali /undangan (biar tidak double)
    if (!url.pathname.startsWith('/undangan')) {
      return NextResponse.rewrite(new URL(`/undangan${url.pathname}`, request.url))
    }
  }

  return NextResponse.next()
}

// Hanya jalankan middleware pada path aplikasi, bukan file statis/api
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
