'use client'

import Image from 'next/image'
import { Message, Profile } from '@/lib/types'

interface MessageBubbleProps {
  message: Message & { profiles: Profile }
  isOwn: boolean
}

export default function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    }
  }

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex gap-2 max-w-[85%] md:max-w-[70%] ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar - smaller on mobile */}
        <div className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs md:text-sm font-bold ${
          isOwn ? 'bg-indigo-600' : 'bg-slate-600'
        }`}>
          {message.profiles.username.charAt(0).toUpperCase()}
        </div>

        {/* Message content */}
        <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} min-w-0`}>
          {/* Username and time */}
          <div className={`flex items-center gap-2 mb-1 text-xs ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
            <span className="text-slate-400 font-medium truncate max-w-[120px]">
              {message.profiles.username}
            </span>
            <span className="text-slate-500 shrink-0">
              {formatTime(message.created_at)}
            </span>
          </div>

          {/* Bubble */}
          <div className={`rounded-2xl px-3 py-2 md:px-4 md:py-2 ${
            isOwn
              ? 'bg-indigo-600 text-white rounded-tr-md'
              : 'bg-slate-700 text-slate-100 rounded-tl-md'
          }`}>
            {/* Image */}
            {message.image_url && (
              <div className={`${message.content ? 'mb-2' : ''} -mx-1 -mt-1`}>
                <div className="relative w-full rounded-xl overflow-hidden bg-slate-800">
                  <Image
                    src={message.image_url}
                    alt="Shared image"
                    width={400}
                    height={400}
                    className="object-contain w-full max-h-[300px] md:max-h-[400px] rounded-xl"
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
        </div>
      </div>
    </div>
  )
}
