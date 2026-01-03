import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const runtime = 'nodejs'

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()

    // Update each setting individually
    for (const [key, value] of Object.entries(body)) {
      const { error } = await supabase
        .from('guild_settings')
        .upsert({
          setting_key: key,
          setting_value: value as string,
          updated_at: new Date().toISOString()
        })

      if (error) {
        console.error('Supabase error updating setting:', key, error)
        return NextResponse.json(
          { error: `Failed to update setting: ${key}` },
          { status: 500 }
        )
      }
    }

    // Log activity
    await supabase
      .from('activity_log')
      .insert({
        action: 'settings_updated',
        description: 'Guild settings updated',
        user: 'admin'
      })

    return NextResponse.json(
      { message: 'Settings updated successfully' },
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
