'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { useTasks } from '@/lib/hooks/useTasks'
import { useEvents, useEventTemplates } from '@/lib/hooks/useEvents'
import { useProfiles } from '@/lib/hooks/useUser'
import { cn } from '@/lib/utils'

const CalendarView = dynamic(
  () => import('@/components/kalender/CalendarView'),
  { ssr: false, loading: () => <LoadingSpinner /> }
)

type CalendarTab = 'month' | 'week'

export default function KalenderPage() {
  const [activeTab, setActiveTab] = useState<CalendarTab>('month')
  const { tasks, loading: tasksLoading } = useTasks()
  const { events, loading: eventsLoading, createEvent, updateEvent, deleteEvent } = useEvents()
  const { templates } = useEventTemplates()
  const { profiles } = useProfiles()

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Kalender</h1>
        <div className="flex gap-1 rounded-md bg-gray-100 p-1">
          {([
            { value: 'week' as CalendarTab, label: 'Woche' },
            { value: 'month' as CalendarTab, label: 'Monat' },
          ]).map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                activeTab === tab.value
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {tasksLoading || eventsLoading ? (
        <LoadingSpinner />
      ) : (
        <CalendarView
          tasks={tasks}
          events={events}
          templates={templates}
          profiles={profiles}
          onCreateEvent={createEvent}
          onUpdateEvent={updateEvent}
          onDeleteEvent={deleteEvent}
          initialView={activeTab}
          onViewChange={setActiveTab}
        />
      )}
    </div>
  )
}
