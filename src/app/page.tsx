import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  let authenticated = false

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    authenticated = !!user
  } catch {
    // If Supabase is unavailable, redirect to login
  }

  redirect(authenticated ? '/dashboard' : '/login')
}
