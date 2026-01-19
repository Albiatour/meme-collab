'use client'

import { REACTION_EMOJIS, ReactionEmoji } from '@/lib/types'

interface ReactionPickerProps {
  onSelect: (emoji: ReactionEmoji) => void
  onClose: () => void
}

export default function ReactionPicker({ onSelect, onClose }: ReactionPickerProps) {
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />

      {/* Picker */}
      <div className="absolute z-50 bg-slate-700 rounded-full px-2 py-1 shadow-lg border border-slate-600 animate-scale-in">
        <div className="flex items-center gap-1">
          {REACTION_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => {
                onSelect(emoji)
                onClose()
              }}
              className="w-10 h-10 flex items-center justify-center text-xl hover:bg-slate-600 active:bg-slate-500 rounded-full transition-transform hover:scale-110 active:scale-95"
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </>
  )
}
