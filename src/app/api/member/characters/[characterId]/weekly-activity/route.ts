import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { supabase } from '@/lib/supabase'
import { battleNetAPI } from '@/lib/battlenet'

export const runtime = 'nodejs'

/**
 * Get the current week start and end dates (Tuesday reset)
 */
function getCurrentWeekDates(): { weekStart: Date; weekEnd: Date } {
  const now = new Date()
  const dayOfWeek = now.getDay()
  
  // WoW week starts on Tuesday (2)
  const daysFromTuesday = (dayOfWeek + 5) % 7
  
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - daysFromTuesday)
  weekStart.setHours(0, 0, 0, 0)
  
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)
  weekEnd.setHours(23, 59, 59, 999)
  
  return { weekStart, weekEnd }
}

/**
 * Get weekly activity for a character
 * GET /api/member/characters/[characterId]/weekly-activity
 */
export async function GET(
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
    const { weekStart, weekEnd } = getCurrentWeekDates()
    
    // Get this week's activity
    const { data: activity, error } = await supabase
      .from('weekly_activities')
      .select('*')
      .eq('character_id', characterId)
      .eq('week_start', weekStart.toISOString().split('T')[0])
      .single()
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error fetching weekly activity:', error)
      return NextResponse.json(
        { error: 'Failed to fetch weekly activity' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ 
      activity: activity || {
        week_start: weekStart.toISOString().split('T')[0],
        week_end: weekEnd.toISOString().split('T')[0],
        mythic_plus_runs: 0,
        highest_key_level: 0,
        total_keys_completed: 0,
        raid_bosses_killed: 0,
        vault_mythic_plus_tier: 0,
        vault_raid_tier: 0,
        vault_pvp_tier: 0
      }
    })
  } catch (error) {
    console.error('Get weekly activity error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Refresh weekly activity from Battle.net API
 * POST /api/member/characters/[characterId]/weekly-activity
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
    
    const { weekStart, weekEnd } = getCurrentWeekDates()
    
    // Fetch Mythic+ data
    const mythicData = await battleNetAPI.getCharacterMythicKeystoneProfile(
      accessToken,
      character.realm_slug,
      character.name
    )
    
    // Fetch raid data
    const raidData = await battleNetAPI.getCharacterRaidProgress(
      accessToken,
      character.realm_slug,
      character.name
    )
    
    // Process mythic+ data
    let mythicPlusRuns = 0
    let highestKeyLevel = 0
    let totalKeysCompleted = 0
    
    if (mythicData?.current_period?.best_runs) {
      mythicPlusRuns = mythicData.current_period.best_runs.length
      highestKeyLevel = Math.max(...mythicData.current_period.best_runs.map((r: any) => r.keystone_level))
      totalKeysCompleted = mythicPlusRuns
    }
    
    // Process raid data (get current tier kills this week)
    let raidBossesKilled = 0
    let raidDifficulty = null
    
    if (raidData?.expansions) {
      // Get the latest expansion and tier
      const latestExpansion = raidData.expansions[raidData.expansions.length - 1]
      if (latestExpansion?.instances) {
        const latestInstance = latestExpansion.instances[latestExpansion.instances.length - 1]
        
        // Count kills from all difficulties
        for (const mode of latestInstance.modes || []) {
          if (mode.progress?.completed_count) {
            raidBossesKilled = Math.max(raidBossesKilled, mode.progress.completed_count)
            raidDifficulty = mode.difficulty.type
          }
        }
      }
    }
    
    // Calculate Great Vault tiers (simplified)
    const vaultMythicPlusTier = Math.min(Math.floor(mythicPlusRuns / 4), 3)
    const vaultRaidTier = Math.min(Math.floor(raidBossesKilled / 3), 3)
    
    // Upsert weekly activity
    const { data: activity, error: activityError } = await supabase
      .from('weekly_activities')
      .upsert({
        character_id: characterId,
        week_start: weekStart.toISOString().split('T')[0],
        week_end: weekEnd.toISOString().split('T')[0],
        mythic_plus_runs: mythicPlusRuns,
        highest_key_level: highestKeyLevel,
        total_keys_completed: totalKeysCompleted,
        raid_bosses_killed: raidBossesKilled,
        raid_difficulty: raidDifficulty,
        vault_mythic_plus_tier: vaultMythicPlusTier,
        vault_raid_tier: vaultRaidTier,
        vault_pvp_tier: 0, // PvP data would require additional API calls
        raw_data: {
          mythic: mythicData,
          raid: raidData
        },
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'character_id,week_start'
      })
      .select()
      .single()
    
    if (activityError) {
      console.error('Error updating weekly activity:', activityError)
      return NextResponse.json(
        { error: 'Failed to update weekly activity' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      message: 'Weekly activity updated successfully',
      activity
    })
  } catch (error) {
    console.error('Weekly activity refresh error:', error)
    return NextResponse.json(
      { error: 'Failed to refresh weekly activity' },
      { status: 500 }
    )
  }
}

