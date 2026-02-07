import Badge from '@/components/ui/Badge'
import { TASK_STATUS_OPTIONS } from '@/lib/constants'
import type { TaskStatus } from '@/lib/types/database'

export default function TaskStatusBadge({ status }: { status: TaskStatus }) {
  const config = TASK_STATUS_OPTIONS.find((s) => s.value === status)
  return (
    <Badge className={config?.color || 'bg-gray-100 text-gray-800'}>
      {config?.label || status}
    </Badge>
  )
}
