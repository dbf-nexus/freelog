import { Fragment, useCallback } from 'react'
import type { DayEntry, Activity, TimeBlock } from '../types'
import { calcTimeHours, calcActivityTotal, isDiscrepancy } from '../hooks/useCalculations'
import { getDayName, isWeekend, isToday } from '../utils/dateUtils'
import Tooltip from './Tooltip'

interface Props {
  year: number
  month: number
  day: number
  shifts: 1 | 2 | 3
  entry: DayEntry
  favouriteActivities: Activity[]
  onChange: (entry: DayEntry) => void
}

export default function DayRow({
  year,
  month,
  day,
  shifts,
  entry,
  favouriteActivities,
  onChange,
}: Props) {
  const weekend = isWeekend(year, month, day)
  const today = isToday(year, month, day)
  const discrepancy = isDiscrepancy(entry)
  const timeSigma = calcTimeHours(entry)
  const actSigma = calcActivityTotal(entry)
  const hasAnyStart = entry.timeBlocks.some(b => b.start)
  const showEmptyHint = !weekend && !hasAnyStart && timeSigma === 0
  const dayName = getDayName(year, month, day)

  const updateTimeBlock = useCallback(
    (blockIdx: number, field: keyof TimeBlock, value: string) => {
      const newBlocks = entry.timeBlocks.map((b, i) =>
        i === blockIdx ? { ...b, [field]: value } : b,
      )
      onChange({ ...entry, timeBlocks: newBlocks })
    },
    [entry, onChange],
  )

  const updateBreak = useCallback(
    (value: string) => {
      const num = value === '' ? 0 : parseInt(value, 10)
      if (isNaN(num) || num < 0) return
      onChange({ ...entry, breakMinutes: num })
    },
    [entry, onChange],
  )

  const updateActivity = useCallback(
    (actId: string, value: string) => {
      const num = value === '' ? 0 : parseFloat(value)
      if (isNaN(num) || num < 0) return
      onChange({
        ...entry,
        activityHours: { ...entry.activityHours, [actId]: num },
      })
    },
    [entry, onChange],
  )

  // Row background
  let rowBg = ''
  let rowText = 'text-body-text'
  let dateBorder = ''
  if (weekend) {
    rowBg = 'bg-surface-weekend'
    rowText = 'text-labels/50'
  } else if (today) {
    rowBg = 'bg-gold-tint'
  } else if (discrepancy) {
    rowBg = 'bg-amber-tint'
    dateBorder = 'border-l-2 border-l-gold-solid'
  }

  const cellPad = 'px-2 py-1.5'
  const inputClass =
    'w-full bg-transparent border border-surface-elevated rounded px-1.5 py-1 text-xs font-mono text-white text-center focus:outline-none focus:border-gold-solid transition-colors'

  return (
    <tr className={`${rowBg} ${rowText} border-b border-surface-elevated/50`}>
      {/* Date */}
      <td className={`${cellPad} ${dateBorder} text-xs font-mono whitespace-nowrap`}>
        {day}
        {today && (
          <span className="ml-1 text-[9px] bg-gold-solid text-deep-text px-1 rounded font-sans font-semibold">
            today
          </span>
        )}
      </td>

      {/* Day name */}
      <td className={`${cellPad} text-xs`}>
        <span className="inline-flex items-center gap-1">
          {dayName}
          {discrepancy && (
            <Tooltip text="Your total hours and activity hours don't match. Check this row." position="right">
              <span
                aria-label="Hours discrepancy"
                className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-gold-solid text-deep-text text-[9px] font-bold cursor-help leading-none"
              >
                !
              </span>
            </Tooltip>
          )}
        </span>
        {discrepancy && (
          <span className="mobile-hint">Hours don't match — check activities</span>
        )}
      </td>

      {/* Shift blocks */}
      {Array.from({ length: shifts }, (_, i) => {
        const block = entry.timeBlocks[i] ?? { start: '', end: '' }
        return weekend ? (
          <td key={i} colSpan={2} className={`${cellPad} text-center text-xs`}>
            {i === 0 && 'Weekend'}
          </td>
        ) : (
          <Fragment key={i}>
            <td className={cellPad}>
              <input
                type="time"
                value={block.start}
                onChange={e => updateTimeBlock(i, 'start', e.target.value)}
                className={inputClass}
              />
            </td>
            <td className={cellPad}>
              <input
                type="time"
                value={block.end}
                onChange={e => updateTimeBlock(i, 'end', e.target.value)}
                className={inputClass}
              />
            </td>
          </Fragment>
        )
      })}

      {/* Break */}
      <td className={cellPad}>
        {!weekend && (
          <input
            type="number"
            min={0}
            step={5}
            value={entry.breakMinutes || ''}
            onChange={e => updateBreak(e.target.value)}
            placeholder="0"
            className={inputClass}
          />
        )}
      </td>

      {/* Total Hours */}
      <td className={`${cellPad} text-xs font-mono text-center font-medium ${timeSigma > 0 ? 'text-white' : ''}`}>
        {timeSigma > 0 ? (
          timeSigma.toFixed(2)
        ) : showEmptyHint ? (
          <span className="mobile-hint-inline">← enter times</span>
        ) : (
          ''
        )}
      </td>

      {/* Activity columns */}
      {favouriteActivities.map(act => (
        <td key={act.id} className={cellPad}>
          {!weekend && (
            <input
              type="number"
              min={0}
              step={0.25}
              value={entry.activityHours[act.id] || ''}
              onChange={e => updateActivity(act.id, e.target.value)}
              placeholder="0"
              className={inputClass}
            />
          )}
        </td>
      ))}

      {/* Activity Sigma */}
      <td className={`${cellPad} text-xs font-mono text-center font-medium ${actSigma > 0 ? 'text-white' : ''}`}>
        {actSigma > 0 ? actSigma.toFixed(2) : ''}
      </td>
    </tr>
  )
}
