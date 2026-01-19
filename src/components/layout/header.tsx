import * as React from 'react'
import { cn } from '@/lib/utils'

interface HeaderProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
  className?: string
}

/**
 * Page header component
 * Clean, focused, no distractions
 */
export function Header({ title, subtitle, action, className }: HeaderProps) {
  return (
    <header
      className={cn(
        'flex items-start justify-between gap-4 mb-6',
        className
      )}
    >
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </header>
  )
}
