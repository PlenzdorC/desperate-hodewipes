import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      charName,
      charClass,
      charSpec,
      ilvl,
      rio,
      experience,
      motivation,
      availability,
      discord
    } = body

    // Validate required fields
    if (!charName || !charClass || !charSpec || !ilvl || !experience || !motivation || !discord) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Convert availability array to string
    const availabilityString = Array.isArray(availability) 
      ? availability.join(',') 
      : availability

    // Insert application into Supabase
    const { data, error } = await supabase
      .from('applications')
      .insert({
        character_name: charName,
        character_class: charClass,
        specialization: charSpec,
        item_level: parseInt(ilvl),
        raiderio_score: rio ? parseInt(rio) : null,
        experience,
        motivation,
        availability: availabilityString,
        discord_name: discord,
        status: 'pending'
      })
      .select()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to submit application' },
        { status: 500 }
      )
    }

    // Log activity
    await supabase
      .from('activity_log')
      .insert({
        action: 'application_submitted',
        description: `New application from: ${charName}`,
        user: null
      })

    return NextResponse.json(
      { message: 'Application submitted successfully', data },
      { status: 201 }
    )

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch applications' },
        { status: 500 }
      )
    }

    return NextResponse.json({ applications: data })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
