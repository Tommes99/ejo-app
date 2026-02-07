'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Task, TaskStatus } from '@/lib/types/database'

type TaskFilters = {
  status?: TaskStatus | ''
  assigned_to?: string
  project_id?: string
  deadline_before?: string
}

export function useTasks(filters?: TaskFilters) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTasks = useCallback(async () => {
    const supabase = createClient()
    let query = supabase
      .from('tasks')
      .select('*, assigned_profile:profiles!tasks_assigned_to_fkey(*), project:projects(*)')
      .order('position', { ascending: true })
      .order('created_at', { ascending: false })

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    if (filters?.assigned_to) {
      query = query.eq('assigned_to', filters.assigned_to)
    }
    if (filters?.project_id) {
      query = query.eq('project_id', filters.project_id)
    }
    if (filters?.deadline_before) {
      query = query.lte('deadline', filters.deadline_before)
    }

    const { data } = await query
    setTasks(data || [])
    setLoading(false)
  }, [filters?.status, filters?.assigned_to, filters?.project_id, filters?.deadline_before])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  async function createTask(task: {
    title: string
    description?: string
    status?: TaskStatus
    assigned_to?: string | null
    project_id?: string | null
    deadline?: string | null
  }) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
      .from('tasks')
      .insert({ ...task, created_by: user.id })
      .select('*, assigned_profile:profiles!tasks_assigned_to_fkey(*), project:projects(*)')
      .single()

    if (!error && data) {
      setTasks((prev) => [data, ...prev])
    }
    return { data, error }
  }

  async function updateTask(id: string, updates: Partial<Task>) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select('*, assigned_profile:profiles!tasks_assigned_to_fkey(*), project:projects(*)')
      .single()

    if (!error && data) {
      setTasks((prev) => prev.map((t) => (t.id === id ? data : t)))
    }
    return { data, error }
  }

  async function deleteTask(id: string) {
    const supabase = createClient()
    const { error } = await supabase.from('tasks').delete().eq('id', id)
    if (!error) {
      setTasks((prev) => prev.filter((t) => t.id !== id))
    }
    return { error }
  }

  function setTasksLocal(updater: (prev: Task[]) => Task[]) {
    setTasks(updater)
  }

  return { tasks, loading, fetchTasks, createTask, updateTask, deleteTask, setTasksLocal }
}
