import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { EventInput } from '@/lib/types'


// Simple password-based authentication for MVP
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD


function verifyAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  if (!authHeader) return false
 
  const token = authHeader.replace('Bearer ', '')
  return token === ADMIN_PASSWORD
}


export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    if (!verifyAuth(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }


    const body: EventInput = await request.json()


    // Validate required fields
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


    // Validate date format
    const startTime = new Date(body.start_time)
    if (isNaN(startTime.getTime())) {
      return NextResponse.json(
        { error: 'Invalid start_time format' },
        { status: 400 }
      )
    }


    if (body.end_time) {
      const endTime = new Date(body.end_time)
      if (isNaN(endTime.getTime())) {
        return NextResponse.json(
          { error: 'Invalid end_time format' },
          { status: 400 }
        )
      }
      if (endTime < startTime) {
        return NextResponse.json(
          { error: 'end_time must be after start_time' },
          { status: 400 }
        )
      }
    }


    const supabase = createServerClient()


    const { data: event, error: eventError } = await supabase
      .from('events')
      .insert([
        {
          title: body.title,
          description: body.description || null,
          start_time: body.start_time,
          end_time: body.end_time || null,
          location: body.location || null,
          organizer: body.organizer || null,
        },
      ])
      .select()
      .single()

    if (eventError || !event) {
      console.error('Error creating event:', eventError)
      return NextResponse.json(
        { error: 'Failed to create event' },
        { status: 500 }
      )
    }

    const { error: categoriesError } = await supabase
      .from('event_categories')
      .insert(
        body.categories.map((category) => ({
          event_id: event.id,
          category,
        }))
      )

    if (categoriesError) {
      console.error('Error linking categories:', categoriesError)
      return NextResponse.json(
        { error: 'Failed to save event categories' },
        { status: 500 }
      )
    }

    const data = { ...event, categories: body.categories }
    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}



