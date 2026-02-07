import TaskCard from './TaskCard'
import EmptyState from '@/components/ui/EmptyState'
import type { Task } from '@/lib/types/database'

export default function TaskList({ tasks }: { tasks: Task[] }) {
  if (tasks.length === 0) {
    return <EmptyState message="Noch keine Aufgaben vorhanden." />
  }

  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  )
}
