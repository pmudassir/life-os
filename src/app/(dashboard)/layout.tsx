import * as React from 'react'
import { MobileNav } from '@/components/layout/mobile-nav'
import { ChatWidget } from '@/components/ai/chat-widget'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Main content area with padding for mobile nav */}
      <main className="pb-32 px-4 pt-6 max-w-4xl mx-auto">
        {children}
      </main>
      
      {/* Fixed bottom navigation */}
      <MobileNav />
      
      {/* AI Chat Widget */}
      <ChatWidget />
    </div>
  )
}
