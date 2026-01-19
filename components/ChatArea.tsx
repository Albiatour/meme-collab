'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { Profile, Project, Message, Reaction, ReactionCount, ReactionEmoji } from '@/lib/types'
import MessageBubble from './MessageBubble'
import MessageInput from './MessageInput'

interface ChatAreaProps {
  project: Project
  currentUser: User
  profile: Profile
}

type MessageWithRelations = Message & {
  profiles: Profile
  reply_to?: Message & { profiles?: Profile }
}

export default function ChatArea({ project, currentUser, profile }: ChatAreaProps) {
  const [messages, setMessages] = useState<MessageWithRelations[]>([])
  const [reactions, setReactions] = useState<Record<string, Reaction[]>>({})
  const [loading, setLoading] = useState(true)
  const [replyTo, setReplyTo] = useState<MessageWithRelations | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? 'smooth' : 'instant'
    })
  }, [])

  const scrollToMessage = useCallback((messageId: string) => {
    const element = document.getElementById(`message-${messageId}`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      // Highlight effect
      element.classList.add('bg-indigo-500/20')
      setTimeout(() => element.classList.remove('bg-indigo-500/20'), 1500)
    }
  }, [])

  // Get reaction counts for a message
  const getReactionCounts = useCallback((messageId: string): ReactionCount[] => {
    const messageReactions = reactions[messageId] || []
    const countMap = new Map<string, { count: number; users: { id: string; username: string }[]; hasReacted: boolean }>()

    messageReactions.forEach((r) => {
      const existing = countMap.get(r.emoji)
      if (existing) {
        existing.count++
        existing.users.push({ id: r.user_id, username: r.profiles?.username || 'Unknown' })
        if (r.user_id === currentUser.id) existing.hasReacted = true
      } else {
        countMap.set(r.emoji, {
          count: 1,
          users: [{ id: r.user_id, username: r.profiles?.username || 'Unknown' }],
          hasReacted: r.user_id === currentUser.id,
        })
      }
    })

    return Array.from(countMap.entries()).map(([emoji, data]) => ({
      emoji,
      ...data,
    }))
  }, [reactions, currentUser.id])

  // Load messages and reactions
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)

      // Load messages with reply_to
      const { data: messagesData } = await supabase
        .from('messages')
        .select(`
          *,
          profiles(*),
          reply_to:reply_to_id(*, profiles(*))
        `)
        .eq('project_id', project.id)
        .order('created_at', { ascending: true }) as any

      if (messagesData) {
        setMessages(messagesData)

        // Load reactions for all messages
        const messageIds = messagesData.map((m: Message) => m.id)
        if (messageIds.length > 0) {
          const { data: reactionsData } = await supabase
            .from('reactions')
            .select('*, profiles(username)')
            .in('message_id', messageIds) as any

          if (reactionsData) {
            const grouped: Record<string, Reaction[]> = {}
            reactionsData.forEach((r: Reaction) => {
              if (!grouped[r.message_id]) grouped[r.message_id] = []
              grouped[r.message_id].push(r)
            })
            setReactions(grouped)
          }
        }
      }

      setLoading(false)
      setTimeout(() => scrollToBottom(false), 100)
    }

    loadData()

    // Subscribe to new messages
    const messagesChannel = supabase
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
            .select(`
              *,
              profiles(*),
              reply_to:reply_to_id(*, profiles(*))
            `)
            .eq('id', (payload.new as any).id)
            .single() as any

          if (data) {
            setMessages((prev) => [...prev, data])
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
          setReactions((prev) => {
            const newReactions = { ...prev }
            delete newReactions[(payload.old as any).id]
            return newReactions
          })
        }
      )
      .subscribe()

    // Subscribe to reactions
    const reactionsChannel = supabase
      .channel(`reactions:${project.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reactions',
        },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            const { data } = await supabase
              .from('reactions')
              .select('*, profiles(username)')
              .eq('id', (payload.new as any).id)
              .single() as any

            if (data) {
              setReactions((prev) => ({
                ...prev,
                [data.message_id]: [...(prev[data.message_id] || []), data],
              }))
            }
          } else if (payload.eventType === 'DELETE') {
            const oldReaction = payload.old as any
            setReactions((prev) => ({
              ...prev,
              [oldReaction.message_id]: (prev[oldReaction.message_id] || []).filter(
                (r) => r.id !== oldReaction.id
              ),
            }))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(messagesChannel)
      supabase.removeChannel(reactionsChannel)
    }
  }, [project.id, supabase, scrollToBottom])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

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
      reply_to_id: replyTo?.id || null,
    } as any)

    setReplyTo(null)
  }

  const handleReact = async (messageId: string, emoji: ReactionEmoji) => {
    const existingReaction = (reactions[messageId] || []).find(
      (r) => r.user_id === currentUser.id && r.emoji === emoji
    )

    if (existingReaction) {
      // Remove reaction
      await supabase.from('reactions').delete().eq('id', existingReaction.id)
    } else {
      // Add reaction
      await supabase.from('reactions').insert({
        message_id: messageId,
        user_id: currentUser.id,
        emoji,
      } as any)
    }
  }

  const handleReply = (message: MessageWithRelations) => {
    setReplyTo(message)
  }

  return (
    <div className="h-full flex flex-col overflow-hidden bg-slate-900">
      {/* Desktop Header */}
      <div className="hidden md:flex items-center px-6 py-4 border-b border-slate-700 bg-slate-800 shrink-0">
        <div>
          <h2 className="text-lg font-semibold text-white">{project.title}</h2>
          <p className="text-sm text-slate-400">
            {messages.length} message{messages.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
      >
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
              reactions={getReactionCounts(message.id)}
              onReact={(emoji) => handleReact(message.id, emoji)}
              onReply={() => handleReply(message)}
              onScrollToMessage={scrollToMessage}
              currentUserId={currentUser.id}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 border-t border-slate-700 bg-slate-800">
        <MessageInput
          onSend={handleSendMessage}
          replyTo={replyTo}
          onCancelReply={() => setReplyTo(null)}
        />
      </div>
    </div>
  )
}
