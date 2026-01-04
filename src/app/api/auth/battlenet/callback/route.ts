import { NextRequest, NextResponse } from 'next/server'
import { battleNetAPI } from '@/lib/battlenet'
import { supabase } from '@/lib/supabase'
import jwt from 'jsonwebtoken'

export const runtime = 'nodejs'

/**
 * Handle Battle.net OAuth callback
 * GET /api/auth/battlenet/callback
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')
    
    // Check for OAuth errors
    if (error) {
      return NextResponse.redirect(
        new URL(`/member/login?error=${encodeURIComponent(error)}`, request.url)
      )
    }
    
    // Verify required parameters
    if (!code || !state) {
      return NextResponse.redirect(
        new URL('/member/login?error=missing_parameters', request.url)
      )
    }
    
    // Verify state to prevent CSRF attacks
    const storedState = request.cookies.get('battlenet_oauth_state')?.value
    if (!storedState || storedState !== state) {
      return NextResponse.redirect(
        new URL('/member/login?error=invalid_state', request.url)
      )
    }
    
    // Exchange code for access token
    const tokenResponse = await battleNetAPI.getAccessToken(code)
    
    // Get user info
    const userInfo = await battleNetAPI.getUserInfo(tokenResponse.access_token)
    
    // Calculate token expiration
    const expiresAt = new Date(Date.now() + tokenResponse.expires_in * 1000)
    
    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('battle_net_users')
      .select('*')
      .eq('battlenet_id', userInfo.id)
      .single()
    
    let userId: string
    
    if (existingUser) {
      // Update existing user
      const { data: updatedUser, error: updateError } = await supabase
        .from('battle_net_users')
        .update({
          battletag: userInfo.battletag,
          access_token: tokenResponse.access_token,
          refresh_token: tokenResponse.refresh_token || existingUser.refresh_token,
          token_expires_at: expiresAt.toISOString(),
          last_login: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', existingUser.id)
        .select()
        .single()
      
      if (updateError) {
        console.error('Error updating user:', updateError)
        return NextResponse.redirect(
          new URL('/member/login?error=database_error', request.url)
        )
      }
      
      userId = existingUser.id
    } else {
      // Create new user
      const { data: newUser, error: insertError } = await supabase
        .from('battle_net_users')
        .insert({
          battlenet_id: userInfo.id,
          battletag: userInfo.battletag,
          access_token: tokenResponse.access_token,
          refresh_token: tokenResponse.refresh_token || '',
          token_expires_at: expiresAt.toISOString()
        })
        .select()
        .single()
      
      if (insertError || !newUser) {
        console.error('Error creating user:', insertError)
        return NextResponse.redirect(
          new URL('/member/login?error=database_error', request.url)
        )
      }
      
      userId = newUser.id
    }
    
    // Log activity
    await supabase
      .from('activity_log')
      .insert({
        action: 'member_login',
        description: 'Member logged in via Battle.net',
        user: userInfo.battletag
      })
    
    // Create JWT token for session
    const sessionToken = jwt.sign(
      { 
        userId: userId,
        battlenetId: userInfo.id,
        battletag: userInfo.battletag,
        type: 'member'
      },
      process.env.NEXTAUTH_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    )
    
    // Create response with redirect to member dashboard
    const response = NextResponse.redirect(
      new URL('/member/dashboard', request.url)
    )
    
    // Set session cookie
    response.cookies.set('member-token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 604800 // 7 days
    })
    
    // Clear the OAuth state cookie
    response.cookies.delete('battlenet_oauth_state')
    
    return response
  } catch (error) {
    console.error('Battle.net OAuth callback error:', error)
    return NextResponse.redirect(
      new URL('/member/login?error=authentication_failed', request.url)
    )
  }
}

