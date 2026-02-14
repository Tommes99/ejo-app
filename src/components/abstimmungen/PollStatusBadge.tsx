import Badge from '@/components/ui/Badge'
import { POLL_STATUS_OPTIONS } from '@/lib/constants'
import type { PollStatus } from '@/lib/types/database'

export default function PollStatusBadge({ status }: { status: PollStatus }) {
  const option = POLL_STATUS_OPTIONS.find((o) => o.value === status)
  return (
    <Badge className={option?.color || 'bg-gray-100 text-gray-800'}>
      {option?.label || status}
    </Badge>
  )
}
