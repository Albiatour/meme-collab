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
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Subscribe to project changes
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
            // Fetch the new project with profile info
            const { data } = await supabase
              .from('projects')
              .select('*, profiles(username)')
              .eq('id', payload.new.id)
              .single()

            if (data) {
              setProjects((prev) => [data, ...prev])
            }
          } else if (payload.eventType === 'DELETE') {
            setProjects((prev) => prev.filter((p) => p.id !== payload.old.id))
            if (selectedProject?.id === payload.old.id) {
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
      .insert({ title, created_by: user.id })
      .select('*, profiles(username)')
      .single()

    if (!error && data) {
      setSelectedProject(data)
    }
  }

  const handleDeleteProject = async (projectId: string) => {
    await supabase.from('projects').delete().eq('id', projectId)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gray-800 rounded-lg text-white hover:bg-gray-700"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {sidebarOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:relative z-40 transition-transform duration-300 ease-in-out`}>
        <Sidebar
          profile={profile}
          projects={projects}
          selectedProject={selectedProject}
          onSelectProject={setSelectedProject}
          onCreateProject={handleCreateProject}
          onDeleteProject={handleDeleteProject}
          onLogout={handleLogout}
          currentUserId={user.id}
        />
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="flex-1 flex flex-col">
        {selectedProject ? (
          <ChatArea
            project={selectedProject}
            currentUser={user}
            profile={profile}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-lg">Select a project to start chatting</p>
              <p className="text-sm mt-1">or create a new meme project</p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
