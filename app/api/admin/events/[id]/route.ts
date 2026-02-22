import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { EventInput } from '@/lib/types'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD

function verifyAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  if (!authHeader) return false
  const token = authHeader.replace('Bearer ', '')
  return token === ADMIN_PASSWORD
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!verifyAuth(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    if (!id) {
      return NextResponse.json({ error: 'Event ID required' }, { status: 400 })
    }

    const supabase = createServerClient()
    const { error } = await supabase.from('events').delete().eq('id', id)

    if (error) {
      console.error('Error deleting event:', error)
      return NextResponse.json(
        { error: 'Failed to delete event' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!verifyAuth(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    if (!id) {
      return NextResponse.json({ error: 'Event ID required' }, { status: 400 })
    }

    const body: EventInput = await request.json()
    if (!body.title || !body.start_time) {
      return NextResponse.json(
        { error: 'Missing required fields: title, start_time' },
        { status: 400 }
      )
    }
    if (!Array.isArray(body.categories) || body.categories.length === 0) {
      return NextResponse.json(
        { error: 'categories must be a non-empty array' },
        { status: 400 }
      )
    }

    const startTime = new Date(body.start_time)
    if (isNaN(startTime.getTime())) {
      return NextResponse.json(
        { error: 'Invalid start_time format' },
        { status: 400 }
      )
    }
    if (body.end_time) {
      const endTime = new Date(body.end_time)
      if (isNaN(endTime.getTime()) || endTime < startTime) {
        return NextResponse.json(
          { error: 'Invalid or earlier end_time' },
          { status: 400 }
        )
      }
    }

    const supabase = createServerClient()
    const { error: updateError } = await supabase
      .from('events')
      .update({
        title: body.title,
        description: body.description ?? null,
        start_time: body.start_time,
        end_time: body.end_time ?? null,
        location: body.location ?? null,
        organizer: body.organizer ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (updateError) {
      console.error('Error updating event:', updateError)
      return NextResponse.json(
        { error: 'Failed to update event' },
        { status: 500 }
      )
    }

    await supabase.from('event_categories').delete().eq('event_id', id)
    const { error: catError } = await supabase
      .from('event_categories')
      .insert(
        body.categories.map((category) => ({ event_id: id, category }))
      )

    if (catError) {
      console.error('Error updating categories:', catError)
      return NextResponse.json(
        { error: 'Failed to update event categories' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
