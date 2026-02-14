'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Poll, PollOption, PollVote, PollStatus } from '@/lib/types/database'

type PollFilters = {
  status?: PollStatus | ''
  createdByMe?: boolean
}

export function usePolls(filters?: PollFilters) {
  const [polls, setPolls] = useState<Poll[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPolls = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let query = supabase
      .from('polls')
      .select('*, creator:profiles!polls_created_by_fkey(*)')
      .order('created_at', { ascending: false })

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    if (filters?.createdByMe && user) {
      query = query.eq('created_by', user.id)
    }

    const { data: pollsData } = await query
    if (!pollsData) {
      setPolls([])
      setLoading(false)
      return
    }

    // Fetch vote counts and user's vote status for each poll
    if (user) {
      const pollIds = pollsData.map((p) => p.id)
      const { data: votes } = await supabase
        .from('poll_votes')
        .select('poll_id, voter_user_id')
        .in('poll_id', pollIds)

      const enriched = pollsData.map((poll) => {
        const pollVotes = votes?.filter((v) => v.poll_id === poll.id) || []
        const uniqueVoters = new Set(pollVotes.map((v) => v.voter_user_id))
        return {
          ...poll,
          voter_count: uniqueVoters.size,
          voted_by_me: uniqueVoters.has(user.id),
        }
      })
      setPolls(enriched)
    } else {
      setPolls(pollsData)
    }

    setLoading(false)
  }, [filters?.status, filters?.createdByMe])

  useEffect(() => {
    fetchPolls()
  }, [fetchPolls])

  async function createPoll(poll: {
    title: string
    description?: string
    poll_type: 'date_poll' | 'decision_poll'
    deadline?: string | null
    allow_vote_change?: boolean
    show_results_before_voting?: boolean
    linked_event_id?: string | null
    options: { label: string; option_date?: string | null; option_time_start?: string | null; option_time_end?: string | null }[]
    participant_user_ids?: string[]
  }) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      window.location.href = '/login'
      return null
    }

    const { options, participant_user_ids, ...pollData } = poll
    const { data, error } = await supabase
      .from('polls')
      .insert({ ...pollData, created_by: user.id })
      .select('*, creator:profiles!polls_created_by_fkey(*)')
      .single()

    if (error) {
      console.error('createPoll error:', error.message)
      return { data: null, error }
    }

    // Insert options
    if (options.length > 0) {
      const { error: optError } = await supabase
        .from('poll_options')
        .insert(options.map((opt, i) => ({ ...opt, poll_id: data.id, position: i })))
      if (optError) console.error('createPollOptions error:', optError.message)
    }

    // Insert participants (if specific users selected)
    if (participant_user_ids?.length) {
      await supabase
        .from('poll_participants')
        .insert(participant_user_ids.map((uid) => ({ poll_id: data.id, user_id: uid })))
    }

    // Auto-create news item
    await supabase
      .from('news')
      .insert({
        title: `Neue Abstimmung: ${data.title}`,
        content: data.description || `Eine neue ${poll.poll_type === 'date_poll' ? 'Terminumfrage' : 'Entscheidungsumfrage'} wurde erstellt. Stimme jetzt ab!`,
        author_id: user.id,
        pinned: false,
      })

    setPolls((prev) => [{ ...data, voter_count: 0, voted_by_me: false }, ...prev])
    return { data, error: null }
  }

  async function closePoll(id: string) {
    const supabase = createClient()
    const { error } = await supabase
      .from('polls')
      .update({ status: 'geschlossen' as PollStatus })
      .eq('id', id)
    if (!error) {
      setPolls((prev) => prev.map((p) => (p.id === id ? { ...p, status: 'geschlossen' as PollStatus } : p)))
    }
    return { error }
  }

  async function archivePoll(id: string) {
    const supabase = createClient()
    const { error } = await supabase
      .from('polls')
      .update({ status: 'archiviert' as PollStatus })
      .eq('id', id)
    if (!error) {
      setPolls((prev) => prev.map((p) => (p.id === id ? { ...p, status: 'archiviert' as PollStatus } : p)))
    }
    return { error }
  }

  async function deletePoll(id: string) {
    const supabase = createClient()
    const { error } = await supabase.from('polls').delete().eq('id', id)
    if (!error) {
      setPolls((prev) => prev.filter((p) => p.id !== id))
    }
    return { error }
  }

  return { polls, loading, fetchPolls, createPoll, closePoll, archivePoll, deletePoll }
}

// Hook for a single poll's detail view (options + votes)
export function usePollDetail(pollId: string) {
  const [poll, setPoll] = useState<Poll | null>(null)
  const [options, setOptions] = useState<PollOption[]>([])
  const [votes, setVotes] = useState<PollVote[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPoll = useCallback(async () => {
    const supabase = createClient()

    const [pollRes, optionsRes, votesRes] = await Promise.all([
      supabase
        .from('polls')
        .select('*, creator:profiles!polls_created_by_fkey(*)')
        .eq('id', pollId)
        .single(),
      supabase
        .from('poll_options')
        .select('*')
        .eq('poll_id', pollId)
        .order('position', { ascending: true }),
      supabase
        .from('poll_votes')
        .select('*')
        .eq('poll_id', pollId),
    ])

    setPoll(pollRes.data)
    setOptions(optionsRes.data || [])
    setVotes(votesRes.data || [])
    setLoading(false)
  }, [pollId])

  useEffect(() => {
    fetchPoll()
  }, [fetchPoll])

  async function submitVotes(
    voteData: { option_id: string; vote: 'yes' | 'no' | 'maybe'; comment?: string }[]
  ) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      window.location.href = '/login'
      return null
    }

    // Get user display name
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single()
    const displayName = profile?.full_name || user.email || 'Unbekannt'

    // Delete existing votes for this user on this poll, then insert new ones
    await supabase
      .from('poll_votes')
      .delete()
      .eq('poll_id', pollId)
      .eq('voter_user_id', user.id)

    const { data, error } = await supabase
      .from('poll_votes')
      .insert(
        voteData.map((v) => ({
          poll_id: pollId,
          option_id: v.option_id,
          voter_user_id: user.id,
          display_name: displayName,
          vote: v.vote,
          comment: v.comment || null,
        }))
      )
      .select()

    if (error) {
      console.error('submitVotes error:', error.message)
      return { data: null, error }
    }

    // Refresh all votes
    await fetchPoll()
    return { data, error: null }
  }

  return { poll, options, votes, loading, fetchPoll, submitVotes }
}
