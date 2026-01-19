import * as React from 'react'
import { MobileNav } from '@/components/layout/mobile-nav'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Main content area with padding for mobile nav */}
      <main className="pb-20 px-4 pt-6 max-w-2xl mx-auto">
        {children}
      </main>
      
      {/* Fixed bottom navigation */}
      <MobileNav />
    </div>
  )
}
