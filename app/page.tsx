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
        events.filter((event) => selectedCategories.includes(event.category))
      )
    }
  }, [events, selectedCategories])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/events')
      const data = await response.json()

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
    <main className="min-h-screen bg-gray-50">
      <header className="bg-ucla-blue text-white py-6 shadow-md">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">Discover UCLA</h1>
          <p className="text-blue-100 mt-1">Events Calendar</p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-gray-600">Loading events...</div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        ) : (
          <>
            <FilterBar
              selectedCategories={selectedCategories}
              onCategoryToggle={handleCategoryToggle}
              onClearFilters={handleClearFilters}
            />
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <Calendar events={filteredEvents} />
            </div>
          </>
        )}
      </div>
    </main>
  )
}
