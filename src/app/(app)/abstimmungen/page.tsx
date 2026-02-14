'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import Button from '@/components/ui/Button'
import Tabs from '@/components/ui/Tabs'
import EmptyState from '@/components/ui/EmptyState'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import PollCard from '@/components/abstimmungen/PollCard'
import { usePolls } from '@/lib/hooks/usePolls'
import type { PollStatus } from '@/lib/types/database'

type PollTab = 'aktiv' | 'geschlossen' | 'archiviert'

const TABS: { value: PollTab; label: string }[] = [
  { value: 'aktiv', label: 'Offen' },
  { value: 'geschlossen', label: 'Geschlossen' },
  { value: 'archiviert', label: 'Archiv' },
]

export default function AbstimmungenPage() {
  const [activeTab, setActiveTab] = useState<PollTab>('aktiv')
  const { polls, loading } = usePolls({ status: activeTab as PollStatus })

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Abstimmungen</h1>
        <Link href="/abstimmungen/neu">
          <Button>
            <Plus size={16} /> Neue Abstimmung
          </Button>
        </Link>
      </div>

      <div className="mb-4">
        <Tabs tabs={TABS} active={activeTab} onChange={setActiveTab} />
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : polls.length === 0 ? (
        <EmptyState
          message={
            activeTab === 'aktiv'
              ? 'Noch keine offenen Abstimmungen.'
              : activeTab === 'geschlossen'
                ? 'Keine geschlossenen Abstimmungen.'
                : 'Keine archivierten Abstimmungen.'
          }
          action={
            activeTab === 'aktiv' ? (
              <Link href="/abstimmungen/neu">
                <Button>Erste Abstimmung erstellen</Button>
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-3">
          {polls.map((poll) => (
            <PollCard key={poll.id} poll={poll} />
          ))}
        </div>
      )}
    </div>
  )
}
