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

      // Auto-create profile if it doesn't exist (fallback for missing trigger)
      if (!profile) {
        const { data: newProfile } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            full_name: user.user_metadata?.full_name || '',
            email: user.email || '',
          })
          .select('*')
          .single()
        profile = newProfile
      }
    }
  } catch {
    // If Supabase is unavailable, redirect to login
  }

  if (!user) {
    redirect('/login')
  }

  return <AppShell profile={profile}>{children}</AppShell>
}
