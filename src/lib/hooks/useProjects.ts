'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Project } from '@/lib/types/database'

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  const fetchProjects = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })
    setProjects(data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  async function createProject(project: { name: string; description?: string; color?: string }) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      window.location.href = '/login'
      return null
    }

    const { data, error } = await supabase
      .from('projects')
      .insert({ ...project, created_by: user.id })
      .select()
      .single()

    if (error) {
      console.error('createProject error:', error.message)
    } else if (data) {
      setProjects((prev) => [data, ...prev])
    }
    return { data, error }
  }

  async function updateProject(id: string, updates: Partial<Project>) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (!error && data) {
      setProjects((prev) => prev.map((p) => (p.id === id ? data : p)))
    }
    return { data, error }
  }

  async function deleteProject(id: string) {
    const supabase = createClient()
    const { error } = await supabase.from('projects').delete().eq('id', id)
    if (!error) {
      setProjects((prev) => prev.filter((p) => p.id !== id))
    }
    return { error }
  }

  return { projects, loading, fetchProjects, createProject, updateProject, deleteProject }
}
