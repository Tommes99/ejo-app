'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { NewsPost } from '@/lib/types/database'

export function useNews() {
  const [news, setNews] = useState<NewsPost[]>([])
  const [loading, setLoading] = useState(true)

  const fetchNews = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('news')
      .select('*, author:profiles!news_author_id_fkey(*)')
      .order('pinned', { ascending: false })
      .order('created_at', { ascending: false })

    setNews(data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchNews()
  }, [fetchNews])

  async function createNews(post: { title: string; content: string; pinned?: boolean }) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
      .from('news')
      .insert({ ...post, author_id: user.id })
      .select('*, author:profiles!news_author_id_fkey(*)')
      .single()

    if (error) {
      console.error('createNews error:', error.message)
    } else if (data) {
      setNews((prev) => [data, ...prev])
    }
    return { data, error }
  }

  async function deleteNews(id: string) {
    const supabase = createClient()
    const { error } = await supabase.from('news').delete().eq('id', id)
    if (!error) {
      setNews((prev) => prev.filter((n) => n.id !== id))
    }
    return { error }
  }

  return { news, loading, fetchNews, createNews, deleteNews }
}
