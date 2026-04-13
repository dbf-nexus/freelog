import { useSettings } from './hooks/useSettings'
import { useFavourites } from './hooks/useFavourites'
import OnboardingWizard from './components/OnboardingWizard'
import type { Settings } from './types'

function App() {
  const { settings, setSettings } = useSettings()
  const { setMonthFavourites } = useFavourites()

  const handleOnboardingComplete = (newSettings: Settings, favouriteIds: string[]) => {
    setSettings(newSettings)
    const currentMonth = new Date().getMonth()
    setMonthFavourites(currentMonth, favouriteIds)
  }

  if (!settings) {
    return <OnboardingWizard onComplete={handleOnboardingComplete} />
  }

  return (
    <div className="min-h-dvh flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-surface-elevated">
        <h1 className="font-display text-2xl font-bold tracking-tight">
          <span className="text-white">Free</span>
          <span className="text-gold-gradient">log</span>
        </h1>
        <div className="flex items-center gap-3">
          <span className="text-body-text text-sm">{settings.name}</span>
        </div>
      </header>

      {/* Main content — placeholder for Task 4 */}
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-labels text-sm uppercase tracking-widest">
            Your hours. Your proof. Your freedom.
          </p>
          <p className="text-body-text text-sm">
            {settings.monthlyTarget}h target · {settings.shifts} shift{settings.shifts > 1 ? 's' : ''} · {settings.activities.length} activities
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 text-center text-labels text-xs border-t border-surface-elevated">
        Developed by{' '}
        <a
          href="https://dbf-nexus.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gold-solid hover:text-gold-highlight transition-colors"
        >
          DBF Nexus
        </a>
        {' '}&mdash; dbf-nexus.com
      </footer>
    </div>
  )
}

export default App
