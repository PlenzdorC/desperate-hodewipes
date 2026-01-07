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

    console.log('Weekly activity:', activity)
    console.log('Week start:', weekStart.toISOString().split('T')[0])
    console.log('Week end:', weekEnd.toISOString().split('T')[0])
    
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
    
    // Fetch all data in parallel for better performance
    const [mythicData, raidData, pvpSummary] = await Promise.all([
      battleNetAPI.getCharacterMythicKeystoneProfile(
        accessToken,
        character.realm_slug,
        character.name
      ),
      battleNetAPI.getCharacterRaidProgress(
        accessToken,
        character.realm_slug,
        character.name
      ),
      battleNetAPI.getCharacterPvPSummary(
        accessToken,
        character.realm_slug,
        character.name
      )
    ])
    
    // Debug logging
    console.log(`[Weekly Activity] Character: ${character.name}`)
    console.log(`[Weekly Activity] M+ Data:`, mythicData?.current_period ? 'Found' : 'Not found')
    if (mythicData?.current_period?.best_runs) {
      console.log(`[Weekly Activity] M+ Runs: ${mythicData.current_period.best_runs.length}`)
    }
    console.log(`[Weekly Activity] Raid Data:`, raidData?.expansions ? 'Found' : 'Not found')
    if (raidData?.expansions) {
      console.log(`[Weekly Activity] Raid Expansions: ${raidData.expansions.length}`)
      const latest = raidData.expansions[raidData.expansions.length - 1]
      if (latest?.instances) {
        console.log(`[Weekly Activity] Latest Instance:`, latest.instances[latest.instances.length - 1]?.instance?.name)
      }
    }
    console.log(`[Weekly Activity] PvP Data:`, pvpSummary ? 'Found' : 'Not found')
    
    // Process mythic+ data
    let mythicPlusRuns = 0
    let highestKeyLevel = 0
    let totalKeysCompleted = 0
    
    if (mythicData?.current_period?.best_runs) {
      mythicPlusRuns = mythicData.current_period.best_runs.length
      highestKeyLevel = Math.max(...mythicData.current_period.best_runs.map((r: any) => r.keystone_level), 0)
      totalKeysCompleted = mythicPlusRuns
    }
    
    // Process raid data (get current tier kills)
    let raidBossesKilled = 0
    let raidDifficulty: string | null = null
    
    if (raidData?.expansions && raidData.expansions.length > 0) {
      // Get the latest expansion
      const latestExpansion = raidData.expansions[raidData.expansions.length - 1]
      
      if (latestExpansion?.instances && latestExpansion.instances.length > 0) {
        // Get the latest raid instance (current tier)
        const latestInstance = latestExpansion.instances[latestExpansion.instances.length - 1]
        
        console.log(`[Weekly Activity] Processing raid: ${latestInstance.instance?.name || 'Unknown'}`)
        
        // Check all difficulties and get the highest count
        if (latestInstance.modes && Array.isArray(latestInstance.modes)) {
          console.log(`[Weekly Activity] Found ${latestInstance.modes.length} difficulty modes`)
          
          for (const mode of latestInstance.modes) {
            const count = mode.progress?.completed_count || 0
            const diffName = mode.difficulty?.name || mode.difficulty?.type || 'Unknown'
            
            console.log(`[Weekly Activity] ${diffName}: ${count} bosses killed`)
            
            if (count > 0 && count > raidBossesKilled) {
              raidBossesKilled = count
              raidDifficulty = diffName
            }
          }
        } else {
          console.log(`[Weekly Activity] No modes found for latest instance`)
        }
      } else {
        console.log(`[Weekly Activity] No instances found in latest expansion`)
      }
    } else {
      console.log(`[Weekly Activity] No expansion data found`)
    }
    
    // Calculate Great Vault tiers (WoW actual system)
    // M+: 1 run = tier 1, 4 runs = tier 2, 8 runs = tier 3
    let vaultMythicPlusTier = 0
    if (mythicPlusRuns >= 8) {
      vaultMythicPlusTier = 3
    } else if (mythicPlusRuns >= 4) {
      vaultMythicPlusTier = 2
    } else if (mythicPlusRuns >= 1) {
      vaultMythicPlusTier = 1
    }
    
    // Raid: 3 bosses = tier 1, 6 bosses = tier 2, 9 bosses = tier 3
    let vaultRaidTier = 0
    if (raidBossesKilled >= 9) {
      vaultRaidTier = 3
    } else if (raidBossesKilled >= 6) {
      vaultRaidTier = 2
    } else if (raidBossesKilled >= 3) {
      vaultRaidTier = 1
    }
    
    // PvP: Calculate vault tier based on rated wins (approximation)
    // Note: API doesn't provide "this week" data, so we use season stats as estimate
    let vaultPvpTier = 0
    let totalPvpWins = 0
    
    if (pvpSummary?.honor_level) {
      // Check for rated PvP activity in any bracket
      const brackets = ['2v2', '3v3', 'rbg']
      for (const bracket of brackets) {
        const bracketData = pvpSummary[`pvp_bracket_${bracket}`]
        if (bracketData?.season_match_statistics?.won) {
          totalPvpWins += bracketData.season_match_statistics.won
        }
      }
      
      // Estimate weekly wins (this is a rough approximation)
      // For actual weekly data, you'd need to store previous week's data and compare
      // For now, we'll just check if there's any recent activity
      if (totalPvpWins > 0) {
        // Simplified: If they have PvP wins, assume some weekly activity
        // Real vault: 3 wins = tier 1, 6 wins = tier 2, 9 wins = tier 3
        // We can't accurately calculate this without historical data
        vaultPvpTier = 0 // Set to 0 until we have weekly tracking
      }
    }
    
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
        vault_pvp_tier: vaultPvpTier,
        raw_data: {
          mythic: mythicData,
          raid: raidData,
          pvp: pvpSummary
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

