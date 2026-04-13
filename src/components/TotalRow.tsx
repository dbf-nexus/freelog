import type { MonthData, Activity } from '../types'
import { calcTimeHours, calcActivityTotal } from '../hooks/useCalculations'
import { getDaysInMonth } from '../utils/dateUtils'

interface Props {
  year: number
  month: number
  shifts: 1 | 2 | 3
  data: MonthData
  favouriteActivities: Activity[]
}

export default function TotalRow({ year, month, shifts, data, favouriteActivities }: Props) {
  const daysInMonth = getDaysInMonth(year, month)
  const monthData = data[month] ?? {}

  let totalTime = 0
  let totalActivity = 0
  const activityTotals: Record<string, number> = {}

  for (const act of favouriteActivities) {
    activityTotals[act.id] = 0
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const entry = monthData[d]
    if (!entry) continue
    totalTime += calcTimeHours(entry)
    totalActivity += calcActivityTotal(entry)
    for (const act of favouriteActivities) {
      activityTotals[act.id] += entry.activityHours[act.id] || 0
    }
  }

  // Shift columns: each shift has Start + End = 2 cols
  const shiftColSpan = shifts * 2

  return (
    <tr className="bg-surface-elevated border-t-2 border-gold-solid/30">
      {/* Date + Day */}
      <td colSpan={2} className="px-2 py-2 text-xs font-semibold text-gold-solid uppercase tracking-wider">
        Total
      </td>

      {/* Shift columns (empty) */}
      <td colSpan={shiftColSpan} />

      {/* Break (empty) */}
      <td />

      {/* Time Sigma total */}
      <td className="px-2 py-2 text-center">
        <span className="font-display text-lg font-bold text-gold-gradient">
          {totalTime.toFixed(2)}
        </span>
      </td>

      {/* Activity totals */}
      {favouriteActivities.map(act => (
        <td key={act.id} className="px-2 py-2 text-center">
          <span className="font-display text-lg font-bold text-gold-gradient">
            {activityTotals[act.id] > 0 ? activityTotals[act.id].toFixed(2) : ''}
          </span>
        </td>
      ))}

      {/* Activity Sigma total */}
      <td className="px-2 py-2 text-center">
        <span className="font-display text-lg font-bold text-gold-gradient">
          {totalActivity.toFixed(2)}
        </span>
      </td>
    </tr>
  )
}
