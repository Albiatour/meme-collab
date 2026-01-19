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
      <div className={`flex gap-3 max-w-[70%] ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-sm font-bold ${
          isOwn ? 'bg-indigo-600' : 'bg-gray-600'
        }`}>
          {message.profiles.username.charAt(0).toUpperCase()}
        </div>

        {/* Message content */}
        <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
          {/* Username and time */}
          <div className={`flex items-center gap-2 mb-1 text-xs ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
            <span className="text-gray-400 font-medium">{message.profiles.username}</span>
            <span className="text-gray-500">{formatDate(message.created_at)} {formatTime(message.created_at)}</span>
          </div>

          {/* Bubble */}
          <div className={`rounded-2xl px-4 py-2 ${
            isOwn
              ? 'bg-indigo-600 text-white rounded-tr-sm'
              : 'bg-gray-700 text-gray-100 rounded-tl-sm'
          }`}>
            {/* Image */}
            {message.image_url && (
              <div className="mb-2 -mx-2 -mt-1">
                <div className="relative w-full max-w-xs rounded-xl overflow-hidden">
                  <Image
                    src={message.image_url}
                    alt="Shared image"
                    width={300}
                    height={300}
                    className="object-cover rounded-xl"
                    unoptimized
                  />
                </div>
              </div>
            )}

            {/* Text content */}
            {message.content && (
              <p className="whitespace-pre-wrap break-words">{message.content}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
