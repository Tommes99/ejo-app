'use client'

import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { formatRelative } from '@/lib/utils'
import type { Poll } from '@/lib/types/database'

export default function ActivePolls({ polls }: { polls: Poll[] }) {
  const active = polls
    .filter((p) => p.status === 'aktiv')
    .slice(0, 5)

  if (active.length === 0) {
    return (
      <Card>
        <h2 className="mb-3 text-lg font-semibold text-gray-900">Abstimmungen</h2>
        <p className="text-sm text-gray-500">Keine offenen Abstimmungen.</p>
      </Card>
    )
  }

  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Abstimmungen</h2>
        <Link href="/abstimmungen" className="text-sm text-blue-600 hover:text-blue-500">
          Alle anzeigen
        </Link>
      </div>
      <div className="space-y-2">
        {active.map((poll) => (
          <Link
            key={poll.id}
            href={`/abstimmungen/${poll.id}`}
            className="flex items-center justify-between rounded-md p-2 text-sm hover:bg-gray-50"
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="text-gray-900 line-clamp-1">{poll.title}</span>
              <Badge className="bg-blue-50 text-blue-700 text-[10px] flex-shrink-0">
                {poll.poll_type === 'date_poll' ? 'Termin' : 'Entscheidung'}
              </Badge>
            </div>
            <div className="flex items-center gap-2 ml-2 flex-shrink-0">
              {poll.voted_by_me ? (
                <CheckCircle2 size={14} className="text-green-500" />
              ) : (
                <Badge className="bg-orange-100 text-orange-700 text-[10px]">Ausstehend</Badge>
              )}
              <span className="text-xs text-gray-400">{formatRelative(poll.created_at)}</span>
            </div>
          </Link>
        ))}
      </div>
      {polls.filter((p) => p.status === 'aktiv').length > 5 && (
        <Link href="/abstimmungen" className="mt-3 block text-sm text-blue-600 hover:text-blue-500">
          Alle Abstimmungen anzeigen
        </Link>
      )}
    </Card>
  )
}
