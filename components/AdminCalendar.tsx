'use client'

import { useState } from 'react'
import { Calendar as BigCalendar, dateFnsLocalizer, View } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { enUS } from 'date-fns/locale'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { Event } from '@/lib/types'
import { eventToCalendarSegments } from '@/lib/dates'
import EventCard from './EventCard'
import AdminForm from './AdminForm'

const locales = { 'en-US': enUS }
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

interface AdminCalendarProps {
  events: Event[]
  password: string
  onEventsChange: () => void
}

export default function AdminCalendar({ events, password, onEventsChange }: AdminCalendarProps) {
  const [view, setView] = useState<View>('week')
  const [date, setDate] = useState(new Date())
  const [createSlot, setCreateSlot] = useState<{ start: Date; end: Date } | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [showEditForm, setShowEditForm] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const calendarEvents = events.flatMap((e) =>
    eventToCalendarSegments(
      {
        id: e.id,
        title: e.title,
        start_time: e.start_time,
        end_time: e.end_time ?? null,
      },
      e
    )
  )

  const handleSelectSlot = (slot: { start: Date; end: Date }) => {
    setSelectedEvent(null)
    setShowEditForm(false)
    setCreateSlot(slot)
  }

  const handleSelectEvent = (event: { resource: Event }) => {
    setCreateSlot(null)
    setSelectedEvent(event.resource)
    setShowEditForm(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this event? This cannot be undone.')) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/admin/events/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${password}` },
      })
      if (!res.ok) throw new Error('Failed to delete')
      setSelectedEvent(null)
      setShowEditForm(false)
      onEventsChange()
    } catch {
      alert('Failed to delete event')
    } finally {
      setDeletingId(null)
    }
  }

  const closeModals = () => {
    setCreateSlot(null)
    setSelectedEvent(null)
    setShowEditForm(false)
  }

  return (
    <div className="calendar-light flex flex-col rounded-lg border border-gray-200 bg-white overflow-hidden">
      <div className="flex-1 min-h-[400px]">
        <BigCalendar
          localizer={localizer}
          events={calendarEvents}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%', minHeight: 400 }}
          view={view}
          onView={setView}
          date={date}
          onNavigate={setDate}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          selectable
          popup
          dayLayoutAlgorithm="no-overlap"
          eventPropGetter={() => ({ style: { minHeight: '24px' } })}
          scrollToTime={new Date()}
          enableAutoScroll={true}
        />
      </div>

      {/* Create event modal (clicked a time slot) */}
      {createSlot && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-white">
              <h3 className="text-lg font-semibold text-gray-900">New Event</h3>
              <button
                type="button"
                onClick={closeModals}
                className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
                aria-label="Close"
              >
                &times;
              </button>
            </div>
            <div className="p-4">
              <AdminForm
                password={password}
                onSuccess={() => {
                  closeModals()
                  onEventsChange()
                }}
                initialStart={createSlot.start}
                initialEnd={createSlot.end}
              />
            </div>
          </div>
        </div>
      )}

      {/* View / Edit event modal (clicked an event) */}
      {selectedEvent && !createSlot && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-white">
              <h3 className="text-lg font-semibold text-gray-900">
                {showEditForm ? 'Edit Event' : selectedEvent.title}
              </h3>
              <button
                type="button"
                onClick={closeModals}
                className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
                aria-label="Close"
              >
                &times;
              </button>
            </div>
            <div className="p-4">
              {showEditForm ? (
                <AdminForm
                  password={password}
                  event={selectedEvent}
                  onSuccess={() => {
                    closeModals()
                    onEventsChange()
                  }}
                />
              ) : (
                <>
                  <EventCard event={selectedEvent} />
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setShowEditForm(true)}
                      className="px-4 py-2 bg-ucla-blue text-white rounded-md hover:bg-blue-700 text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(selectedEvent.id)}
                      disabled={deletingId === selectedEvent.id}
                      className="px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-md hover:bg-red-100 text-sm font-medium disabled:opacity-50"
                    >
                      {deletingId === selectedEvent.id ? 'Deleting...' : 'Delete'}
                    </button>
                    <button
                      type="button"
                      onClick={closeModals}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm font-medium"
                    >
                      Close
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
