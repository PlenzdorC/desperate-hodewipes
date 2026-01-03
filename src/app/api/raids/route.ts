import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const runtime = 'nodejs'

export async function GET() {
  try {
    // Get raids with their bosses
    const { data: raids, error: raidsError } = await supabase
      .from('raids')
      .select(`
        *,
        bosses (*)
      `)
      .order('created_at', { ascending: false })

    if (raidsError) {
      console.error('Supabase error:', raidsError)
      return NextResponse.json(
        { error: 'Failed to fetch raids' },
        { status: 500 }
      )
    }

    // Sort bosses by position
    const raidsWithSortedBosses = raids?.map(raid => ({
      ...raid,
      bosses: raid.bosses?.sort((a: any, b: any) => a.position - b.position) || []
    }))

    return NextResponse.json({ raids: raidsWithSortedBosses })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
