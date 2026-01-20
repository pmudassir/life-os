'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Calendar, AlertCircle, Map, LayoutGrid } from 'lucide-react'

const navItems = [
  { href: '/', icon: LayoutGrid, label: 'Today' },
  { href: '/week', icon: Calendar, label: 'Week' },
  { href: '/missed', icon: AlertCircle, label: 'Missed' },
  { href: '/roadmap', icon: Map, label: 'Roadmap' },
]

/**
 * Premium Mobile Navigation
 * Floating glass dock concept
 */
export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-6 left-4 right-4 z-50">
      <div className="glass rounded-2xl shadow-lg shadow-black/5 dark:shadow-black/20 mx-auto max-w-md">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map(({ href, icon: Icon, label }) => {
            const isActive = pathname === href

            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'relative flex flex-col items-center justify-center flex-1 h-full rounded-xl transition-all duration-300',
                  isActive 
                    ? 'text-primary' 
                    : 'text-muted-foreground hover:text-primary hover:bg-secondary/50'
                )}
              >
                <div className={cn(
                  "p-1.5 rounded-xl transition-all duration-300",
                  isActive && "bg-secondary"
                )}>
                  <Icon className={cn('h-5 w-5', isActive && 'stroke-[2.5px]')} />
                </div>
                {isActive && (
                  <span className="absolute -bottom-1 w-1 h-1 rounded-full bg-primary" />
                )}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
