import { NextRequest, NextResponse } from 'next/server'
import { battleNetAPI } from '@/lib/battlenet'
import { randomBytes } from 'crypto'

export const runtime = 'nodejs'

/**
 * Initiate Battle.net OAuth flow
 * GET /api/auth/battlenet
 */
export async function GET(request: NextRequest) {
  try {
    // Generate a random state for CSRF protection
    const state = randomBytes(16).toString('hex')
    
    // Get the authorization URL
    const authUrl = battleNetAPI.getAuthorizationUrl(state)
    
    // Create response with redirect
    const response = NextResponse.redirect(authUrl)
    
    // Store state in cookie for verification in callback
    response.cookies.set('battlenet_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600 // 10 minutes
    })
    
    return response
  } catch (error) {
    console.error('Battle.net OAuth initiation error:', error)
    return NextResponse.json(
      { error: 'Failed to initiate Battle.net login' },
      { status: 500 }
    )
  }
}

