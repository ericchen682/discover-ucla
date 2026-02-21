'use client'


import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminForm from '@/components/AdminForm'
import { Event } from '@/lib/types'
import { format } from 'date-fns'
import { CATEGORY_LABELS } from '@/lib/types'


export default function AdminPage() {
  const [password, setPassword] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [events, setEvents] = useState<Event[]>([])
  const [loadingEvents, setLoadingEvents] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const router = useRouter()

  const fetchEvents = async () => {
    setLoadingEvents(true)
    try {
      const res = await fetch('/api/events')
      const json = await res.json()
      if (json.data) setEvents(json.data)
      else setEvents([])
    } catch {
      setEvents([])
    } finally {
      setLoadingEvents(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated) fetchEvents()
  }, [isAuthenticated])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this event? This cannot be undone.')) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/admin/events/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${password}` },
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        alert(data.error || 'Failed to delete event')
        return
      }
      setEvents((prev) => prev.filter((e) => e.id !== id))
    } catch {
      alert('Failed to delete event')
    } finally {
      setDeletingId(null)
    }
  }


  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would be more secure
    // For MVP, we'll use a simple password check
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD
    if (password === adminPassword) {
      setIsAuthenticated(true)
    } else {
      alert('Incorrect password')
      setPassword('')
    }
  }


  const handleSuccess = () => {
    // Optionally redirect or refresh
    router.refresh()
  }


  if (!isAuthenticated) {
    return (
      <main className="admin-light min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h1 className="text-2xl font-bold text-ucla-blue mb-4">Admin Login</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ucla-blue"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-ucla-blue text-white py-2 px-4 rounded-md hover:bg-blue-700"
            >
              Login
            </button>
          </form>
        </div>
      </main>
    )
  }


  return (
    <main className="admin-light min-h-screen bg-gray-50">
      <header className="bg-ucla-blue text-white py-6 shadow-md">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-blue-100 mt-1">Add and manage calendar events</p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-10">
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Upcoming Events</h2>
          {loadingEvents ? (
            <p className="text-gray-500">Loading events...</p>
          ) : events.length === 0 ? (
            <p className="text-gray-500">No upcoming events.</p>
          ) : (
            <ul className="bg-white rounded-lg shadow border border-gray-200 divide-y divide-gray-200">
              {events.map((event) => (
                <li
                  key={event.id}
                  className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-gray-50"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 truncate">{event.title}</p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(event.start_time), 'PPp')}
                      {event.categories?.length ? ` · ${event.categories.map((c) => CATEGORY_LABELS[c]).join(', ')}` : ''}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(event.id)}
                    disabled={deletingId === event.id}
                    className="flex-shrink-0 px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deletingId === event.id ? 'Deleting...' : 'Delete'}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Add New Event</h2>
          <AdminForm password={password} onSuccess={() => { handleSuccess(); fetchEvents(); }} />
        </section>
      </div>
    </main>
  )
}



