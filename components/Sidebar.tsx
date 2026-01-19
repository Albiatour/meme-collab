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
    <div className="w-72 h-screen bg-gray-800 flex flex-col border-r border-gray-700">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="text-2xl">🎭</span>
          Joelememe inspi
        </h1>
      </div>

      {/* New Project Button */}
      <div className="p-4">
        {showNewProject ? (
          <form onSubmit={handleCreateProject} className="space-y-2">
            <input
              type="text"
              value={newProjectTitle}
              onChange={(e) => setNewProjectTitle(e.target.value)}
              placeholder="Project title..."
              autoFocus
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowNewProject(false)
                  setNewProjectTitle('')
                }}
                className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setShowNewProject(true)}
            className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Project
          </button>
        )}
      </div>

      {/* Projects List */}
      <div className="flex-1 overflow-y-auto p-2">
        <h2 className="px-2 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Projects
        </h2>
        <div className="space-y-1 mt-2">
          {projects.length === 0 ? (
            <p className="px-3 py-2 text-sm text-gray-500">No projects yet</p>
          ) : (
            projects.map((project) => (
              <div
                key={project.id}
                className={`group flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition ${
                  selectedProject?.id === project.id
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
                onClick={() => onSelectProject(project)}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{project.title}</p>
                  <p className={`text-xs truncate ${
                    selectedProject?.id === project.id ? 'text-indigo-200' : 'text-gray-500'
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
                    className={`p-1 rounded opacity-0 group-hover:opacity-100 transition ${
                      selectedProject?.id === project.id
                        ? 'hover:bg-indigo-700 text-indigo-200'
                        : 'hover:bg-gray-600 text-gray-400'
                    }`}
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

      {/* User section */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
              {profile.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-white font-medium">{profile.username}</p>
              <p className="text-xs text-gray-400">Online</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition"
            title="Logout"
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
