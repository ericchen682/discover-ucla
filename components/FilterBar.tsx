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
    <div className="bg-white shadow-md p-4 mb-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-semibold text-gray-700 mr-2">Filter by Category:</span>
       
        {CATEGORIES.map((category) => {
          const isSelected = selectedCategories.includes(category)
          return (
            <button
              key={category}
              onClick={() => onCategoryToggle(category)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
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
            className="ml-auto px-3 py-1 text-sm text-gray-600 hover:text-gray-800 underline"
          >
            Clear Filters
          </button>
        )}
      </div>
    </div>
  )
}



