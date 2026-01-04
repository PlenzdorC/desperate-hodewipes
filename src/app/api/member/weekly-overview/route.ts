import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const runtime = 'nodejs'

/**
 * Get the current week start date (Tuesday reset)
 */
function getCurrentWeekStart(): string {
  const now = new Date()
  const dayOfWeek = now.getDay()
  const daysFromTuesday = (dayOfWeek + 5) % 7
  
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - daysFromTuesday)
  weekStart.setHours(0, 0, 0, 0)
  
  return weekStart.toISOString().split('T')[0]
}

/**
 * Get weekly activity overview for all guild members
 * GET /api/member/weekly-overview
 */
export async function GET(request: NextRequest) {
  try {
    const weekStart = getCurrentWeekStart()
    
    // Get all characters with their weekly activities
    const { data: activities, error } = await supabase
      .from('weekly_activities')
      .select(`
        *,
        character:user_characters (
          id,
          name,
          realm,
          character_class,
          active_spec,
          level,
          equipped_item_level,
          avatar_url,
          is_main,
          user:battle_net_users (
            battletag
          )
        )
      `)
      .eq('week_start', weekStart)
      .order('mythic_plus_runs', { ascending: false })
    
    if (error) {
      console.error('Error fetching weekly overview:', error)
      return NextResponse.json(
        { error: 'Failed to fetch weekly overview' },
        { status: 500 }
      )
    }
    
    // Filter to only main characters for cleaner display
    const mainCharacterActivities = activities?.filter((a: any) => a.character?.is_main) || []
    
    return NextResponse.json({
      weekStart,
      activities: mainCharacterActivities,
      totalActivities: activities?.length || 0
    })
  } catch (error) {
    console.error('Weekly overview error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

