import type { MonthData, Settings } from '../types'
import { calcTimeHours } from '../hooks/useCalculations'
import { countWorkingDaysRemaining } from '../hooks/useCalculations'
import { getDaysInMonth } from '../utils/dateUtils'
import { InfoIcon } from './Tooltip'

interface Props {
  month: number
  settings: Settings
  data: MonthData
}

export default function SummaryCards({ month, settings, data }: Props) {
  const monthData = data[month] ?? {}
  const daysInMonth = getDaysInMonth(settings.year, month)

  let totalLogged = 0
  for (let d = 1; d <= daysInMonth; d++) {
    if (monthData[d]) {
      totalLogged += calcTimeHours(monthData[d])
    }
  }
  totalLogged = Math.round(totalLogged * 100) / 100

  const remaining = Math.max(0, settings.monthlyTarget - totalLogged)
  const workingDaysLeft = countWorkingDaysRemaining(settings.year, month)
  const avgNeeded = workingDaysLeft > 0 ? remaining / workingDaysLeft : 0
  const avgRounded = Math.round(avgNeeded * 10) / 10

  const cards: {
    label: string
    value: string
    accent: boolean
    warn: boolean
    tooltip?: string
    hint: string
  }[] = [
    {
      label: 'Hours logged',
      value: totalLogged.toFixed(1),
      accent: false,
      warn: false,
      hint: 'from your time entries',
    },
    {
      label: 'Hours remaining',
      value: remaining.toFixed(1),
      accent: remaining > 0,
      warn: false,
      hint: 'to reach your goal',
    },
    {
      label: 'Working days left',
      value: String(workingDaysLeft),
      accent: false,
      warn: false,
      hint: 'Mon–Fri from today',
    },
    {
      label: 'Avg hrs/day needed',
      value: avgRounded.toFixed(1),
      accent: avgRounded > 0 && avgRounded <= 8,
      warn: avgRounded > 8,
      tooltip: 'How many hours per day you need to work to hit your monthly goal',
      hint: 'to finish on time',
    },
    {
      label: 'Monthly target',
      value: settings.monthlyTarget.toFixed(0),
      accent: false,
      warn: false,
      hint: 'set in Settings',
    },
  ]

  return (
    <div className="grid grid-cols-3 gap-3 px-4 py-4 sm:grid-cols-5">
      {cards.map(c => (
        <div
          key={c.label}
          className="bg-surface rounded-xl px-3 py-3 text-center"
        >
          <p className="text-eyebrows text-[10px] uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
            {c.label}
            {c.tooltip && <InfoIcon text={c.tooltip} position="bottom" />}
          </p>
          <p
            className={`font-display text-2xl font-bold ${
              c.warn
                ? 'text-rose'
                : c.accent
                  ? 'text-gold-solid'
                  : 'text-labels'
            }`}
          >
            {c.value}
          </p>
          <p className="summary-hint">{c.hint}</p>
        </div>
      ))}
    </div>
  )
}
