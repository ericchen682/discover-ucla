import { format, startOfDay, endOfDay } from 'date-fns'

/** Format an ISO date string for datetime-local input (local time) */
export function toDatetimeLocal(iso: string): string {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** Format a Date for datetime-local input (local time) */
export function dateToDatetimeLocal(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** True if end is on a later calendar day than start (e.g. 11pm–1am) */
export function isOvernightEvent(start: Date, end: Date): boolean {
  const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime()
  const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime()
  return endDay > startDay
}

/** Format event time range; shows both dates when event spans midnight */
export function formatEventTimeRange(start: Date, end: Date | null): string {
  if (!end) return format(start, 'PPP p')
  if (!isOvernightEvent(start, end)) {
    return `${format(start, 'PPP p')} – ${format(end, 'p')}`
  }
  return `${format(start, 'PPP p')} – ${format(end, 'PPP p')}`
}

export interface CalendarSegment {
  id: string
  title: string
  start: Date
  end: Date
  resource: unknown
}

/** Expand an event into 1 or 2 calendar segments so overnight events show on both days */
export function eventToCalendarSegments<T extends { id: string; title: string; start_time: string; end_time: string | null }>(
  event: T,
  resource: T
): CalendarSegment[] {
  const start = new Date(event.start_time)
  const end = event.end_time ? new Date(event.end_time) : new Date(event.start_time)
  if (end <= start) {
    return [{ id: event.id, title: event.title, start, end, resource }]
  }
  if (!isOvernightEvent(start, end)) {
    return [{ id: event.id, title: event.title, start, end, resource }]
  }
  const endOfStartDay = endOfDay(start)
  const startOfEndDay = startOfDay(end)
  return [
    { id: `${event.id}-0`, title: event.title, start, end: endOfStartDay, resource },
    { id: `${event.id}-1`, title: `${event.title} (cont.)`, start: startOfEndDay, end, resource },
  ]
}
