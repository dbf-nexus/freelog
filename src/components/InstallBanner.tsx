import { useState, useEffect, useRef } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const VISIT_KEY = 'freelog_visit_count'
const DISMISSED_KEY = 'freelog_install_dismissed'

export default function InstallBanner() {
  const [show, setShow] = useState(false)
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    // Already dismissed
    if (localStorage.getItem(DISMISSED_KEY) === 'true') return

    // Track visits
    const visits = parseInt(localStorage.getItem(VISIT_KEY) || '0', 10) + 1
    localStorage.setItem(VISIT_KEY, String(visits))

    // Only show after 3rd visit
    if (visits < 3) return

    const handler = (e: Event) => {
      e.preventDefault()
      deferredPrompt.current = e as BeforeInstallPromptEvent
      setShow(true)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt.current) return
    await deferredPrompt.current.prompt()
    const { outcome } = await deferredPrompt.current.userChoice
    if (outcome === 'accepted') {
      setShow(false)
    }
    deferredPrompt.current = null
  }

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, 'true')
    setShow(false)
  }

  if (!show) return null

  return (
    <div
      className="flex items-center justify-between gap-3 px-4 py-2.5 border-b text-sm"
      style={{
        backgroundColor: '#0a0f1e',
        borderColor: 'rgba(232, 197, 71, 0.2)',
      }}
    >
      <span className="text-body-text">
        Install <span className="text-white font-medium">Freelog</span> on your desktop for the best experience.
      </span>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={handleInstall}
          className="px-3 py-1 rounded-md bg-gold-solid text-deep-text text-xs font-semibold hover:bg-gold-highlight transition-colors"
        >
          Install
        </button>
        <button
          onClick={handleDismiss}
          className="text-labels hover:text-white text-xs transition-colors"
        >
          Not now
        </button>
      </div>
    </div>
  )
}
