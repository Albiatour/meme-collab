'use client'

import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { Profile, Project } from '@/lib/types'
import Sidebar from './Sidebar'
import ChatArea from './ChatArea'

interface DashboardProps {
  user: User
  profile: Profile
  initialProjects: (Project & { profiles: { username: string } })[]
}

export default function Dashboard({ user, profile, initialProjects }: DashboardProps) {
  const [projects, setProjects] = useState(initialProjects)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const supabase = createClient()

  // Toggle body scroll when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.classList.add('menu-open')
    } else {
      document.body.classList.remove('menu-open')
    }
    return () => {
      document.body.classList.remove('menu-open')
    }
  }, [menuOpen])

  useEffect(() => {
    const channel = supabase
      .channel('projects-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects',
        },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            const { data } = await supabase
              .from('projects')
              .select('*, profiles(username)')
              .eq('id', (payload.new as any).id)
              .single() as any

            if (data) {
              setProjects((prev) => [data, ...prev])
            }
          } else if (payload.eventType === 'DELETE') {
            setProjects((prev) => prev.filter((p) => p.id !== (payload.old as any).id))
            if (selectedProject?.id === (payload.old as any).id) {
              setSelectedProject(null)
            }
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, selectedProject])

  const handleCreateProject = async (title: string) => {
    const { data, error } = await supabase
      .from('projects')
      .insert({ title, created_by: user.id } as any)
      .select('*, profiles(username)')
      .single()

    if (!error && data) {
      setSelectedProject(data)
      setMenuOpen(false)
    }
  }

  const handleDeleteProject = async (projectId: string) => {
    await supabase.from('projects').delete().eq('id', projectId)
  }

  const handleSelectProject = (project: Project) => {
    setSelectedProject(project)
    setMenuOpen(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <div className="h-[100dvh] flex flex-col md:flex-row bg-slate-900">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between px-4 h-14 bg-slate-800 border-b border-slate-700 safe-area-top shrink-0">
        <button
          onClick={() => setMenuOpen(true)}
          className="touch-target flex items-center justify-center -ml-2"
          aria-label="Open menu"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="font-semibold text-white truncate px-4">
          {selectedProject?.title || 'Joelememe inspi'}
        </h1>
        <div className="w-10" /> {/* Spacer for centering */}
      </header>

      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 z-40 animate-fade-in"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:relative inset-y-0 left-0 z-50
        w-full max-w-[300px] md:w-[280px] md:max-w-none
        transform transition-transform duration-300 ease-out
        ${menuOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
      `}>
        <Sidebar
          profile={profile}
          projects={projects}
          selectedProject={selectedProject}
          onSelectProject={handleSelectProject}
          onCreateProject={handleCreateProject}
          onDeleteProject={handleDeleteProject}
          onLogout={handleLogout}
          onClose={() => setMenuOpen(false)}
          currentUserId={user.id}
        />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-0 min-w-0">
        {selectedProject ? (
          <ChatArea
            project={selectedProject}
            currentUser={user}
            profile={profile}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-500 p-8">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-slate-800 flex items-center justify-center">
                <svg className="w-10 h-10 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-lg font-medium text-slate-400">Select a project</p>
              <p className="text-sm mt-1 text-slate-500">or create a new one to start chatting</p>
              <button
                onClick={() => setMenuOpen(true)}
                className="md:hidden mt-6 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition touch-target"
              >
                Open Menu
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
