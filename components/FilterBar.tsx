'use client'


import { EventCategory, CATEGORIES, CATEGORY_LABELS } from '@/lib/types'


interface FilterBarProps {
  selectedCategories: EventCategory[]
  onCategoryToggle: (category: EventCategory) => void
  onClearFilters: () => void
}


export default function FilterBar({
  selectedCategories,
  onCategoryToggle,
  onClearFilters,
}: FilterBarProps) {
  return (
    <div className="bg-white shadow-md p-3 sm:p-4 mb-3 sm:mb-4 rounded-lg">
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
        <span className="font-semibold text-gray-700 text-sm sm:text-base w-full sm:w-auto mb-1 sm:mb-0 sm:mr-2">
          Filter:
        </span>
        {CATEGORIES.map((category) => {
          const isSelected = selectedCategories.includes(category)
          return (
            <button
              key={category}
              onClick={() => onCategoryToggle(category)}
              className={`px-2.5 py-1 sm:px-3 rounded-full text-xs sm:text-sm font-medium transition-colors ${
                isSelected
                  ? 'bg-ucla-blue text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {CATEGORY_LABELS[category]}
            </button>
          )
        })}
        {selectedCategories.length > 0 && (
          <button
            onClick={onClearFilters}
            className="w-full sm:w-auto sm:ml-auto px-2.5 py-1 sm:px-3 text-xs sm:text-sm text-gray-600 hover:text-gray-800 underline text-left sm:text-center"
          >
            Clear Filters
          </button>
        )}
      </div>
    </div>
  )
}



