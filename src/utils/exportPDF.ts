import type { Settings, MonthData, MonthFavourites } from '../types'
import { getDaysInMonth, getDayName, getMonthName, isWeekend } from './dateUtils'
import { calcTimeHours, calcActivityTotal, isDiscrepancy, countWorkingDaysRemaining } from '../hooks/useCalculations'

export function exportPDF(
  settings: Settings,
  data: MonthData,
  favourites: MonthFavourites,
  month: number,
) {
  const monthName = getMonthName(month)
  const daysInMonth = getDaysInMonth(settings.year, month)
  const monthData = data[month] ?? {}
  const favIds = favourites[month] ?? []
  const favActivities = settings.activities.filter(a => favIds.includes(a.id))

  const today = new Date()
  const exportDate = `${String(today.getDate()).padStart(2, '0')}.${String(today.getMonth() + 1).padStart(2, '0')}.${today.getFullYear()}`

  let totalLogged = 0
  for (let d = 1; d <= daysInMonth; d++) {
    if (monthData[d]) totalLogged += calcTimeHours(monthData[d])
  }
  totalLogged = Math.round(totalLogged * 100) / 100
  const remaining = Math.max(0, settings.monthlyTarget - totalLogged)
  const workDaysLeft = countWorkingDaysRemaining(settings.year, month)
  const avgNeeded = workDaysLeft > 0 ? Math.round((remaining / workDaysLeft) * 10) / 10 : 0

  // Build shift column headers
  const shiftHeaders: string[] = []
  for (let s = 0; s < settings.shifts; s++) {
    shiftHeaders.push(settings.shifts > 1 ? `Start ${s + 1}` : 'Start')
    shiftHeaders.push(settings.shifts > 1 ? `End ${s + 1}` : 'End')
  }

  // Build table rows
  let tableRows = ''
  let monthTimeTotal = 0
  let monthActTotal = 0
  const monthActTotals: Record<string, number> = {}
  for (const act of favActivities) monthActTotals[act.id] = 0

  for (let d = 1; d <= daysInMonth; d++) {
    const isWE = isWeekend(settings.year, month, d)
    const dayName = getDayName(settings.year, month, d)
    const entry = monthData[d]
    const ds = `${String(d).padStart(2, '0')}.${String(month + 1).padStart(2, '0')}.`

    if (isWE || !entry) {
      const emptyCols = settings.shifts * 2 + 1 + 1 + favActivities.length + 1
      const rowStyle = isWE ? ' class="weekend"' : ''
      tableRows += `<tr${rowStyle}><td>${ds}</td><td>${dayName}</td>${'<td></td>'.repeat(emptyCols)}</tr>\n`
      continue
    }

    const disc = isDiscrepancy(entry)
    const timeH = calcTimeHours(entry)
    const actH = calcActivityTotal(entry)
    monthTimeTotal += timeH

    let shiftCells = ''
    for (let s = 0; s < settings.shifts; s++) {
      const block = entry.timeBlocks[s]
      shiftCells += `<td>${block?.start || ''}</td><td>${block?.end || ''}</td>`
    }

    let actCells = ''
    for (const act of favActivities) {
      const h = entry.activityHours[act.id] || 0
      monthActTotals[act.id] += h
      actCells += `<td>${h > 0 ? h.toFixed(1) : ''}</td>`
    }
    monthActTotal += actH

    const rowClass = disc ? ' class="disc"' : ''
    const dateCell = disc ? `<td><strong>! ${ds}</strong></td>` : `<td>${ds}</td>`

    tableRows += `<tr${rowClass}>${dateCell}<td>${dayName}</td>${shiftCells}<td>${entry.breakMinutes > 0 ? entry.breakMinutes : ''}</td><td class="sigma">${timeH > 0 ? timeH.toFixed(2) : ''}</td>${actCells}<td class="sigma">${actH > 0 ? actH.toFixed(2) : ''}</td></tr>\n`
  }

  // Total row
  let totalActCells = ''
  for (const act of favActivities) {
    const t = monthActTotals[act.id]
    totalActCells += `<td>${t > 0 ? (Math.round(t * 100) / 100).toFixed(2) : ''}</td>`
  }
  tableRows += `<tr class="total-row"><td colspan="${2 + settings.shifts * 2 + 2}"><strong>MONTHLY TOTAL</strong></td><td class="sigma"><strong>${(Math.round(monthTimeTotal * 100) / 100).toFixed(2)}</strong></td>${totalActCells}<td class="sigma"><strong>${(Math.round(monthActTotal * 100) / 100).toFixed(2)}</strong></td></tr>\n`

  // Shift column headers
  const shiftHeaderCells = shiftHeaders.map(h => `<th>${h}</th>`).join('')
  const actHeaderCells = favActivities.map(a => `<th>${a.label}</th>`).join('')

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Freelog — ${monthName} ${settings.year}</title>
<style>
  @page { size: A4 landscape; margin: 12mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, Helvetica, Arial, sans-serif; font-size: 8pt; color: #000; }
  .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8mm; padding-bottom: 4mm; border-bottom: 1px solid #ccc; }
  .page-header h1 { font-size: 18pt; font-weight: 700; letter-spacing: -0.5px; }
  .page-header h1 span { color: #b8960c; }
  .meta-left p { font-size: 8pt; color: #555; line-height: 1.6; }
  .meta-right { text-align: right; font-size: 8pt; color: #555; line-height: 1.6; }
  .summary { display: flex; gap: 8mm; margin-bottom: 6mm; }
  .summary-item { border: 1px solid #ddd; border-radius: 4px; padding: 3mm 4mm; min-width: 28mm; }
  .summary-item .lbl { font-size: 6pt; text-transform: uppercase; color: #888; letter-spacing: 0.3px; }
  .summary-item .val { font-size: 12pt; font-weight: 700; color: #000; }
  table { width: 100%; border-collapse: collapse; font-size: 7pt; }
  th { background: #1a1a2e; color: #fff; font-weight: 600; padding: 2mm 1.5mm; text-align: center; font-size: 6.5pt; white-space: nowrap; border: 0.5px solid #333; }
  td { padding: 1.5mm 1.5mm; text-align: center; border: 0.5px solid #e0e0e0; }
  tr:nth-child(even) { background: #f8f8f8; }
  tr.weekend td { background: #eeeeee; color: #888; font-style: italic; }
  tr.disc td { background: #fff8e1; }
  tr.disc td:first-child { border-left: 2px solid #e6a817; }
  tr.total-row td { background: #e8e8e8; font-weight: 700; border-top: 1.5px solid #999; }
  td.sigma { background: #f0f4ff; font-weight: 600; }
  .print-footer { margin-top: 6mm; padding-top: 3mm; border-top: 1px solid #ddd; font-size: 6.5pt; color: #888; text-align: center; line-height: 1.6; }
  @media print { .no-print { display: none; } }
  .print-btn { position: fixed; top: 10px; right: 10px; padding: 8px 18px; background: #b8960c; color: #fff; border: none; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.2); }
</style>
</head>
<body>
<button class="print-btn no-print" onclick="window.print()">Save as PDF</button>
<div class="page-header">
  <div class="meta-left">
    <h1>Free<span>log</span></h1>
    <p>${settings.name}${settings.company ? ` &mdash; ${settings.company}` : ''}</p>
  </div>
  <div class="meta-right">
    <p><strong>${monthName} ${settings.year}</strong></p>
    <p>Monthly goal: ${settings.monthlyTarget}h</p>
    <p>Export date: ${exportDate}</p>
  </div>
</div>

<div class="summary">
  <div class="summary-item"><div class="lbl">Monthly goal</div><div class="val">${settings.monthlyTarget}h</div></div>
  <div class="summary-item"><div class="lbl">Total logged</div><div class="val">${totalLogged}h</div></div>
  <div class="summary-item"><div class="lbl">Hours remaining</div><div class="val">${remaining}h</div></div>
  <div class="summary-item"><div class="lbl">Working days left</div><div class="val">${workDaysLeft}</div></div>
  <div class="summary-item"><div class="lbl">Avg hrs/day needed</div><div class="val">${avgNeeded}h</div></div>
</div>

<table>
  <thead>
    <tr>
      <th>Date</th>
      <th>Day</th>
      ${shiftHeaderCells}
      <th>Break (min)</th>
      <th>Total Hours</th>
      ${actHeaderCells}
      <th>Activity Total</th>
    </tr>
  </thead>
  <tbody>
    ${tableRows}
  </tbody>
</table>

<div class="print-footer">
  Generated by Freelog &mdash; freelog.dbf-nexus.com &nbsp;|&nbsp; Developed by DBF Nexus &nbsp;|&nbsp; ${exportDate}<br>
  This document serves as a monthly work time record.
</div>
</body>
</html>`

  const printWindow = window.open('', '_blank', 'width=1200,height=800')
  if (!printWindow) {
    alert('Please allow popups for freelog.dbf-nexus.com to export PDF.')
    return
  }
  printWindow.document.write(html)
  printWindow.document.close()
  printWindow.focus()
}
