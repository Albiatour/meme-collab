'use client'

import { useState } from 'react'
import { Profile, Project } from '@/lib/types'

interface SidebarProps {
  profile: Profile
  projects: (Project & { profiles: { username: string } })[]
  selectedProject: Project | null
  onSelectProject: (project: Project) => void
  onCreateProject: (title: string) => void
  onDeleteProject: (projectId: string) => void
  onLogout: () => void
  onClose: () => void
  currentUserId: string
}

export default function Sidebar({
  profile,
  projects,
  selectedProject,
  onSelectProject,
  onCreateProject,
  onDeleteProject,
  onLogout,
  onClose,
  currentUserId,
}: SidebarProps) {
  const [newProjectTitle, setNewProjectTitle] = useState('')
  const [showNewProject, setShowNewProject] = useState(false)

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault()
    if (newProjectTitle.trim()) {
      onCreateProject(newProjectTitle.trim())
      setNewProjectTitle('')
      setShowNewProject(false)
    }
  }

  return (
    <div className="h-full w-full bg-slate-800 flex flex-col border-r border-slate-700 animate-slide-in md:animate-none">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700 safe-area-top">
        <h1 className="text-lg font-bold text-white flex items-center gap-2">
          <span className="text-xl">🎭</span>
          Joelememe inspi
        </h1>
        <button
          onClick={onClose}
          className="md:hidden touch-target flex items-center justify-center -mr-2"
          aria-label="Close menu"
        >
          <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* New Project */}
      <div className="p-4">
        {showNewProject ? (
          <form onSubmit={handleCreateProject} className="space-y-3">
            <input
              type="text"
              value={newProjectTitle}
              onChange={(e) => setNewProjectTitle(e.target.value)}
              placeholder="Project title..."
              autoFocus
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 touch-target"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-medium rounded-xl transition touch-target"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowNewProject(false)
                  setNewProjectTitle('')
                }}
                className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 active:bg-slate-500 text-white font-medium rounded-xl transition touch-target"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setShowNewProject(true)}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-medium rounded-xl transition flex items-center justify-center gap-2 touch-target"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Project
          </button>
        )}
      </div>

      {/* Projects List */}
      <div className="flex-1 overflow-y-auto px-2 pb-2">
        <h2 className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Projects
        </h2>
        <div className="space-y-1">
          {projects.length === 0 ? (
            <p className="px-4 py-3 text-sm text-slate-500">No projects yet</p>
          ) : (
            projects.map((project) => (
              <div
                key={project.id}
                className={`group flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition touch-target touch-manipulation ${
                  selectedProject?.id === project.id
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-300 md:hover:bg-slate-700 active:bg-slate-600'
                }`}
                onClick={() => onSelectProject(project)}
              >
                <div className="flex-1 min-w-0 pr-2">
                  <p className="font-medium truncate">{project.title}</p>
                  <p className={`text-xs truncate ${
                    selectedProject?.id === project.id ? 'text-indigo-200' : 'text-slate-500'
                  }`}>
                    by {project.profiles?.username || 'Unknown'}
                  </p>
                </div>
                {project.created_by === currentUserId && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      if (confirm('Delete this project?')) {
                        onDeleteProject(project.id)
                      }
                    }}
                    className={`p-2 rounded-lg opacity-0 md:group-hover:opacity-100 transition touch-target touch-manipulation ${
                      selectedProject?.id === project.id
                        ? 'md:hover:bg-indigo-700 active:bg-indigo-800 text-indigo-200'
                        : 'md:hover:bg-slate-600 active:bg-slate-500 text-slate-400'
                    }`}
                    aria-label="Delete project"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* User Section */}
      <div className="p-4 border-t border-slate-700 safe-area-bottom">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold shrink-0">
              {profile.username.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-white font-medium truncate">{profile.username}</p>
              <p className="text-xs text-slate-500">Online</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="p-3 text-slate-400 hover:text-white hover:bg-slate-700 active:bg-slate-600 rounded-xl transition touch-target"
            aria-label="Logout"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
