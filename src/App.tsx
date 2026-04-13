import { useSettings } from './hooks/useSettings'
import { useMonthData } from './hooks/useMonthData'
import { useFavourites } from './hooks/useFavourites'
import OnboardingWizard from './components/OnboardingWizard'
import MainView from './components/MainView'
import type { Settings } from './types'

function App() {
  const { settings, setSettings } = useSettings()
  const { data, setDay } = useMonthData()
  const { favourites, setMonthFavourites } = useFavourites()

  const handleOnboardingComplete = (newSettings: Settings, favouriteIds: string[]) => {
    setSettings(newSettings)
    const currentMonth = new Date().getMonth()
    setMonthFavourites(currentMonth, favouriteIds)
  }

  if (!settings) {
    return <OnboardingWizard onComplete={handleOnboardingComplete} />
  }

  return (
    <MainView
      settings={settings}
      data={data}
      favourites={favourites}
      onDayChange={setDay}
    />
  )
}

export default App
