import { Fragment } from 'react'
import type { Settings, MonthData, Activity, DayEntry, TimeBlock } from '../types'
import { getDaysInMonth } from '../utils/dateUtils'
import DayRow from './DayRow'
import TotalRow from './TotalRow'

interface Props {
  year: number
  month: number
  settings: Settings
  data: MonthData
  favouriteActivities: Activity[]
  onDayChange: (month: number, day: number, entry: DayEntry) => void
}

function createEmptyEntry(shifts: number): DayEntry {
  const timeBlocks: TimeBlock[] = Array.from({ length: shifts }, () => ({
    start: '',
    end: '',
  }))
  return { timeBlocks, breakMinutes: 0, activityHours: {} }
}

export default function TimesheetTable({
  year,
  month,
  settings,
  data,
  favouriteActivities,
  onDayChange,
}: Props) {
  const daysInMonth = getDaysInMonth(year, month)
  const monthData = data[month] ?? {}
  const shifts = settings.shifts

  return (
    <div className="overflow-x-auto px-4">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-surface border-b border-surface-elevated">
            <th className="px-2 py-2 text-left text-[10px] text-eyebrows uppercase tracking-wider font-medium w-12">
              Date
            </th>
            <th className="px-2 py-2 text-left text-[10px] text-eyebrows uppercase tracking-wider font-medium w-10">
              Day
            </th>
            {/* Shift headers */}
            {Array.from({ length: shifts }, (_, i) => (
              <Fragment key={i}>
                <th className="px-2 py-2 text-center text-[10px] text-eyebrows uppercase tracking-wider font-medium">
                  Start {shifts > 1 ? i + 1 : ''}
                </th>
                <th className="px-2 py-2 text-center text-[10px] text-eyebrows uppercase tracking-wider font-medium">
                  End {shifts > 1 ? i + 1 : ''}
                </th>
              </Fragment>
            ))}
            <th className="px-2 py-2 text-center text-[10px] text-eyebrows uppercase tracking-wider font-medium">
              Break
            </th>
            <th className="px-2 py-2 text-center text-[10px] text-gold-solid uppercase tracking-wider font-semibold">
              Time &Sigma;
            </th>
            {/* Activity headers */}
            {favouriteActivities.map(act => (
              <th
                key={act.id}
                className="px-2 py-2 text-center text-[10px] uppercase tracking-wider font-medium"
                style={{ color: act.colour }}
              >
                {act.label}
              </th>
            ))}
            <th className="px-2 py-2 text-center text-[10px] text-gold-solid uppercase tracking-wider font-semibold">
              Act &Sigma;
            </th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1
            const entry = monthData[day] ?? createEmptyEntry(shifts)
            // Ensure timeBlocks length matches shifts
            const normalizedEntry = {
              ...entry,
              timeBlocks: Array.from({ length: shifts }, (_, j) =>
                entry.timeBlocks[j] ?? { start: '', end: '' },
              ),
            }
            return (
              <DayRow
                key={day}
                year={year}
                month={month}
                day={day}
                shifts={shifts}
                entry={normalizedEntry}
                favouriteActivities={favouriteActivities}
                onChange={updated => onDayChange(month, day, updated)}
              />
            )
          })}
        </tbody>
        <tfoot>
          <TotalRow
            year={year}
            month={month}
            shifts={shifts}
            data={data}
            favouriteActivities={favouriteActivities}
          />
        </tfoot>
      </table>
    </div>
  )
}
