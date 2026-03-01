import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { Event, EventCategory } from '@/lib/types'

interface EventRow {
  id: string
  title: string
  description: string | null
  start_time: string
  end_time: string | null
  location: string | null
  organizer: string | null
  created_at: string
  updated_at: string
  event_categories?: { category: string }[]
}

function toEvent(row: EventRow): Event {
  const categories = (row.event_categories ?? []).map((r) => r.category as EventCategory)
  const { event_categories: _, ...rest } = row
  return { ...rest, categories }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const categoriesParam = searchParams.get('categories')
    const filterCategories: EventCategory[] = categoriesParam
      ? (categoriesParam.split(',') as EventCategory[]).filter(Boolean)
      : []

    const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

    const { data: rows, error } = await supabase
      .from('events')
      .select('*, event_categories(category)')
      .gte('start_time', cutoff)
      .order('start_time', { ascending: true })

    if (error) {
      console.error('Error fetching events:', error)
      return NextResponse.json(
        { error: 'Failed to fetch events' },
        { status: 500 }
      )
    }

    let events: Event[] = (rows ?? []).map(toEvent)

    if (filterCategories.length > 0) {
      events = events.filter((event) =>
        event.categories.some((c) => filterCategories.includes(c))
      )
    }

    return NextResponse.json({ data: events })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
