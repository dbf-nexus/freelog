import { useState, useCallback } from 'react'
import type { ToastItem } from '../components/Toast'

let counter = 0

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const addToast = useCallback(
    (message: string, options?: { action?: ToastItem['action']; duration?: number }) => {
      const id = `toast-${++counter}`
      setToasts(prev => [...prev, { id, message, ...options }])
      return id
    },
    [],
  )

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return { toasts, addToast, dismissToast }
}
