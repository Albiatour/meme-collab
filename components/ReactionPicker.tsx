'use client'

import { useEffect } from 'react'
import { REACTION_EMOJIS, ReactionEmoji } from '@/lib/types'

interface ReactionPickerProps {
  onSelect: (emoji: ReactionEmoji) => void
  onReply: () => void
  onClose: () => void
  messageContent?: string | null
}

export default function ReactionPicker({ onSelect, onReply, onClose, messageContent }: ReactionPickerProps) {
  // Add/remove body class to prevent scroll
  useEffect(() => {
    document.body.classList.add('menu-open')
    return () => {
      document.body.classList.remove('menu-open')
    }
  }, [])

  const handleCopy = async () => {
    if (messageContent) {
      try {
        await navigator.clipboard.writeText(messageContent)
      } catch (err) {
        console.error('Failed to copy:', err)
      }
    }
    onClose()
  }

  const handleReply = () => {
    onReply()
    onClose()
  }

  return (
    <>
      {/* Dark backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50"
        onClick={onClose}
      />

      {/* Menu - fixed centered */}
      <div className="fixed left-4 right-4 top-1/2 -translate-y-1/2 z-50 flex justify-center">
        <div className="bg-slate-800 rounded-2xl shadow-xl border border-slate-700 overflow-hidden animate-scale-in w-full max-w-[280px]">
          {/* Reactions row */}
          <div className="flex items-center justify-between px-2 py-2 border-b border-slate-700">
            {REACTION_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  onSelect(emoji)
                  onClose()
                }}
                className="w-10 h-10 flex items-center justify-center text-2xl hover:bg-slate-700 active:bg-slate-600 rounded-full transition-transform active:scale-90"
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="py-1">
            <button
              onClick={handleReply}
              className="w-full px-4 py-3 flex items-center gap-3 text-left text-white hover:bg-slate-700 active:bg-slate-600 transition"
            >
              <span className="text-lg">↩️</span>
              <span className="text-[15px]">Répondre</span>
            </button>
            {messageContent && (
              <button
                onClick={handleCopy}
                className="w-full px-4 py-3 flex items-center gap-3 text-left text-white hover:bg-slate-700 active:bg-slate-600 transition"
              >
                <span className="text-lg">📋</span>
                <span className="text-[15px]">Copier le texte</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
