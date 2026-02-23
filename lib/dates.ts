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

/** Round "HH:mm" to nearest 15 minutes (e.g. "18:32" -> "18:30") */
export function roundTimeTo15Min(time: string): string {
  const [h, m] = time.split(':').map(Number)
  const totalMins = h * 60 + (m ?? 0)
  const rounded = Math.round(totalMins / 15) * 15
  const rh = Math.floor(rounded / 60) % 24
  const rm = rounded % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(rh)}:${pad(rm)}`
}

/** All 15-minute time options in a day ("00:00" through "23:45") */
export const TIME_OPTIONS_15: string[] = (() => {
  const out: string[] = []
  for (let h = 0; h < 24; h++)
    for (let m = 0; m < 60; m += 15)
      out.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
  return out
})()

/** Nearest 15-minute option for scroll/highlight when value is not in the dropdown (e.g. "06:20" -> "06:15") */
export function getNearest15Min(time: string): string {
  return roundTimeTo15Min(time)
}

/** Format "HH:mm" for dropdown label (e.g. "18:30" -> "6:30 PM") */
export function formatTimeOptionLabel(time: string): string {
  const d = new Date(`2000-01-01T${time}`)
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })
}

/**
 * Parse a typed time string to "HH:mm" (24h). Returns null if invalid.
 * Accepts e.g. "6:30 pm", "18:30", "6:30", "630", "9am".
 */
export function parseTimeInput(text: string): string | null {
  const t = text.trim().toLowerCase()
  if (!t) return null
  const am = /\bam\b/.test(t) || /^(\d{1,2})\s*am\b/.test(t)
  const pm = /\bpm\b/.test(t) || /^(\d{1,2})\s*pm\b/.test(t)
  const withColon = /^(\d{1,2}):(\d{2})\s*(am|pm)?$/i.exec(t) || /^(\d{1,2}):(\d{2})$/.exec(t)
  const noColon = /^(\d{1,2})\s*(am|pm)?$/i.exec(t) || /^(\d{2,4})$/.exec(t)
  let hour: number
  let minute: number
  if (withColon) {
    hour = parseInt(withColon[1], 10)
    minute = parseInt(withColon[2], 10) || 0
    if (pm && hour < 12) hour += 12
    if (am && hour === 12) hour = 0
  } else if (noColon) {
    const v = noColon[1]
    if (v.length <= 2) {
      hour = parseInt(v, 10)
      minute = 0
    } else {
      hour = parseInt(v.slice(0, -2), 10)
      minute = parseInt(v.slice(-2), 10) || 0
    }
    if (pm && hour < 12) hour += 12
    if (am && hour === 12) hour = 0
  } else return null
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(hour)}:${pad(minute)}`
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

export interface CalendarSegment<TResource = unknown> {
  id: string
  title: string
  start: Date
  end: Date
  resource: TResource
}

/** Minimal event shape needed for segment splitting */
export type EventSegmentInput = {
  id: string
  title: string
  start_time: string
  end_time: string | null
}

/** Expand an event into 1 or 2 calendar segments so overnight events show on both days */
export function eventToCalendarSegments<TResource>(
  event: EventSegmentInput,
  resource: TResource
): CalendarSegment<TResource>[] {
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
