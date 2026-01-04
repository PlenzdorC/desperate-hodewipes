import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { supabase } from '@/lib/supabase'
import { battleNetAPI } from '@/lib/battlenet'

export const runtime = 'nodejs'

/**
 * Get all characters for the authenticated member
 * GET /api/member/characters
 */
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('member-token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const decoded = jwt.verify(
      token,
      process.env.NEXTAUTH_SECRET || 'fallback-secret'
    ) as any
    
    if (!decoded || decoded.type !== 'member') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get user's characters from database
    const { data: characters, error } = await supabase
      .from('user_characters')
      .select('*')
      .eq('user_id', decoded.userId)
      .order('is_main', { ascending: false })
      .order('level', { ascending: false })
    
    if (error) {
      console.error('Error fetching characters:', error)
      return NextResponse.json(
        { error: 'Failed to fetch characters' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ characters: characters || [] })
  } catch (error) {
    console.error('Get characters error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Sync characters from Battle.net API
 * POST /api/member/characters
 */
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('member-token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const decoded = jwt.verify(
      token,
      process.env.NEXTAUTH_SECRET || 'fallback-secret'
    ) as any
    
    if (!decoded || decoded.type !== 'member') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get user's Battle.net data
    const { data: user, error: userError } = await supabase
      .from('battle_net_users')
      .select('*')
      .eq('id', decoded.userId)
      .single()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    // Check if token needs refresh
    let accessToken = user.access_token
    const tokenExpiry = new Date(user.token_expires_at)
    
    if (tokenExpiry < new Date()) {
      // Token expired, refresh it
      try {
        const tokenResponse = await battleNetAPI.refreshAccessToken(user.refresh_token)
        const newExpiry = new Date(Date.now() + tokenResponse.expires_in * 1000)
        
        await supabase
          .from('battle_net_users')
          .update({
            access_token: tokenResponse.access_token,
            token_expires_at: newExpiry.toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id)
        
        accessToken = tokenResponse.access_token
      } catch (refreshError) {
        console.error('Token refresh error:', refreshError)
        return NextResponse.json(
          { error: 'Failed to refresh access token' },
          { status: 401 }
        )
      }
    }
    
    // Get characters from Battle.net
    const characters = await battleNetAPI.getWoWCharacters(accessToken)
    
    // Process each character
    const processedCharacters = []
    
    for (const char of characters) {
      try {
        // Get detailed character profile
        const profile = await battleNetAPI.getCharacterProfile(
          accessToken,
          char.realm.slug,
          char.name
        )
        
        // Get character media
        const media = await battleNetAPI.getCharacterMedia(
          accessToken,
          char.realm.slug,
          char.name
        )
        
        const avatarUrl = media?.assets?.find((a: any) => a.key === 'avatar')?.value || null
        const thumbnailUrl = media?.assets?.find((a: any) => a.key === 'inset')?.value || null
        
        // Upsert character to database
        const { data: savedChar, error: charError } = await supabase
          .from('user_characters')
          .upsert({
            user_id: user.id,
            character_id: char.id,
            name: char.name,
            realm: char.realm.name,
            realm_slug: char.realm.slug,
            faction: char.faction.type,
            race: char.playable_race.name,
            character_class: char.playable_class.name,
            active_spec: profile.active_spec?.name || null,
            gender: char.gender.type,
            level: char.level,
            average_item_level: profile.average_item_level,
            equipped_item_level: profile.equipped_item_level,
            achievement_points: profile.achievement_points,
            thumbnail_url: thumbnailUrl,
            avatar_url: avatarUrl,
            last_login_timestamp: char.last_login_timestamp,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id,character_id'
          })
          .select()
          .single()
        
        if (!charError && savedChar) {
          processedCharacters.push(savedChar)
        }
      } catch (charError) {
        console.error(`Error processing character ${char.name}:`, charError)
        // Continue with next character
      }
    }
    
    return NextResponse.json({
      message: 'Characters synced successfully',
      count: processedCharacters.length,
      characters: processedCharacters
    })
  } catch (error) {
    console.error('Character sync error:', error)
    return NextResponse.json(
      { error: 'Failed to sync characters' },
      { status: 500 }
    )
  }
}

