import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('guild_settings')
      .select('*')

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch settings' },
        { status: 500 }
      )
    }

    // Convert array to object
    const settings: Record<string, string> = {}
    data?.forEach(setting => {
      settings[setting.setting_key] = setting.setting_value || ''
    })

    return NextResponse.json({ settings })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
