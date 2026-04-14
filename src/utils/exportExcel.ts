import * as XLSX from 'xlsx-js-style'
import type { Settings, MonthData, MonthFavourites } from '../types'
import { getDaysInMonth, getDayName, getMonthName, isWeekend } from './dateUtils'
import { calcTimeHours, calcActivityTotal } from '../hooks/useCalculations'

export function exportExcel(
  settings: Settings,
  data: MonthData,
  favourites: MonthFavourites,
) {
  const wb = XLSX.utils.book_new()

  for (let m = 0; m < 12; m++) {
    const monthName = getMonthName(m)
    const daysInMonth = getDaysInMonth(settings.year, m)
    const monthData = data[m] ?? {}
    const favIds = favourites[m] ?? []
    const favActivities = settings.activities.filter(a => favIds.includes(a.id))

    const rows: (string | number)[][] = []

    // Header rows
    const title = settings.company
      ? `Freelog — ${settings.name} — ${settings.company}`
      : `Freelog — ${settings.name}`
    rows.push([title])
    rows.push([`${monthName} ${settings.year} — Goal: ${settings.monthlyTarget}h`])
    rows.push([]) // blank row

    // Column headers
    const headers: string[] = ['Date', 'Day']
    for (let s = 0; s < settings.shifts; s++) {
      headers.push(settings.shifts > 1 ? `Start ${s + 1}` : 'Start')
      headers.push(settings.shifts > 1 ? `End ${s + 1}` : 'End')
    }
    headers.push('Break (min)', 'Time Total')
    for (const act of favActivities) {
      headers.push(act.label)
    }
    headers.push('Activity Total')
    rows.push(headers)

    // Day rows
    let monthTimeTotal = 0
    let monthActTotal = 0
    const monthActTotals: Record<string, number> = {}
    for (const act of favActivities) monthActTotals[act.id] = 0

    for (let d = 1; d <= daysInMonth; d++) {
      const weekend = isWeekend(settings.year, m, d)
      const dayName = getDayName(settings.year, m, d)
      const entry = monthData[d]

      if (weekend || !entry) {
        const row: (string | number)[] = [d, dayName]
        // Fill remaining cols empty
        const emptyCols = settings.shifts * 2 + 1 + 1 + favActivities.length + 1
        for (let c = 0; c < emptyCols; c++) row.push('')
        rows.push(row)
        continue
      }

      const row: (string | number)[] = [d, dayName]
      for (let s = 0; s < settings.shifts; s++) {
        const block = entry.timeBlocks[s]
        row.push(block?.start || '')
        row.push(block?.end || '')
      }
      row.push(entry.breakMinutes || '')

      const timeH = calcTimeHours(entry)
      row.push(timeH > 0 ? timeH : '')
      monthTimeTotal += timeH

      for (const act of favActivities) {
        const h = entry.activityHours[act.id] || 0
        row.push(h > 0 ? h : '')
        monthActTotals[act.id] += h
      }

      const actH = calcActivityTotal(entry)
      row.push(actH > 0 ? actH : '')
      monthActTotal += actH

      rows.push(row)
    }

    // Total row
    const totalRow: (string | number)[] = ['MONTHLY TOTAL', '']
    for (let s = 0; s < settings.shifts; s++) {
      totalRow.push('', '')
    }
    totalRow.push('') // break
    totalRow.push(Math.round(monthTimeTotal * 100) / 100)
    for (const act of favActivities) {
      const t = monthActTotals[act.id]
      totalRow.push(t > 0 ? Math.round(t * 100) / 100 : '')
    }
    totalRow.push(Math.round(monthActTotal * 100) / 100)
    rows.push(totalRow)

    const ws = XLSX.utils.aoa_to_sheet(rows)

    // Bold header row (row index 3 = column labels)
    const headerRowIdx = 3
    for (let c = 0; c < headers.length; c++) {
      const cellRef = XLSX.utils.encode_cell({ r: headerRowIdx, c })
      if (ws[cellRef]) {
        ws[cellRef].s = { font: { bold: true } }
      }
    }

    // Auto-width columns
    const colWidths = headers.map((h, i) => {
      let max = h.length
      for (const row of rows) {
        const v = row[i]
        if (v !== undefined && v !== null) {
          max = Math.max(max, String(v).length)
        }
      }
      return { wch: Math.min(max + 2, 20) }
    })
    ws['!cols'] = colWidths

    XLSX.utils.book_append_sheet(wb, ws, monthName)
  }

  const fileName = `Freelog_${settings.name.replace(/\s+/g, '_')}_${settings.year}.xlsx`
  XLSX.writeFile(wb, fileName)
}
