'use client'


import { useState } from 'react'
import { EventInput, EventCategory, CATEGORIES, CATEGORY_LABELS } from '@/lib/types'


interface AdminFormProps {
  password: string
  onSuccess: () => void
}


export default function AdminForm({ password, onSuccess }: AdminFormProps) {
  const [formData, setFormData] = useState<EventInput>({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    categories: ['other'],
    location: '',
    organizer: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)


  const handleSubmit = async (e: React.FormEvent) => {
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

    try {
      const response = await fetch('/api/admin/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${password}`,
        },
        body: JSON.stringify(payload),
      })


      const data = await response.json()


      if (!response.ok) {
        throw new Error(data.error || 'Failed to create event')
      }


      setSuccess(true)
      setFormData({
        title: '',
        description: '',
        start_time: '',
        end_time: '',
        categories: ['other'],
        location: '',
        organizer: '',
      })
     
      setTimeout(() => {
        setSuccess(false)
        onSuccess()
      }, 2000)
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
          <label htmlFor="start_time" className="block text-sm font-medium text-gray-700 mb-1">
            Start Time *
          </label>
          <input
            type="datetime-local"
            id="start_time"
            name="start_time"
            required
            value={formData.start_time}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ucla-blue"
          />
        </div>


        <div>
          <label htmlFor="end_time" className="block text-sm font-medium text-gray-700 mb-1">
            End Time
          </label>
          <input
            type="datetime-local"
            id="end_time"
            name="end_time"
            value={formData.end_time}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ucla-blue"
          />
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
          Event created successfully!
        </div>
      )}


      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-ucla-blue text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Creating...' : 'Create Event'}
      </button>
    </form>
  )
}



