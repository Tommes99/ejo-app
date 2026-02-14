import Link from 'next/link'
import { CalendarClock, Users, CheckCircle2 } from 'lucide-react'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import PollStatusBadge from './PollStatusBadge'
import { formatDate, formatRelative } from '@/lib/utils'
import type { Poll } from '@/lib/types/database'

export default function PollCard({ poll }: { poll: Poll }) {
  const typeLabel = poll.poll_type === 'date_poll' ? 'Terminumfrage' : 'Entscheidungsumfrage'

  return (
    <Link href={`/abstimmungen/${poll.id}`}>
      <Card className="transition-shadow hover:shadow-md">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <h3 className="text-base font-semibold text-gray-900">{poll.title}</h3>
              <PollStatusBadge status={poll.status} />
              <Badge className="bg-blue-50 text-blue-700">{typeLabel}</Badge>
            </div>

            {poll.description && (
              <p className="mt-1 text-sm text-gray-600 line-clamp-2">{poll.description}</p>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-gray-500">
              {poll.deadline && (
                <span className="flex items-center gap-1">
                  <CalendarClock size={13} />
                  Frist: {formatDate(poll.deadline)}
                </span>
              )}
              {poll.voter_count !== undefined && (
                <span className="flex items-center gap-1">
                  <Users size={13} />
                  {poll.voter_count} Teilnehmer
                </span>
              )}
              {poll.creator && <span>{poll.creator.full_name}</span>}
              <span>{formatRelative(poll.created_at)}</span>
            </div>
          </div>

          {poll.voted_by_me && (
            <div className="flex-shrink-0" title="Du hast abgestimmt">
              <CheckCircle2 size={20} className="text-green-500" />
            </div>
          )}
        </div>
      </Card>
    </Link>
  )
}
