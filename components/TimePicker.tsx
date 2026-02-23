'use client'

import { useState, useRef, useEffect } from 'react'
import {
  TIME_OPTIONS_15,
  formatTimeOptionLabel,
  parseTimeInput,
  getNearest15Min,
} from '@/lib/dates'

const DROPDOWN_MAX_HEIGHT = 200
const OPTION_HEIGHT = 32

interface TimePickerProps {
  value: string
  onChange: (time: string) => void
  id?: string
  'aria-label'?: string
  placeholder?: string
}

export default function TimePicker({
  value,
  onChange,
  id,
  'aria-label': ariaLabel,
  placeholder = 'Time',
}: TimePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [inputText, setInputText] = useState(() =>
    value ? formatTimeOptionLabel(value) : ''
  )
  const listRef = useRef<HTMLDivElement>(null)
  const dropdownHighlight = value ? (TIME_OPTIONS_15.includes(value) ? value : getNearest15Min(value)) : TIME_OPTIONS_15[0]
  const selectedIndex = Math.max(0, TIME_OPTIONS_15.indexOf(dropdownHighlight))

  useEffect(() => {
    if (value) {
      setInputText(formatTimeOptionLabel(value))
    }
  }, [value])

  useEffect(() => {
    if (isOpen && listRef.current) {
      const el = listRef.current.querySelector(`[data-index="${selectedIndex}"]`)
      el?.scrollIntoView({ block: 'center', behavior: 'instant' })
    }
  }, [isOpen, selectedIndex])

  const applyTypedTime = () => {
    const parsed = parseTimeInput(inputText)
    if (parsed) {
      onChange(parsed)
      setInputText(formatTimeOptionLabel(parsed))
    } else if (value) {
      setInputText(formatTimeOptionLabel(value))
    }
  }

  const handleBlur = () => {
    applyTypedTime()
    setTimeout(() => setIsOpen(false), 150)
  }

  const handleSelect = (time: string) => {
    onChange(time)
    setInputText(formatTimeOptionLabel(time))
    setIsOpen(false)
  }

  const currentValue = dropdownHighlight

  return (
    <div className="relative inline-block min-w-[100px]">
      <input
        type="text"
        id={id}
        aria-label={ariaLabel}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        role="combobox"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        onFocus={() => setIsOpen(true)}
        onBlur={handleBlur}
        onKeyDown={(e) => {
          // #region agent log
          if (e.key === 'Enter') {
            fetch('http://127.0.0.1:7801/ingest/47e05ab7-47a2-4ca5-b184-af67d09df1bd',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'98e593'},body:JSON.stringify({sessionId:'98e593',location:'TimePicker.tsx:input onKeyDown',message:'Enter key in time input',data:{key:e.key},timestamp:Date.now(),hypothesisId:'H1'})}).catch(()=>{});
            e.preventDefault()
            e.stopPropagation()
            applyTypedTime()
            setIsOpen(false)
          }
          // #endregion
        }}
        placeholder={placeholder}
        className="w-full min-w-[100px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ucla-blue bg-white"
      />
      {isOpen && (
        <div
          ref={listRef}
          role="listbox"
          aria-label={ariaLabel}
          className="absolute z-50 mt-1 left-0 right-0 bg-white border border-gray-300 rounded-md shadow-lg overflow-y-auto"
          style={{ maxHeight: DROPDOWN_MAX_HEIGHT }}
        >
          {TIME_OPTIONS_15.map((t, i) => (
            <button
              key={t}
              type="button"
              role="option"
              aria-selected={currentValue === t}
              data-index={i}
              onClick={() => handleSelect(t)}
              onMouseDown={(e) => e.preventDefault()}
              className={`w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none ${
                currentValue === t ? 'bg-ucla-blue text-white hover:bg-blue-700 focus:bg-blue-700' : ''
              }`}
              style={{ height: OPTION_HEIGHT }}
            >
              {formatTimeOptionLabel(t)}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
