import { useSettings } from './hooks/useSettings'
import { useMonthData } from './hooks/useMonthData'
import { useFavourites } from './hooks/useFavourites'
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

  // Placeholder — will be implemented in Task 2
  const handleExportExcel = () => {}
  const handleExportPDF = (_month: number) => {}

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
