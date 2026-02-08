'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { CalendarEvent, EventTemplate } from '@/lib/types/database'

export function useEvents() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)

  const fetchEvents = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('events')
      .select('*')
      .order('start_date', { ascending: true })

    setEvents(data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  async function createEvent(event: {
    title: string
    description?: string
    start_date: string
    end_date: string
    color?: string
    notes?: string
    template_id?: string | null
    responsible_user_ids?: string[]
  }) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      window.location.href = '/login'
      return null
    }

    const { responsible_user_ids, ...eventData } = event
    const { data, error } = await supabase
      .from('events')
      .insert({ ...eventData, created_by: user.id })
      .select()
      .single()

    if (error) {
      console.error('createEvent error:', error.message)
    } else if (data) {
      if (responsible_user_ids?.length) {
        await supabase
          .from('event_responsibles')
          .insert(responsible_user_ids.map((uid) => ({ event_id: data.id, user_id: uid })))
      }
      setEvents((prev) => [...prev, data].sort((a, b) => a.start_date.localeCompare(b.start_date)))
    }
    return { data, error }
  }

  async function updateEvent(
    id: string,
    updates: Partial<CalendarEvent> & { responsible_user_ids?: string[] }
  ) {
    const supabase = createClient()
    const { responsible_user_ids, ...eventUpdates } = updates

    const { data, error } = await supabase
      .from('events')
      .update(eventUpdates)
      .eq('id', id)
      .select()
      .single()

    if (!error && data) {
      if (responsible_user_ids !== undefined) {
        await supabase.from('event_responsibles').delete().eq('event_id', id)
        if (responsible_user_ids.length) {
          await supabase
            .from('event_responsibles')
            .insert(responsible_user_ids.map((uid) => ({ event_id: id, user_id: uid })))
        }
      }
      setEvents((prev) =>
        prev.map((e) => (e.id === id ? data : e)).sort((a, b) => a.start_date.localeCompare(b.start_date))
      )
    }
    return { data, error }
  }

  async function deleteEvent(id: string) {
    const supabase = createClient()
    const { error } = await supabase.from('events').delete().eq('id', id)
    if (!error) {
      setEvents((prev) => prev.filter((e) => e.id !== id))
    }
    return { error }
  }

  return { events, loading, fetchEvents, createEvent, updateEvent, deleteEvent }
}

export function useEventTemplates() {
  const [templates, setTemplates] = useState<EventTemplate[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTemplates = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('event_templates')
      .select('*')
      .order('name')
    setTemplates(data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchTemplates()
  }, [fetchTemplates])

  async function createTemplate(template: {
    name: string
    default_title: string
    default_description?: string
    default_color: string
  }) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('event_templates')
      .insert(template)
      .select()
      .single()
    if (!error && data) {
      setTemplates((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
    }
    return { data, error }
  }

  async function updateTemplate(id: string, updates: Partial<EventTemplate>) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('event_templates')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (!error && data) {
      setTemplates((prev) =>
        prev.map((t) => (t.id === id ? data : t)).sort((a, b) => a.name.localeCompare(b.name))
      )
    }
    return { data, error }
  }

  async function deleteTemplate(id: string) {
    const supabase = createClient()
    const { error } = await supabase.from('event_templates').delete().eq('id', id)
    if (!error) {
      setTemplates((prev) => prev.filter((t) => t.id !== id))
    }
    return { error }
  }

  return { templates, loading, fetchTemplates, createTemplate, updateTemplate, deleteTemplate }
}
