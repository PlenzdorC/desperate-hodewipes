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

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status, notes } = body

    if (!id || !status) {
      return NextResponse.json(
        { error: 'Application ID and status are required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('applications')
      .update({
        status,
        notes: notes || null,
        reviewed_at: new Date().toISOString(),
        reviewed_by: 'admin' // In a real app, get from JWT token
      })
      .eq('id', id)
      .select()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to update application' },
        { status: 500 }
      )
    }

    // Log activity
    await supabase
      .from('activity_log')
      .insert({
        action: 'application_reviewed',
        description: `Application status changed to: ${status}`,
        user: 'admin'
      })

    return NextResponse.json(
      { message: 'Application updated successfully', data },
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

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { id } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Application ID is required' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('applications')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to delete application' },
        { status: 500 }
      )
    }

    // Log activity
    await supabase
      .from('activity_log')
      .insert({
        action: 'application_deleted',
        description: 'Application deleted',
        user: 'admin'
      })

    return NextResponse.json(
      { message: 'Application deleted successfully' },
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
