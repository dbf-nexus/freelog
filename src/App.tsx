import { useSettings } from './hooks/useSettings'
import { useMonthData } from './hooks/useMonthData'
import { useFavourites } from './hooks/useFavourites'
// Lazy-loaded to keep initial bundle small
const loadExportExcel = () => import('./utils/exportExcel')
const loadExportPDF = () => import('./utils/exportPDF')
import OnboardingWizard from './components/OnboardingWizard'
import MainView from './components/MainView'
import type { Settings } from './types'

function App() {
  const { settings, setSettings, updateSettings } = useSettings()
  const { data, setDay } = useMonthData()
  const { favourites, setMonthFavourites } = useFavourites()

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

  // Placeholder — will be replaced by toast system in Task 3
  const handleToast = (_message: string) => {}

  if (!settings) {
    return <OnboardingWizard onComplete={handleOnboardingComplete} />
  }

  return (
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
  )
}

export default App
