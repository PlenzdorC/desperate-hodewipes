import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const runtime = 'nodejs'

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status, progress_percentage, kill_date } = body

    if (!id || !status) {
      return NextResponse.json(
        { error: 'Boss ID and status are required' },
        { status: 400 }
      )
    }

    // Prepare update data
    const updateData: any = {
      status,
      progress_percentage: status === 'killed' ? 100 : (progress_percentage || 0)
    }

    // Set kill_date based on status
    if (status === 'killed') {
      updateData.kill_date = kill_date || new Date().toISOString().split('T')[0]
    } else {
      updateData.kill_date = null
    }

    const { data, error } = await supabase
      .from('bosses')
      .update(updateData)
      .eq('id', id)
      .select()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to update boss' },
        { status: 500 }
      )
    }

    // Get boss name for logging
    const boss = data?.[0]
    if (boss) {
      await supabase
        .from('activity_log')
        .insert({
          action: 'boss_updated',
          description: `Boss status updated: ${boss.name} - ${status}`,
          user: 'admin'
        })
    }

    return NextResponse.json(
      { message: 'Boss updated successfully', data },
      { status: 200 }
    )

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
