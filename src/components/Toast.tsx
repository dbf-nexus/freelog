import { useEffect, useState } from 'react'

export interface ToastItem {
  id: string
  message: string
  action?: { label: string; onClick: () => void }
  duration?: number
}

interface Props {
  toasts: ToastItem[]
  onDismiss: (id: string) => void
}

function ToastEntry({ toast, onDismiss }: { toast: ToastItem; onDismiss: () => void }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Animate in
    requestAnimationFrame(() => setVisible(true))
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(onDismiss, 200) // wait for fade-out
    }, toast.duration ?? 5000)
    return () => clearTimeout(timer)
  }, [toast.duration, onDismiss])

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-lg border max-w-sm transition-all duration-200 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      }`}
      style={{
        backgroundColor: '#0a0f1e',
        borderColor: 'rgba(232, 197, 71, 0.3)',
      }}
    >
      <span className="text-white text-sm flex-1">{toast.message}</span>
      {toast.action && (
        <button
          onClick={() => {
            toast.action!.onClick()
            onDismiss()
          }}
          className="text-gold-solid text-sm font-semibold hover:text-gold-highlight transition-colors whitespace-nowrap"
        >
          {toast.action.label}
        </button>
      )}
      <button
        onClick={() => { setVisible(false); setTimeout(onDismiss, 200) }}
        className="text-labels hover:text-white transition-colors text-sm leading-none ml-1"
      >
        &times;
      </button>
    </div>
  )
}

export default function ToastContainer({ toasts, onDismiss }: Props) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-20 right-4 z-50 flex flex-col gap-2">
      {toasts.map(t => (
        <ToastEntry key={t.id} toast={t} onDismiss={() => onDismiss(t.id)} />
      ))}
    </div>
  )
}
