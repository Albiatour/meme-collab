import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Dashboard from '@/components/Dashboard'

export default async function Home() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single() as any

  const { data: projects } = await supabase
    .from('projects')
    .select('*, profiles(username)')
    .order('created_at', { ascending: false }) as any

  return (
    <Dashboard
      user={user}
      profile={profile!}
      initialProjects={projects || []}
    />
  )
}
