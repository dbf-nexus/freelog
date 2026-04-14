import { useState } from 'react'
import type { Settings, MonthData, MonthFavourites, DayEntry } from '../types'
import Header from './Header'
import MonthTabs from './MonthTabs'
import SummaryCards from './SummaryCards'
import TimesheetTable from './TimesheetTable'
import Legend from './Legend'
import SettingsPanel from './SettingsPanel'

interface Props {
  settings: Settings
  data: MonthData
  favourites: MonthFavourites
  onDayChange: (month: number, day: number, entry: DayEntry) => void
  onUpdateSettings: (partial: Partial<Settings>) => void
  onSetSettings: (settings: Settings) => void
  onSetMonthFavourites: (month: number, ids: string[]) => void
  onExportExcel: () => void
  onExportPDF: (month: number) => void
  onToast: (message: string) => void
}

export default function MainView({
  settings,
  data,
  favourites,
  onDayChange,
  onUpdateSettings,
  onSetSettings,
  onSetMonthFavourites,
  onExportExcel,
  onExportPDF,
  onToast,
}: Props) {
  const [activeMonth, setActiveMonth] = useState(new Date().getMonth())
  const [settingsOpen, setSettingsOpen] = useState(false)

  const monthFavIds = favourites[activeMonth] ?? []
  const favouriteActivities = settings.activities.filter(a => monthFavIds.includes(a.id))

  return (
    <div className="min-h-dvh flex flex-col">
      <Header
        name={settings.name}
        company={settings.company}
        onSettingsOpen={() => setSettingsOpen(true)}
        onExportExcel={onExportExcel}
        onExportPDF={() => onExportPDF(activeMonth)}
      />
      <MonthTabs
        activeMonth={activeMonth}
        onSelect={setActiveMonth}
        year={settings.year}
      />

      <div className="flex-1">
        <SummaryCards month={activeMonth} settings={settings} data={data} />
        <TimesheetTable
          year={settings.year}
          month={activeMonth}
          settings={settings}
          data={data}
          favouriteActivities={favouriteActivities}
          onDayChange={onDayChange}
        />
        <Legend />
      </div>

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

      <SettingsPanel
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        data={data}
        favourites={favourites}
        onUpdateSettings={onUpdateSettings}
        onSetSettings={onSetSettings}
        onSetMonthFavourites={onSetMonthFavourites}
        onToast={onToast}
      />
    </div>
  )
}
