'use client'

import QuickActions from '@/components/dashboard/QuickActions'
import NewsFeed from '@/components/dashboard/NewsFeed'
import UpcomingTasks from '@/components/dashboard/UpcomingTasks'
import UpcomingEvents from '@/components/dashboard/UpcomingEvents'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { useTasks } from '@/lib/hooks/useTasks'
import { useEvents } from '@/lib/hooks/useEvents'
import { useNews } from '@/lib/hooks/useNews'

export default function DashboardPage() {
  const { tasks, loading: tasksLoading } = useTasks()
  const { events, loading: eventsLoading } = useEvents()
  const { news, loading: newsLoading } = useNews()

  const loading = tasksLoading || eventsLoading || newsLoading

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Startseite</h1>

      <div className="mb-6">
        <QuickActions />
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-6">
            <NewsFeed news={news} />
          </div>
          <div className="space-y-6">
            <UpcomingTasks tasks={tasks} />
            <UpcomingEvents events={events} />
          </div>
        </div>
      )}
    </div>
  )
}
