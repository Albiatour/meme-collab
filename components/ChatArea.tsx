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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    // Load initial messages
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
    }

    loadMessages()

    // Subscribe to new messages
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
          // Fetch the new message with profile info
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

    // Upload image if provided
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

    // Insert message
    await supabase.from('messages').insert({
      project_id: project.id,
      user_id: currentUser.id,
      content: content || null,
      image_url: imageUrl,
    } as any)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-700 bg-gray-800">
        <h2 className="text-lg font-semibold text-white">{project.title}</h2>
        <p className="text-sm text-gray-400">
          {messages.length} message{messages.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <p className="text-lg">No messages yet</p>
              <p className="text-sm">Be the first to start the conversation!</p>
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

      {/* Input */}
      <MessageInput onSend={handleSendMessage} />
    </div>
  )
}
