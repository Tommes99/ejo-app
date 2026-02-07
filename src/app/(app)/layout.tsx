import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AppShell from '@/components/layout/AppShell'
import type { Profile } from '@/lib/types/database'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let user = null
  let profile: Profile | null = null

  try {
    const supabase = await createClient()
    const result = await supabase.auth.getUser()
    user = result.data.user

    if (user) {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      profile = data
    }
  } catch {
    // If Supabase is unavailable, redirect to login
  }

  if (!user) {
    redirect('/login')
  }

  return <AppShell profile={profile}>{children}</AppShell>
}
