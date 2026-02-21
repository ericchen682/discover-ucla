'use client'


import { Calendar as BigCalendar, dateFnsLocalizer, View } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { enUS } from 'date-fns/locale'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { Event } from '@/lib/types'
import { useState } from 'react'
import EventCard from './EventCard'


const locales = {
  'en-US': enUS,
}


const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})


interface CalendarProps {
  events: Event[]
}


export default function Calendar({ events }: CalendarProps) {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [view, setView] = useState<View>('week')
  const [date, setDate] = useState(new Date())


  // Transform events to react-big-calendar format
  const calendarEvents = events.map((event) => ({
    id: event.id,
    title: event.title,
    start: new Date(event.start_time),
    end: event.end_time ? new Date(event.end_time) : new Date(event.start_time),
    resource: event,
  }))


  const handleSelectEvent = (event: any) => {
    setSelectedEvent(event.resource)
  }

  return (
    <div className="calendar-light flex flex-col flex-1 min-h-0">
      <div className="flex-1 relative min-h-0">
        <BigCalendar
          localizer={localizer}
          events={calendarEvents}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          view={view}
          onView={setView}
          date={date}
          onNavigate={setDate}
          onSelectEvent={handleSelectEvent}
          popup
          dayLayoutAlgorithm="no-overlap"
          eventPropGetter={() => ({ style: { minHeight: '24px' } })}
          scrollToTime={new Date()}
          enableAutoScroll={true}
        />
      </div>
      {selectedEvent && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <EventCard event={selectedEvent} />
            <button
              onClick={() => setSelectedEvent(null)}
              className="mt-4 w-full bg-ucla-blue text-white py-2 px-4 rounded hover:bg-blue-700 text-sm sm:text-base"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}



