import { useState, useCallback } from 'react'
import type { Settings } from '../types'

const STORAGE_KEY = 'freelog_settings'

function loadSettings(): Settings | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as Settings
  } catch {
    return null
  }
}

function saveSettings(settings: Settings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}

export function useSettings() {
  const [settings, setSettingsState] = useState<Settings | null>(loadSettings)

  const setSettings = useCallback((next: Settings) => {
    setSettingsState(next)
    saveSettings(next)
  }, [])

  const updateSettings = useCallback((partial: Partial<Settings>) => {
    setSettingsState(prev => {
      if (!prev) return prev
      const next = { ...prev, ...partial }
      saveSettings(next)
      return next
    })
  }, [])

  const clearSettings = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setSettingsState(null)
  }, [])

  return { settings, setSettings, updateSettings, clearSettings }
}
