export type EventCategory = 
  | 'academic'
  | 'athletic'
  | 'club'
  | 'social'
  | 'cultural'
  | 'arts'
  | 'volunteer'
  | 'other'

export interface Event {
  id: string
  title: string
  description: string | null
  start_time: string
  end_time: string | null
  categories: EventCategory[]
  location: string | null
  organizer: string | null
  created_at: string
  updated_at: string
}

export interface EventInput {
  title: string
  description?: string
  start_time: string
  end_time?: string
  categories: EventCategory[]
  location?: string
  organizer?: string
}

export interface ApiResponse<T> {
  data?: T
  error?: string
}

export const CATEGORIES: EventCategory[] = [
  'academic',
  'athletic',
  'club',
  'social',
  'cultural',
  'arts',
  'volunteer',
  'other',
]

export const CATEGORY_LABELS: Record<EventCategory, string> = {
  academic: 'Academic',
  athletic: 'Athletic',
  club: 'Club',
  social: 'Social',
  cultural: 'Cultural',
  arts: 'Arts',
  volunteer: 'Volunteer',
  other: 'Other',
}
