'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface DayRatingProps {
  value: number | null
  onChange: (rating: number) => void
  disabled?: boolean
}

/**
 * 1-5 star rating for end-of-day reflection
 * Simple, no overthinking - just tap the star
 */
export function DayRating({ value, onChange, disabled = false }: DayRatingProps) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          disabled={disabled}
          className={cn(
            'p-1 text-2xl transition-all duration-150',
            'hover:scale-110 active:scale-95',
            'focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 rounded',
            disabled && 'cursor-not-allowed opacity-50'
          )}
          aria-label={`Rate day ${star} out of 5`}
        >
          <span
            className={cn(
              'transition-colors duration-150',
              value && star <= value
                ? 'text-amber-400'
                : 'text-slate-300 dark:text-slate-600'
            )}
          >
            ★
          </span>
        </button>
      ))}
    </div>
  )
}
