'use client'

import { useState, useEffect, useRef } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { Profile, Project, Message } from '@/lib/types'
import MessageBubble from './MessageBubble'
import MessageInput from './MessageInput'

interface ChatAreaProps {
  project: Project
  currentUser: User
  profile: Profile
}

export default function ChatArea({ project, currentUser, profile }: ChatAreaProps) {
  const [messages, setMessages] = useState<(Message & { profiles: Profile })[]>([])
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? 'smooth' : 'instant'
    })
  }

  useEffect(() => {
    const loadMessages = async () => {
      setLoading(true)
      const { data } = await supabase
        .from('messages')
        .select('*, profiles(*)')
        .eq('project_id', project.id)
        .order('created_at', { ascending: true }) as any

      if (data) {
        setMessages(data as (Message & { profiles: Profile })[])
      }
      setLoading(false)
      setTimeout(() => scrollToBottom(false), 100)
    }

    loadMessages()

    const channel = supabase
      .channel(`messages:${project.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `project_id=eq.${project.id}`,
        },
        async (payload) => {
          const { data } = await supabase
            .from('messages')
            .select('*, profiles(*)')
            .eq('id', (payload.new as any).id)
            .single() as any

          if (data) {
            setMessages((prev) => [...prev, data as Message & { profiles: Profile }])
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'messages',
          filter: `project_id=eq.${project.id}`,
        },
        (payload) => {
          setMessages((prev) => prev.filter((m) => m.id !== (payload.old as any).id))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [project.id, supabase])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (content: string, imageFile?: File) => {
    let imageUrl: string | null = null

    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop()
      const fileName = `${currentUser.id}/${Date.now()}.${fileExt}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('meme-images')
        .upload(fileName, imageFile)

      if (uploadError) {
        console.error('Upload error:', uploadError)
        return
      }

      const { data: urlData } = supabase.storage
        .from('meme-images')
        .getPublicUrl(uploadData.path)

      imageUrl = urlData.publicUrl
    }

    await supabase.from('messages').insert({
      project_id: project.id,
      user_id: currentUser.id,
      content: content || null,
      image_url: imageUrl,
    } as any)
  }

  return (
    <div className="h-full flex flex-col overflow-hidden bg-slate-900">
      {/* Desktop Header - hidden on mobile */}
      <div className="hidden md:flex items-center px-6 py-4 border-b border-slate-700 bg-slate-800 shrink-0">
        <div>
          <h2 className="text-lg font-semibold text-white">{project.title}</h2>
          <p className="text-sm text-slate-400">
            {messages.length} message{messages.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Messages - scrollable area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-500 border-t-transparent"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-500">
            <div className="text-center px-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-800 flex items-center justify-center">
                <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-base font-medium text-slate-400">No messages yet</p>
              <p className="text-sm mt-1 text-slate-500">Be the first to start!</p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwn={message.user_id === currentUser.id}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input - fixed at bottom, outside scroll area */}
      <div className="shrink-0 border-t border-slate-700 bg-slate-800">
        <MessageInput onSend={handleSendMessage} />
      </div>
    </div>
  )
}
