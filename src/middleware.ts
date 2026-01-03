import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  // Skip middleware for login page to prevent redirect loops
  if (request.nextUrl.pathname === '/admin/login') {
    return NextResponse.next()
  }

  // Check if the request is for admin routes (except login)
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const token = request.cookies.get('admin-token')?.value

    if (!token || token.length < 10) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/((?!login|api).*)' // Match /admin/* but exclude /admin/login and /admin/api/*
  ]
}
