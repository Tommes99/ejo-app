'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import PollForm from '@/components/abstimmungen/PollForm'
import { usePolls } from '@/lib/hooks/usePolls'
import { useProfiles } from '@/lib/hooks/useUser'
import { useEvents } from '@/lib/hooks/useEvents'

export default function NeueAbstimmungPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const linkedEventId = searchParams.get('event') || undefined
  const { createPoll } = usePolls()
  const { profiles } = useProfiles()
  const { events } = useEvents()

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Neue Abstimmung</h1>
      <div className="mx-auto max-w-2xl">
        <PollForm
          profiles={profiles}
          events={events}
          linkedEventId={linkedEventId}
          onSubmit={async (data) => {
            const result = await createPoll(data)
            if (!result || result.error) {
              throw new Error(result?.error?.message || 'Fehler beim Erstellen.')
            }
            router.push('/abstimmungen')
          }}
        />
      </div>
    </div>
  )
}
