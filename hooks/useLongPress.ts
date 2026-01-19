import { useRef, useCallback } from 'react'

interface UseLongPressOptions {
  onLongPress: () => void
  onTap?: () => void
  delay?: number
  moveThreshold?: number
}

interface TouchPosition {
  x: number
  y: number
}

export function useLongPress({
  onLongPress,
  onTap,
  delay = 500,
  moveThreshold = 10,
}: UseLongPressOptions) {
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const touchStartRef = useRef<TouchPosition | null>(null)
  const longPressTriggeredRef = useRef(false)

  const clear = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0]
      touchStartRef.current = { x: touch.clientX, y: touch.clientY }
      longPressTriggeredRef.current = false

      timerRef.current = setTimeout(() => {
        longPressTriggeredRef.current = true
        // Haptic feedback if supported
        if (navigator.vibrate) {
          navigator.vibrate(50)
        }
        onLongPress()
      }, delay)
    },
    [onLongPress, delay]
  )

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStartRef.current) return

      const touch = e.touches[0]
      const deltaX = Math.abs(touch.clientX - touchStartRef.current.x)
      const deltaY = Math.abs(touch.clientY - touchStartRef.current.y)

      // Cancel long press if finger moved too much
      if (deltaX > moveThreshold || deltaY > moveThreshold) {
        clear()
      }
    },
    [clear, moveThreshold]
  )

  const handleTouchEnd = useCallback(() => {
    const wasLongPress = longPressTriggeredRef.current
    clear()
    touchStartRef.current = null

    // Trigger tap if it wasn't a long press
    if (!wasLongPress && onTap) {
      onTap()
    }
  }, [clear, onTap])

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
  }
}
