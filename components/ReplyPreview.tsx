'use client'

import { Message, Profile } from '@/lib/types'

interface ReplyPreviewProps {
  message: Message & { profiles?: Profile }
  onCancel?: () => void
  onClick?: () => void
  variant: 'input' | 'message'
  isOwn?: boolean
}

export default function ReplyPreview({ message, onCancel, onClick, variant, isOwn }: ReplyPreviewProps) {
  const truncate = (text: string | null, maxLength: number) => {
    if (!text) return ''
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength) + '...'
  }

  if (variant === 'input') {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-slate-700/50 border-l-2 border-indigo-500 rounded-r-lg mb-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-indigo-400 font-medium">
            Replying to {message.profiles?.username || 'Unknown'}
          </p>
          <p className="text-sm text-slate-400 truncate">
            {message.image_url ? '📷 Photo' : truncate(message.content, 50)}
          </p>
        </div>
        {onCancel && (
          <button
            onClick={onCancel}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-600 rounded-lg transition touch-target shrink-0"
            aria-label="Cancel reply"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    )
  }

  // variant === 'message'
  return (
    <button
      onClick={onClick}
      className={`
        flex items-start gap-2 px-2 py-1.5 mb-1 rounded-lg text-left w-full
        transition-colors
        ${isOwn
          ? 'bg-indigo-700/30 hover:bg-indigo-700/50'
          : 'bg-slate-600/30 hover:bg-slate-600/50'
        }
      `}
    >
      <div className={`w-0.5 h-full min-h-[28px] rounded-full shrink-0 ${isOwn ? 'bg-indigo-400' : 'bg-slate-400'}`} />
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-medium ${isOwn ? 'text-indigo-300' : 'text-slate-400'}`}>
          {message.profiles?.username || 'Unknown'}
        </p>
        <p className={`text-xs truncate ${isOwn ? 'text-indigo-200/70' : 'text-slate-400/70'}`}>
          {message.image_url ? '📷 Photo' : truncate(message.content, 40)}
        </p>
      </div>
    </button>
  )
}
