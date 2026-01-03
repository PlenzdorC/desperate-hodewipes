import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('admin-token')?.value

    if (!token) {
      return NextResponse.json({ authenticated: false })
    }

    try {
      const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'fallback-secret') as any
      
      return NextResponse.json({
        authenticated: true,
        user: {
          id: decoded.userId,
          username: decoded.username
        }
      })
    } catch (jwtError) {
      return NextResponse.json({ authenticated: false })
    }

  } catch (error) {
    console.error('Auth check error:', error)
    return NextResponse.json({ authenticated: false })
  }
}
