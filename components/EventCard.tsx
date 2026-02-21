import { Event } from '@/lib/types'
import { CATEGORY_LABELS } from '@/lib/types'
import { format } from 'date-fns'


interface EventCardProps {
  event: Event
}


export default function EventCard({ event }: EventCardProps) {
  const startDate = new Date(event.start_time)
  const endDate = event.end_time ? new Date(event.end_time) : null


  return (
    <div className="space-y-2">
      <h3 className="text-xl font-bold text-ucla-blue">{event.title}</h3>
     
      <div className="space-y-1 text-sm">
        <div className="flex items-center gap-2">
          <span className="font-semibold">Date & Time:</span>
          <span>
            {format(startDate, 'PPP p')}
            {endDate && ` - ${format(endDate, 'p')}`}
          </span>
        </div>


        {event.location && (
          <div className="flex items-center gap-2">
            <span className="font-semibold">Location:</span>
            <span>{event.location}</span>
          </div>
        )}


        {event.organizer && (
          <div className="flex items-center gap-2">
            <span className="font-semibold">Organizer:</span>
            <span>{event.organizer}</span>
          </div>
        )}


        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold">Categories:</span>
          {event.categories.map((cat) => (
            <span
              key={cat}
              className="px-2 py-1 bg-ucla-gold text-ucla-blue rounded text-xs font-medium"
            >
              {CATEGORY_LABELS[cat]}
            </span>
          ))}
        </div>


        {event.description && (
          <div className="mt-2 pt-2 border-t">
            <p className="text-gray-700">{event.description}</p>
          </div>
        )}
      </div>
    </div>
  )
}



