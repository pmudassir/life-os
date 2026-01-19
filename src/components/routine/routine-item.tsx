'use client'

import * as React from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'

interface RoutineItemProps {
  id: string
  label: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  icon?: React.ReactNode
  disabled?: boolean
  className?: string
}

/**
 * Single routine item with instant toggle feedback
 * Designed for zero-friction interaction - tap to toggle
 */
export function RoutineItem({
  id,
  label,
  checked,
  onCheckedChange,
  icon,
  disabled = false,
  className,
}: RoutineItemProps) {
  const handleChange = React.useCallback(
    (value: boolean | 'indeterminate') => {
      if (value !== 'indeterminate') {
        onCheckedChange(value)
      }
    },
    [onCheckedChange]
  )

  return (
    <label
      htmlFor={id}
      className={cn(
        'flex items-center gap-3 p-4 rounded-lg cursor-pointer select-none',
        'transition-all duration-200 ease-out',
        'hover:bg-slate-100 dark:hover:bg-slate-800',
        'active:scale-[0.98]',
        checked && 'bg-emerald-50 dark:bg-emerald-950/30',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={handleChange}
        disabled={disabled}
        className={cn(
          'h-6 w-6 rounded-md border-2',
          'transition-colors duration-200',
          checked && 'border-emerald-500 bg-emerald-500'
        )}
      />
      {icon && (
        <span className="text-xl flex-shrink-0">{icon}</span>
      )}
      <span
        className={cn(
          'text-base font-medium',
          'transition-colors duration-200',
          checked && 'text-emerald-700 dark:text-emerald-300 line-through opacity-70'
        )}
      >
        {label}
      </span>
    </label>
  )
}
