'use client'

import { useState } from 'react'
import { ReactionCount } from '@/lib/types'

interface MessageReactionsProps {
  reactions: ReactionCount[]
  onToggle: (emoji: string) => void
  isOwn: boolean
}

export default function MessageReactions({ reactions, onToggle, isOwn }: MessageReactionsProps) {
  const [tooltipEmoji, setTooltipEmoji] = useState<string | null>(null)

  if (reactions.length === 0) return null

  return (
    <div className={`flex flex-wrap gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
      {reactions.map(({ emoji, count, users, hasReacted }) => (
        <div key={emoji} className="relative">
          <button
            onClick={() => onToggle(emoji)}
            onMouseEnter={() => setTooltipEmoji(emoji)}
            onMouseLeave={() => setTooltipEmoji(null)}
            className={`
              flex items-center gap-1 px-2 py-0.5 rounded-full text-xs
              transition-all duration-200 animate-bounce-in
              ${hasReacted
                ? 'bg-indigo-500/30 border border-indigo-400/50 text-indigo-200'
                : 'bg-slate-600/50 border border-slate-500/30 text-slate-300 hover:bg-slate-600'
              }
            `}
          >
            <span className="text-sm">{emoji}</span>
            <span className="font-medium">{count}</span>
          </button>

          {/* Tooltip showing who reacted */}
          {tooltipEmoji === emoji && users.length > 0 && (
            <div className={`
              absolute bottom-full mb-1 px-2 py-1 rounded-lg
              bg-slate-900 text-xs text-slate-300 whitespace-nowrap
              shadow-lg border border-slate-700 z-50
              ${isOwn ? 'right-0' : 'left-0'}
            `}>
              {users.slice(0, 5).map(u => u.username).join(', ')}
              {users.length > 5 && ` +${users.length - 5}`}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
