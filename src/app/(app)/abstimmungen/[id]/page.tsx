'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Lock, Archive, Trash2 } from 'lucide-react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import PollStatusBadge from '@/components/abstimmungen/PollStatusBadge'
import PollVotingMatrix from '@/components/abstimmungen/PollVotingMatrix'
import Badge from '@/components/ui/Badge'
import { usePollDetail } from '@/lib/hooks/usePolls'
import { formatDate, formatRelative } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

export default function PollDetailPage() {
  const params = useParams()
  const router = useRouter()
  const pollId = params.id as string
  const { poll, options, votes, loading, submitVotes } = usePollDetail(pollId)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    async function getUser() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUserId(user?.id || null)
    }
    getUser()
  }, [])

  if (loading) return <LoadingSpinner />
  if (!poll) return <p className="text-gray-500">Abstimmung nicht gefunden.</p>

  const isCreator = currentUserId === poll.created_by
  const isActive = poll.status === 'aktiv'
  const typeLabel = poll.poll_type === 'date_poll' ? 'Terminumfrage' : 'Entscheidungsumfrage'

  async function handleClose() {
    setActionLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.from('polls').update({ status: 'geschlossen' }).eq('id', pollId)
      if (error) throw error
      router.refresh()
    } catch (err) {
      console.error('handleClose error:', err)
    } finally {
      setActionLoading(false)
    }
  }

  async function handleArchive() {
    setActionLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.from('polls').update({ status: 'archiviert' }).eq('id', pollId)
      if (error) throw error
      router.push('/abstimmungen')
    } catch (err) {
      console.error('handleArchive error:', err)
      setActionLoading(false)
    }
  }

  async function handleDelete() {
    setActionLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.from('polls').delete().eq('id', pollId)
      if (error) throw error
      router.push('/abstimmungen')
    } catch (err) {
      console.error('handleDelete error:', err)
      setActionLoading(false)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold text-gray-900">{poll.title}</h1>
          <PollStatusBadge status={poll.status} />
          <Badge className="bg-blue-50 text-blue-700">{typeLabel}</Badge>
        </div>

        {poll.description && (
          <p className="mb-3 text-sm text-gray-600">{poll.description}</p>
        )}

        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
          {poll.creator && <span>Erstellt von {poll.creator.full_name}</span>}
          <span>{formatRelative(poll.created_at)}</span>
          {poll.deadline && (
            <span>Frist: {formatDate(poll.deadline)}</span>
          )}
        </div>
      </div>

      {/* Voting Matrix */}
      <Card className="mb-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Abstimmung</h2>
        <PollVotingMatrix
          options={options}
          votes={votes}
          currentUserId={currentUserId}
          isActive={isActive}
          allowVoteChange={poll.allow_vote_change}
          showResultsBeforeVoting={poll.show_results_before_voting}
          onSubmitVotes={async (voteData) => {
            const result = await submitVotes(voteData)
            if (result && 'error' in result && result.error) {
              throw new Error(String((result.error as { message?: string }).message || 'Fehler beim Speichern.'))
            }
          }}
        />
      </Card>

      {/* Creator Actions */}
      {isCreator && (
        <Card>
          <h2 className="mb-3 text-sm font-semibold text-gray-700">Verwaltung</h2>
          <div className="flex flex-wrap items-center gap-2">
            {isActive && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleClose}
                disabled={actionLoading}
              >
                <Lock size={14} /> Schließen
              </Button>
            )}
            {poll.status !== 'archiviert' && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleArchive}
                disabled={actionLoading}
              >
                <Archive size={14} /> Archivieren
              </Button>
            )}
            {showDeleteConfirm ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-red-600">Wirklich löschen?</span>
                <Button variant="danger" size="sm" onClick={handleDelete} disabled={actionLoading}>
                  Ja
                </Button>
                <Button variant="secondary" size="sm" onClick={() => setShowDeleteConfirm(false)}>
                  Nein
                </Button>
              </div>
            ) : (
              <Button
                variant="danger"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={actionLoading}
              >
                <Trash2 size={14} /> Löschen
              </Button>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}
