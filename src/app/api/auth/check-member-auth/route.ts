import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { supabase } from '@/lib/supabase'

export const runtime = 'nodejs'

/**
 * Check if member is authenticated
 * GET /api/auth/check-member-auth
 */
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('member-token')?.value
    
    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }
    
    // Verify JWT token
    const decoded = jwt.verify(
      token,
      process.env.NEXTAUTH_SECRET || 'fallback-secret'
    ) as any
    
    if (!decoded || decoded.type !== 'member') {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }
    
    // Get user from database
    const { data: user, error } = await supabase
      .from('battle_net_users')
      .select('id, battlenet_id, battletag, region, last_login')
      .eq('id', decoded.userId)
      .single()
    
    if (error || !user) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }
    
    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        battlenetId: user.battlenet_id,
        battletag: user.battletag,
        region: user.region,
        lastLogin: user.last_login
      }
    })
  } catch (error) {
    console.error('Auth check error:', error)
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }
}

