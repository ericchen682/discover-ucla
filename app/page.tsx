'use client'

import { useEffect, useState } from 'react'
import Calendar from '@/components/Calendar'
import FilterBar from '@/components/FilterBar'
import { Event, EventCategory } from '@/lib/types'

export default function Home() {
  const [events, setEvents] = useState<Event[]>([])
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [selectedCategories, setSelectedCategories] = useState<EventCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchEvents()
  }, [])

  useEffect(() => {
    if (selectedCategories.length === 0) {
      setFilteredEvents(events)
    } else {
      setFilteredEvents(
        events.filter((event) =>
          event.categories.some((c) => selectedCategories.includes(c))
        )
      )
    }
  }, [events, selectedCategories])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/events')
      // #region agent log
      const text = await response.text()
      fetch('http://127.0.0.1:7801/ingest/47e05ab7-47a2-4ca5-b184-af67d09df1bd',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'e5e472'},body:JSON.stringify({sessionId:'e5e472',location:'app/page.tsx:fetchEvents',message:'GET /api/events response',data:{status:response.status,ok:response.ok,bodyLength:text.length,bodyPreview:text.slice(0,200)},timestamp:Date.now(),hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      const data = text ? JSON.parse(text) : {}

      if (data.error) {
        throw new Error(data.error)
      }

      setEvents(data.data || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load events')
      console.error('Error fetching events:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryToggle = (category: EventCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    )
  }

  const handleClearFilters = () => {
    setSelectedCategories([])
  }

  return (
    <main className="h-screen flex flex-col overflow-hidden bg-gray-50">
      <header className="flex-shrink-0 bg-ucla-blue text-white py-3 shadow-md">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold">Discover UCLA</h1>
        </div>
      </header>

      <div className="container mx-auto flex-1 min-h-0 flex flex-col overflow-hidden px-4 py-4">
        {loading ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="text-lg text-gray-600">Loading events...</div>
          </div>
        ) : error ? (
          <div className="flex-shrink-0 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        ) : (
          <>
            <FilterBar
              selectedCategories={selectedCategories}
              onCategoryToggle={handleCategoryToggle}
              onClearFilters={handleClearFilters}
            />
            <div className="flex-1 min-h-0 overflow-hidden bg-white rounded-lg shadow-md flex flex-col">
              <Calendar events={filteredEvents} />
            </div>
          </>
        )}
      </div>
    </main>
  )
}
