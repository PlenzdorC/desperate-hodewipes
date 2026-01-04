import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { supabase } from '@/lib/supabase'
import { battleNetAPI } from '@/lib/battlenet'

export const runtime = 'nodejs'

/**
 * Refresh character data from Battle.net API
 * POST /api/member/characters/[characterId]/refresh
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ characterId: string }> }
) {
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
    
    const { characterId } = await params
    
    // Get character from database
    const { data: character, error: charError } = await supabase
      .from('user_characters')
      .select('*')
      .eq('id', characterId)
      .eq('user_id', decoded.userId)
      .single()
    
    if (charError || !character) {
      return NextResponse.json({ error: 'Character not found' }, { status: 404 })
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
    
    // Get updated character profile
    const profile = await battleNetAPI.getCharacterProfile(
      accessToken,
      character.realm_slug,
      character.name
    )
    
    // Get character media
    const media = await battleNetAPI.getCharacterMedia(
      accessToken,
      character.realm_slug,
      character.name
    )
    
    const avatarUrl = media?.assets?.find((a: any) => a.key === 'avatar')?.value || character.avatar_url
    const thumbnailUrl = media?.assets?.find((a: any) => a.key === 'inset')?.value || character.thumbnail_url
    
    // Update character in database
    const { data: updatedChar, error: updateError } = await supabase
      .from('user_characters')
      .update({
        active_spec: profile.active_spec?.name || null,
        level: profile.level,
        average_item_level: profile.average_item_level,
        equipped_item_level: profile.equipped_item_level,
        achievement_points: profile.achievement_points,
        thumbnail_url: thumbnailUrl,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', characterId)
      .select()
      .single()
    
    if (updateError) {
      console.error('Error updating character:', updateError)
      return NextResponse.json(
        { error: 'Failed to update character' },
        { status: 500 }
      )
    }
    
    // Get and update equipment
    const equipment = await battleNetAPI.getCharacterEquipment(
      accessToken,
      character.realm_slug,
      character.name
    )
    
    if (equipment && equipment.equipped_items) {
      // Delete old equipment
      await supabase
        .from('character_equipment')
        .delete()
        .eq('character_id', characterId)
      
      // Insert new equipment
      const equipmentData = equipment.equipped_items.map(item => ({
        character_id: characterId,
        slot: item.slot.type,
        item_id: item.item.id,
        item_name: item.name,
        item_level: item.level.value,
        quality: item.quality.type,
        enchantments: item.enchantments || null,
        gems: item.sockets || null
      }))
      
      await supabase
        .from('character_equipment')
        .insert(equipmentData)
    }
    
    return NextResponse.json({
      message: 'Character refreshed successfully',
      character: updatedChar
    })
  } catch (error) {
    console.error('Character refresh error:', error)
    return NextResponse.json(
      { error: 'Failed to refresh character' },
      { status: 500 }
    )
  }
}

