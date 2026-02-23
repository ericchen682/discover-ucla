'use client'


import { useState, useEffect } from 'react'
import { EventInput, EventCategory, CATEGORIES, CATEGORY_LABELS, Event } from '@/lib/types'
import { toDatetimeLocal, dateToDatetimeLocal } from '@/lib/dates'
import TimePicker from '@/components/TimePicker'


interface AdminFormProps {
  password: string
  onSuccess: () => void
  /** When set, form is prefilled and submit does PATCH (edit mode) */
  event?: Event | null
  /** Optional initial start/end for create (e.g. from calendar slot); overridden by event */
  initialStart?: Date
  initialEnd?: Date
}


const defaultFormData: EventInput = {
  title: '',
  description: '',
  start_time: '',
  end_time: '',
  categories: ['other'],
  location: '',
  organizer: '',
}

export default function AdminForm({ password, onSuccess, event, initialStart, initialEnd }: AdminFormProps) {
  const [formData, setFormData] = useState<EventInput>(defaultFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (event) {
      const start = toDatetimeLocal(event.start_time)
      const end = event.end_time ? toDatetimeLocal(event.end_time) : ''
      setFormData({
        title: event.title,
        description: event.description ?? '',
        start_time: start || '',
        end_time: end || '',
        categories: event.categories?.length ? event.categories : ['other'],
        location: event.location ?? '',
        organizer: event.organizer ?? '',
      })
    } else if (initialStart) {
      const start = dateToDatetimeLocal(initialStart)
      const end = initialEnd ? dateToDatetimeLocal(initialEnd) : ''
      setFormData((prev) => ({
        ...prev,
        start_time: start,
        end_time: end || '',
      }))
    } else {
      setFormData(defaultFormData)
    }
  }, [event, initialStart, initialEnd])


  const handleSubmit = async (e: React.FormEvent) => {
    // #region agent log
    fetch('http://127.0.0.1:7801/ingest/47e05ab7-47a2-4ca5-b184-af67d09df1bd',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'98e593'},body:JSON.stringify({sessionId:'98e593',location:'AdminForm.tsx:handleSubmit',message:'Form submit triggered',data:{},timestamp:Date.now(),hypothesisId:'H2'})}).catch(()=>{});
    // #endregion
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccess(false)

    const startUTC = formData.start_time ? new Date(formData.start_time).toISOString() : ''
    const endUTC = formData.end_time ? new Date(formData.end_time).toISOString() : undefined
    const payload = {
      ...formData,
      start_time: startUTC,
      end_time: endUTC || undefined,
    }

    const isEdit = !!event?.id
    const url = isEdit ? `/api/admin/events/${event.id}` : '/api/admin/events'
    const method = isEdit ? 'PATCH' : 'POST'

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${password}`,
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || (isEdit ? 'Failed to update event' : 'Failed to create event'))
      }

      setSuccess(true)
      setFormData(defaultFormData)
      onSuccess()
      setTimeout(() => setSuccess(false), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }


  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCategoryToggle = (category: EventCategory) => {
    setFormData((prev) => {
      const has = prev.categories.includes(category)
      const next = has
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category]
      return { ...prev, categories: next.length > 0 ? next : [category] }
    })
  }


  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-2xl mx-auto">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Title *
        </label>
        <input
          type="text"
          id="title"
          name="title"
          required
          value={formData.title}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ucla-blue"
        />
      </div>


      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          value={formData.description}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ucla-blue"
        />
      </div>


      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-1">
            Start Date & Time *
          </label>
          <div className="flex flex-wrap gap-2 items-center">
            <input
              type="date"
              id="start_date"
              required
              value={formData.start_time && formData.start_time.slice(0, 10) !== '1970-01-01' ? formData.start_time.slice(0, 10) : ''}
              onChange={(e) => {
                const date = e.target.value
                const time = formData.start_time ? formData.start_time.slice(11, 16) : '09:00'
                setFormData((prev) => ({ ...prev, start_time: date ? `${date}T${time}` : '' }))
              }}
              className="flex-1 min-w-[140px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ucla-blue"
            />
            <TimePicker
              id="start_time"
              aria-label="Start time"
              value={formData.start_time ? formData.start_time.slice(11, 16) : '09:00'}
              onChange={(time) => {
                const datePart = formData.start_time?.slice(0, 10)
                const date = datePart && datePart !== '1970-01-01' ? datePart : ''
                setFormData((prev) => ({ ...prev, start_time: date ? `${date}T${time}` : `1970-01-01T${time}` }))
              }}
            />
          </div>
        </div>

        <div>
          <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-1">
            End Date & Time
          </label>
          <div className="flex flex-wrap gap-2 items-center">
            <input
              type="date"
              id="end_date"
              value={formData.end_time ? formData.end_time.slice(0, 10) : ''}
              onChange={(e) => {
                const date = e.target.value
                const time = formData.end_time ? formData.end_time.slice(11, 16) : '10:00'
                setFormData((prev) => ({ ...prev, end_time: date ? `${date}T${time}` : '' }))
              }}
              className="flex-1 min-w-[140px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ucla-blue"
            />
            <TimePicker
              id="end_time"
              aria-label="End time"
              value={formData.end_time ? formData.end_time.slice(11, 16) : '10:00'}
              onChange={(time) => {
                const date = formData.end_time ? formData.end_time.slice(0, 10) : formData.start_time?.slice(0, 10) ?? ''
                setFormData((prev) => ({ ...prev, end_time: date ? `${date}T${time}` : '' }))
              }}
            />
          </div>
        </div>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <span className="block text-sm font-medium text-gray-700 mb-2">
            Categories * (select at least one)
          </span>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => {
              const isChecked = formData.categories.includes(cat)
              return (
                <label
                  key={cat}
                  className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 has-[:checked]:border-ucla-blue has-[:checked]:bg-blue-50"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleCategoryToggle(cat)}
                    className="rounded border-gray-300 text-ucla-blue focus:ring-ucla-blue"
                  />
                  <span className="text-sm">{CATEGORY_LABELS[cat]}</span>
                </label>
              )
            })}
          </div>
        </div>


        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ucla-blue"
          />
        </div>
      </div>


      <div>
        <label htmlFor="organizer" className="block text-sm font-medium text-gray-700 mb-1">
          Organizer
        </label>
        <input
          type="text"
          id="organizer"
          name="organizer"
          value={formData.organizer}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ucla-blue"
        />
      </div>


      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}


      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {event?.id ? 'Event updated successfully!' : 'Event created successfully!'}
        </div>
      )}


      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-ucla-blue text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting
          ? event?.id
            ? 'Saving...'
            : 'Creating...'
          : event?.id
            ? 'Update Event'
            : 'Create Event'}
      </button>
    </form>
  )
}



