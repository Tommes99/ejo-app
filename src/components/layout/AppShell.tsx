'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from './Sidebar'
import Header from './Header'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/types/database'

export default function AppShell({
  profile,
  children,
}: {
  profile: Profile | null
  children: React.ReactNode
}) {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('sidebar-collapsed')
    if (stored === 'true') setCollapsed(true)
  }, [])

  // Redirect to login when session expires
  useEffect(() => {
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        if (event === 'SIGNED_OUT') {
          router.push('/login')
        }
      }
    })
    return () => subscription.unsubscribe()
  }, [router])

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev
      localStorage.setItem('sidebar-collapsed', String(next))
      return next
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={toggleCollapsed}
      />
      <div
        className="transition-[margin] duration-200"
        style={{ marginLeft: collapsed ? '64px' : '256px' }}
      >
        <Header
          profile={profile}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="p-4 md:p-6">{children}</main>
      </div>
      {/* Mobile: no margin */}
      <style>{`
        @media (max-width: 767px) {
          div[style] { margin-left: 0 !important; }
        }
      `}</style>
    </div>
  )
}
