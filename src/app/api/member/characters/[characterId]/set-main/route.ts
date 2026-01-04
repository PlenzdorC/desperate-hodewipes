import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { supabase } from '@/lib/supabase'

export const runtime = 'nodejs'

/**
 * Set a character as main character
 * POST /api/member/characters/[characterId]/set-main
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
    
    // Verify character belongs to user
    const { data: character, error: charError } = await supabase
      .from('user_characters')
      .select('*')
      .eq('id', characterId)
      .eq('user_id', decoded.userId)
      .single()
    
    if (charError || !character) {
      return NextResponse.json({ error: 'Character not found' }, { status: 404 })
    }
    
    // Unset all other characters as main
    await supabase
      .from('user_characters')
      .update({ is_main: false })
      .eq('user_id', decoded.userId)
    
    // Set this character as main
    const { data: updatedChar, error: updateError } = await supabase
      .from('user_characters')
      .update({ is_main: true, updated_at: new Date().toISOString() })
      .eq('id', characterId)
      .select()
      .single()
    
    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to set main character' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      message: 'Main character set successfully',
      character: updatedChar
    })
  } catch (error) {
    console.error('Set main character error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

