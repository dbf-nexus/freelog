import { useEffect, useCallback, useRef } from 'react'
import { useSettings } from './hooks/useSettings'
import { useMonthData } from './hooks/useMonthData'
import { useFavourites } from './hooks/useFavourites'
import { useToast } from './hooks/useToast'
import OnboardingWizard from './components/OnboardingWizard'
import MainView from './components/MainView'
import ToastContainer from './components/Toast'
import InstallBanner from './components/InstallBanner'
import type { Settings } from './types'

// Lazy-loaded to keep initial bundle small
const loadExportExcel = () => import('./utils/exportExcel')
const loadExportPDF = () => import('./utils/exportPDF')

function App() {
  const { settings, setSettings, updateSettings } = useSettings()
  const { data, setDay } = useMonthData()
  const { favourites, setMonthFavourites } = useFavourites()
  const { toasts, addToast, dismissToast } = useToast()
  const backupChecked = useRef(false)

  const handleToast = useCallback(
    (message: string, options?: { action?: { label: string; onClick: () => void }; duration?: number }) => {
      addToast(message, options)
    },
    [addToast],
  )

  // Backup reminder — once per session on mount
  useEffect(() => {
    if (backupChecked.current || !settings) return
    backupChecked.current = true

    const lastBackup = localStorage.getItem('freelog_backup_date')
    let daysAgo = -1
    if (lastBackup) {
      const diff = Date.now() - new Date(lastBackup).getTime()
      daysAgo = Math.floor(diff / (1000 * 60 * 60 * 24))
    }

    if (daysAgo < 0 || daysAgo >= 7) {
      const msg = daysAgo < 0
        ? 'Back up your data — you\'ve never backed up.'
        : `Back up your data — last backup was ${daysAgo} days ago.`
      // Small delay so it doesn't flash immediately
      setTimeout(() => {
        addToast(msg, {
          duration: 10000,
          action: {
            label: 'Back up now',
            onClick: () => {
              const backup = {
                freelog_settings: JSON.parse(localStorage.getItem('freelog_settings') || 'null'),
                freelog_data: JSON.parse(localStorage.getItem('freelog_data') || '{}'),
                freelog_favourites: JSON.parse(localStorage.getItem('freelog_favourites') || '{}'),
              }
              const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              const today = new Date().toISOString().slice(0, 10)
              a.href = url
              a.download = `freelog_backup_${today}.json`
              a.click()
              URL.revokeObjectURL(url)
              localStorage.setItem('freelog_backup_date', new Date().toISOString())
              addToast('Backup exported')
            },
          },
        })
      }, 2000)
    }
  }, [settings, addToast])

  const handleOnboardingComplete = (newSettings: Settings, favouriteIds: string[]) => {
    setSettings(newSettings)
    const currentMonth = new Date().getMonth()
    setMonthFavourites(currentMonth, favouriteIds)
  }

  const handleExportExcel = async () => {
    if (!settings) return
    const { exportExcel } = await loadExportExcel()
    exportExcel(settings, data, favourites)
    handleToast('Excel exported')
  }

  const handleExportPDF = async (month: number) => {
    if (!settings) return
    const { exportPDF } = await loadExportPDF()
    exportPDF(settings, data, favourites, month)
    handleToast('PDF exported')
  }

  if (!settings) {
    return <OnboardingWizard onComplete={handleOnboardingComplete} />
  }

  return (
    <>
      <InstallBanner />
      <MainView
        settings={settings}
        data={data}
        favourites={favourites}
        onDayChange={setDay}
        onUpdateSettings={updateSettings}
        onSetSettings={setSettings}
        onSetMonthFavourites={setMonthFavourites}
        onExportExcel={handleExportExcel}
        onExportPDF={handleExportPDF}
        onToast={handleToast}
      />
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </>
  )
}

export default App
