'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  Home,
  CheckSquare,
  FolderOpen,
  CalendarDays,
  Newspaper,
  BarChart3,
  Settings,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { NAV_ITEMS } from '@/lib/constants'

const iconMap = {
  Home,
  CheckSquare,
  FolderOpen,
  CalendarDays,
  Newspaper,
  BarChart3,
  Settings,
} as const

export default function Sidebar({
  open,
  onClose,
  collapsed,
  onToggleCollapse,
}: {
  open: boolean
  onClose: () => void
  collapsed: boolean
  onToggleCollapse: () => void
}) {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 z-50 flex h-full flex-col bg-sidebar text-white transition-all duration-200',
          collapsed ? 'md:w-16' : 'md:w-64',
          open ? 'w-64 translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        <div className={cn(
          'flex h-16 items-center px-4',
          collapsed ? 'md:justify-center md:px-2' : 'justify-between'
        )}>
          <Link href="/dashboard" className={cn('flex items-center gap-2', collapsed && 'md:hidden')} onClick={onClose}>
            <Image
              src="/ejo-logo.svg"
              alt="EJO"
              width={160}
              height={56}
              className="h-11 w-auto brightness-0 invert"
            />
          </Link>
          {collapsed && (
            <Link href="/dashboard" className="hidden md:block" onClick={onClose}>
              <Image
                src="/ejo-logo.svg"
                alt="EJO"
                width={32}
                height={32}
                className="h-7 w-7 brightness-0 invert object-contain"
              />
            </Link>
          )}
          <button onClick={onClose} className="md:hidden">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-2 py-2">
          {NAV_ITEMS.map((item) => {
            const Icon = iconMap[item.icon as keyof typeof iconMap]
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href))

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                title={collapsed ? item.label : undefined}
                className={cn(
                  'mb-1 flex items-center rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                  collapsed ? 'md:justify-center md:px-2' : 'gap-3',
                  isActive
                    ? 'bg-sidebar-active text-white'
                    : 'text-gray-300 hover:bg-sidebar-hover hover:text-white'
                )}
              >
                <Icon size={18} />
                <span className={cn(collapsed && 'md:hidden')}>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Collapse toggle - small arrow, desktop only */}
        <div className="hidden px-2 py-2 md:block">
          <button
            onClick={onToggleCollapse}
            className={cn(
              'flex items-center justify-center rounded-md p-1.5 text-gray-400 transition-colors hover:bg-sidebar-hover hover:text-white',
              collapsed ? 'mx-auto' : 'ml-auto'
            )}
            title={collapsed ? 'Sidebar ausklappen' : 'Sidebar einklappen'}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>
      </aside>
    </>
  )
}
