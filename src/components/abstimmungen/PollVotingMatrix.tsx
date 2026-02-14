'use client'

import { useState, useMemo } from 'react'
import { Check, X, Minus } from 'lucide-react'
import Button from '@/components/ui/Button'
import { formatDate } from '@/lib/utils'
import type { PollOption, PollVote, VoteValue } from '@/lib/types/database'

type MyVotes = Record<string, VoteValue>

const VOTE_CYCLE: VoteValue[] = ['yes', 'no', 'maybe']

function nextVote(current: VoteValue): VoteValue {
  const idx = VOTE_CYCLE.indexOf(current)
  return VOTE_CYCLE[(idx + 1) % VOTE_CYCLE.length]
}

function VoteCell({
  vote,
  editable,
  onClick,
}: {
  vote: VoteValue | null
  editable: boolean
  onClick?: () => void
}) {
  const base = 'flex h-8 w-8 items-center justify-center rounded text-sm font-bold transition-colors'

  if (!vote) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={!editable}
        className={`${base} ${editable ? 'bg-gray-100 text-gray-400 hover:bg-gray-200 cursor-pointer' : 'bg-gray-50 text-gray-300'}`}
      >
        –
      </button>
    )
  }

  const styles: Record<VoteValue, string> = {
    yes: 'bg-green-100 text-green-700',
    no: 'bg-red-100 text-red-700',
    maybe: 'bg-yellow-100 text-yellow-700',
  }

  const icons: Record<VoteValue, React.ReactNode> = {
    yes: <Check size={16} strokeWidth={3} />,
    no: <X size={16} strokeWidth={3} />,
    maybe: <Minus size={16} strokeWidth={3} />,
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!editable}
      className={`${base} ${styles[vote]} ${editable ? 'cursor-pointer hover:opacity-80' : ''}`}
    >
      {icons[vote]}
    </button>
  )
}

export default function PollVotingMatrix({
  options,
  votes,
  currentUserId,
  isActive,
  allowVoteChange,
  showResultsBeforeVoting,
  onSubmitVotes,
}: {
  options: PollOption[]
  votes: PollVote[]
  currentUserId: string | null
  isActive: boolean
  allowVoteChange: boolean
  showResultsBeforeVoting: boolean
  onSubmitVotes: (votes: { option_id: string; vote: VoteValue }[]) => Promise<unknown>
}) {
  // Group votes by voter
  const voterMap = useMemo(() => {
    const map = new Map<string, { displayName: string; votes: Map<string, VoteValue> }>()
    for (const v of votes) {
      if (!map.has(v.voter_user_id)) {
        map.set(v.voter_user_id, { displayName: v.display_name, votes: new Map() })
      }
      map.get(v.voter_user_id)!.votes.set(v.option_id, v.vote)
    }
    return map
  }, [votes])

  const hasVoted = currentUserId ? voterMap.has(currentUserId) : false
  const canVote = isActive && (!hasVoted || allowVoteChange)

  // Initialize my votes from existing votes or empty
  const initialMyVotes: MyVotes = {}
  if (currentUserId && voterMap.has(currentUserId)) {
    for (const [optId, vote] of voterMap.get(currentUserId)!.votes) {
      initialMyVotes[optId] = vote
    }
  } else {
    for (const opt of options) {
      initialMyVotes[opt.id] = 'no'
    }
  }

  const [myVotes, setMyVotes] = useState<MyVotes>(initialMyVotes)
  const [editing, setEditing] = useState(!hasVoted && isActive)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function toggleMyVote(optionId: string) {
    setMyVotes((prev) => ({
      ...prev,
      [optionId]: nextVote(prev[optionId] || 'no'),
    }))
  }

  async function handleSave() {
    setError('')
    setSaving(true)
    try {
      const voteData = options.map((opt) => ({
        option_id: opt.id,
        vote: myVotes[opt.id] || 'no',
      }))
      await onSubmitVotes(voteData)
      setEditing(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Speichern.')
    }
    setSaving(false)
  }

  // Summary counts per option
  const summary = useMemo(() => {
    const counts: Record<string, { yes: number; no: number; maybe: number }> = {}
    for (const opt of options) {
      counts[opt.id] = { yes: 0, no: 0, maybe: 0 }
    }
    for (const [, voter] of voterMap) {
      for (const [optId, vote] of voter.votes) {
        if (counts[optId]) counts[optId][vote]++
      }
    }
    return counts
  }, [options, voterMap])

  // Other voters (not current user)
  const otherVoters = Array.from(voterMap.entries()).filter(([id]) => id !== currentUserId)

  // Determine if we should show other votes
  const showOthers = showResultsBeforeVoting || hasVoted

  // Format option label for date polls
  function formatOptionLabel(opt: PollOption): string {
    if (opt.option_date) {
      let label = formatDate(opt.option_date)
      if (opt.option_time_start) {
        label += ` ${opt.option_time_start}`
        if (opt.option_time_end) label += `–${opt.option_time_end}`
      }
      return label
    }
    return opt.label
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="sticky left-0 bg-white px-3 py-2 text-left text-xs font-medium text-gray-500">
                Teilnehmer
              </th>
              {options.map((opt) => (
                <th key={opt.id} className="px-2 py-2 text-center text-xs font-medium text-gray-700 min-w-[60px]">
                  {formatOptionLabel(opt)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Current user row */}
            {currentUserId && (
              <tr className="border-b border-gray-100 bg-blue-50/50">
                <td className="sticky left-0 bg-blue-50/50 px-3 py-2 font-medium text-gray-900">
                  Du {hasVoted && !editing && <span className="text-xs text-green-600">(abgestimmt)</span>}
                </td>
                {options.map((opt) => (
                  <td key={opt.id} className="px-2 py-2 text-center">
                    <div className="flex justify-center">
                      <VoteCell
                        vote={editing ? myVotes[opt.id] || null : (voterMap.get(currentUserId)?.votes.get(opt.id) || null)}
                        editable={editing}
                        onClick={editing ? () => toggleMyVote(opt.id) : undefined}
                      />
                    </div>
                  </td>
                ))}
              </tr>
            )}

            {/* Other voters */}
            {showOthers && otherVoters.map(([voterId, voter]) => (
              <tr key={voterId} className="border-b border-gray-100">
                <td className="sticky left-0 bg-white px-3 py-2 text-gray-700">
                  {voter.displayName}
                </td>
                {options.map((opt) => (
                  <td key={opt.id} className="px-2 py-2 text-center">
                    <div className="flex justify-center">
                      <VoteCell vote={voter.votes.get(opt.id) || null} editable={false} />
                    </div>
                  </td>
                ))}
              </tr>
            ))}

            {/* Summary row */}
            {showOthers && (
              <tr className="border-t-2 border-gray-300 bg-gray-50 font-medium">
                <td className="sticky left-0 bg-gray-50 px-3 py-2 text-xs text-gray-500">
                  Zusammenfassung
                </td>
                {options.map((opt) => {
                  const s = summary[opt.id]
                  return (
                    <td key={opt.id} className="px-2 py-2 text-center">
                      <div className="flex justify-center gap-1 text-xs">
                        <span className="text-green-700">{s.yes}</span>
                        <span className="text-gray-400">/</span>
                        <span className="text-yellow-600">{s.maybe}</span>
                        <span className="text-gray-400">/</span>
                        <span className="text-red-600">{s.no}</span>
                      </div>
                    </td>
                  )
                })}
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="inline-flex h-4 w-4 items-center justify-center rounded bg-green-100 text-green-700"><Check size={10} strokeWidth={3} /></span> Ja
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-flex h-4 w-4 items-center justify-center rounded bg-yellow-100 text-yellow-700"><Minus size={10} strokeWidth={3} /></span> Vielleicht
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-flex h-4 w-4 items-center justify-center rounded bg-red-100 text-red-700"><X size={10} strokeWidth={3} /></span> Nein
        </span>
      </div>

      {/* Actions */}
      {currentUserId && isActive && (
        <div className="flex gap-2">
          {editing ? (
            <>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Wird gespeichert...' : 'Stimme abgeben'}
              </Button>
              {hasVoted && (
                <Button variant="secondary" onClick={() => setEditing(false)}>
                  Abbrechen
                </Button>
              )}
            </>
          ) : canVote ? (
            <Button variant="secondary" onClick={() => setEditing(true)}>
              Stimme ändern
            </Button>
          ) : null}
        </div>
      )}

      {!isActive && (
        <p className="text-sm text-gray-500">Diese Abstimmung ist geschlossen.</p>
      )}
    </div>
  )
}
