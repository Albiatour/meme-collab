'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { Message, Profile, ReactionCount, ReactionEmoji } from '@/lib/types'
import ReactionPicker from './ReactionPicker'
import MessageReactions from './MessageReactions'
import ReplyPreview from './ReplyPreview'

interface MessageBubbleProps {
  message: Message & { profiles: Profile; reply_to?: Message & { profiles?: Profile } }
  isOwn: boolean
  reactions: ReactionCount[]
  onReact: (emoji: ReactionEmoji) => void
  onReply: () => void
  onScrollToMessage?: (messageId: string) => void
  currentUserId: string
}

export default function MessageBubble({
  message,
  isOwn,
  reactions,
  onReact,
  onReply,
  onScrollToMessage,
  currentUserId,
}: MessageBubbleProps) {
  const [showPicker, setShowPicker] = useState(false)
  const [showActions, setShowActions] = useState(false)
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null)
  const [swipeOffset, setSwipeOffset] = useState(0)
  const longPressTimer = useRef<NodeJS.Timeout | null>(null)
  const messageRef = useRef<HTMLDivElement>(null)

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Long press detection for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    setTouchStart({ x: touch.clientX, y: touch.clientY })

    longPressTimer.current = setTimeout(() => {
      // Haptic feedback if supported
      if (navigator.vibrate) {
        navigator.vibrate(50)
      }
      setShowPicker(true)
      setTouchStart(null)
    }, 500)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart) return

    const touch = e.touches[0]
    const deltaX = touch.clientX - touchStart.x
    const deltaY = Math.abs(touch.clientY - touchStart.y)

    // Cancel long press if moving
    if (Math.abs(deltaX) > 10 || deltaY > 10) {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current)
        longPressTimer.current = null
      }
    }

    // Swipe right to reply (only for non-own messages or any message)
    if (deltaX > 0 && deltaY < 30) {
      setSwipeOffset(Math.min(deltaX * 0.5, 60))
    }
  }

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }

    // Trigger reply if swiped enough
    if (swipeOffset > 40) {
      onReply()
    }

    setSwipeOffset(0)
    setTouchStart(null)
  }

  useEffect(() => {
    return () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current)
      }
    }
  }, [])

  const handleToggleReaction = (emoji: string) => {
    onReact(emoji as ReactionEmoji)
  }

  return (
    <div
      ref={messageRef}
      id={`message-${message.id}`}
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} relative message-bubble`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => {
        setShowActions(false)
        if (!showPicker) setShowPicker(false)
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onContextMenu={(e) => e.preventDefault()}
      style={{
        transform: `translateX(${swipeOffset}px)`,
        transition: swipeOffset === 0 ? 'transform 0.2s ease-out' : 'none',
      }}
    >
      {/* Swipe reply indicator */}
      {swipeOffset > 0 && (
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full pl-2 text-slate-400"
          style={{ opacity: Math.min(swipeOffset / 40, 1) }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
        </div>
      )}

      <div className={`flex gap-2 max-w-[85%] md:max-w-[70%] ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs md:text-sm font-bold ${
          isOwn ? 'bg-indigo-600' : 'bg-slate-600'
        }`}>
          {message.profiles.username.charAt(0).toUpperCase()}
        </div>

        {/* Message content */}
        <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} min-w-0 relative`}>
          {/* Username and time */}
          <div className={`flex items-center gap-2 mb-1 text-xs ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
            <span className="text-slate-400 font-medium truncate max-w-[120px]">
              {message.profiles.username}
            </span>
            <span className="text-slate-500 shrink-0">
              {formatTime(message.created_at)}
            </span>
          </div>

          {/* Desktop action buttons */}
          {showActions && (
            <div className={`hidden md:flex absolute top-0 ${isOwn ? 'left-0 -translate-x-full pr-2' : 'right-0 translate-x-full pl-2'} gap-1`}>
              <button
                onClick={() => setShowPicker(true)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition"
                title="Add reaction"
              >
                <span className="text-sm">😀</span>
              </button>
              <button
                onClick={onReply}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition"
                title="Reply"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
              </button>
            </div>
          )}

          {/* Reaction picker */}
          {showPicker && (
            <div className={`absolute ${isOwn ? 'right-0' : 'left-0'} bottom-full mb-2`}>
              <ReactionPicker
                onSelect={onReact}
                onClose={() => setShowPicker(false)}
              />
            </div>
          )}

          {/* Bubble */}
          <div className={`rounded-2xl px-3 py-2 md:px-4 md:py-2 ${
            isOwn
              ? 'bg-indigo-600 text-white rounded-tr-md'
              : 'bg-slate-700 text-slate-100 rounded-tl-md'
          }`}>
            {/* Reply preview */}
            {message.reply_to && (
              <ReplyPreview
                message={message.reply_to}
                variant="message"
                isOwn={isOwn}
                onClick={() => onScrollToMessage?.(message.reply_to!.id)}
              />
            )}

            {/* Image */}
            {message.image_url && (
              <div className={`${message.content ? 'mb-2' : ''} -mx-1 -mt-1`}>
                <div className="relative w-full rounded-xl overflow-hidden bg-slate-800">
                  <Image
                    src={message.image_url}
                    alt="Shared image"
                    width={400}
                    height={400}
                    className="object-contain w-full max-h-[300px] md:max-h-[400px] rounded-xl select-none"
                    style={{ WebkitTouchCallout: 'none' }}
                    draggable={false}
                    onContextMenu={(e) => e.preventDefault()}
                    unoptimized
                  />
                </div>
              </div>
            )}

            {/* Text content */}
            {message.content && (
              <p className="whitespace-pre-wrap break-words text-[15px] leading-relaxed">
                {message.content}
              </p>
            )}
          </div>

          {/* Reactions */}
          <MessageReactions
            reactions={reactions}
            onToggle={handleToggleReaction}
            isOwn={isOwn}
          />
        </div>
      </div>
    </div>
  )
}
