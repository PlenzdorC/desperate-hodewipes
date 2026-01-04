import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

/**
 * Handle member logout
 * POST /api/auth/member-logout
 */
export async function POST(request: NextRequest) {
  const response = NextResponse.json({ message: 'Logged out successfully' })
  
  // Clear member session cookie
  response.cookies.delete('member-token')
  
  return response
}

