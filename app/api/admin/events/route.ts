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
    if (!body.title || !body.start_time || !body.category) {
      return NextResponse.json(
        { error: 'Missing required fields: title, start_time, category' },
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


    const { data, error } = await supabase
      .from('events')
      .insert([
        {
          title: body.title,
          description: body.description || null,
          start_time: body.start_time,
          end_time: body.end_time || null,
          category: body.category,
          location: body.location || null,
          organizer: body.organizer || null,
        },
      ])
      .select()
      .single()


    if (error) {
      console.error('Error creating event:', error)
      return NextResponse.json(
        { error: 'Failed to create event' },
        { status: 500 }
      )
    }


    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}



