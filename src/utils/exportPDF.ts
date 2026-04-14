import jsPDF from 'jspdf'
import 'jspdf-autotable'
import type { Settings, MonthData, MonthFavourites } from '../types'
import { getDaysInMonth, getDayName, getMonthName, isWeekend } from './dateUtils'
import { calcTimeHours, calcActivityTotal, isDiscrepancy, countWorkingDaysRemaining } from '../hooks/useCalculations'

// Extend jsPDF type for autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: Record<string, unknown>) => jsPDF
    lastAutoTable: { finalY: number }
  }
}

export function exportPDF(
  settings: Settings,
  data: MonthData,
  favourites: MonthFavourites,
  month: number,
) {
  const doc = new jsPDF({ orientation: 'landscape', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const monthName = getMonthName(month)
  const daysInMonth = getDaysInMonth(settings.year, month)
  const monthData = data[month] ?? {}
  const favIds = favourites[month] ?? []
  const favActivities = settings.activities.filter(a => favIds.includes(a.id))

  const today = new Date()
  const exportDate = `${String(today.getDate()).padStart(2, '0')}.${String(today.getMonth() + 1).padStart(2, '0')}.${today.getFullYear()}`

  // --- Page header ---
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('FREELOG', 14, 18)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(settings.name, 14, 25)
  if (settings.company) {
    doc.text(settings.company, 14, 30)
  }

  // Right side
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text(`${monthName} ${settings.year}`, pageWidth - 14, 18, { align: 'right' })
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(`Monthly Goal: ${settings.monthlyTarget}h`, pageWidth - 14, 24, { align: 'right' })
  doc.text(`Export date: ${exportDate}`, pageWidth - 14, 29, { align: 'right' })

  // --- Summary table ---
  let totalLogged = 0
  for (let d = 1; d <= daysInMonth; d++) {
    if (monthData[d]) totalLogged += calcTimeHours(monthData[d])
  }
  totalLogged = Math.round(totalLogged * 100) / 100
  const remaining = Math.max(0, settings.monthlyTarget - totalLogged)
  const workDaysLeft = countWorkingDaysRemaining(settings.year, month)
  const avgNeeded = workDaysLeft > 0 ? Math.round((remaining / workDaysLeft) * 10) / 10 : 0

  const startY = settings.company ? 36 : 33

  doc.autoTable({
    startY,
    head: [['', '']],
    body: [
      ['Monthly goal', `${settings.monthlyTarget}h`],
      ['Total logged', `${totalLogged}h`],
      ['Hours remaining', `${remaining}h`],
      ['Working days left', String(workDaysLeft)],
      ['Avg hrs/day needed', `${avgNeeded}h`],
    ],
    theme: 'plain',
    styles: { fontSize: 8, cellPadding: 1.5 },
    headStyles: { fillColor: false, textColor: [100, 100, 100], fontSize: 7 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 40 },
      1: { cellWidth: 30 },
    },
    margin: { left: 14 },
    tableWidth: 70,
    showHead: false,
  })

  // --- Main timesheet table ---
  const headers: string[] = ['Date', 'Day']
  for (let s = 0; s < settings.shifts; s++) {
    headers.push(settings.shifts > 1 ? `Start ${s + 1}` : 'Start')
    headers.push(settings.shifts > 1 ? `End ${s + 1}` : 'End')
  }
  headers.push('Break', 'Time \u03A3')
  for (const act of favActivities) {
    headers.push(act.label)
  }
  headers.push('Act \u03A3')

  const bodyRows: (string | number)[][] = []
  let monthTimeTotal = 0
  let monthActTotal = 0
  const monthActTotals: Record<string, number> = {}
  for (const act of favActivities) monthActTotals[act.id] = 0

  for (let d = 1; d <= daysInMonth; d++) {
    const isWE = isWeekend(settings.year, month, d)
    const dayName = getDayName(settings.year, month, d)
    const entry = monthData[d]

    if (isWE || !entry) {
      const row: (string | number)[] = [isWE ? String(d) : String(d), dayName]
      const emptyCols = settings.shifts * 2 + 1 + 1 + favActivities.length + 1
      for (let c = 0; c < emptyCols; c++) row.push('')
      bodyRows.push(row)
      continue
    }

    const disc = isDiscrepancy(entry)
    const row: (string | number)[] = [disc ? `! ${d}` : String(d), dayName]
    for (let s = 0; s < settings.shifts; s++) {
      const block = entry.timeBlocks[s]
      row.push(block?.start || '')
      row.push(block?.end || '')
    }
    row.push(entry.breakMinutes > 0 ? entry.breakMinutes : '')

    const timeH = calcTimeHours(entry)
    row.push(timeH > 0 ? timeH.toFixed(2) : '')
    monthTimeTotal += timeH

    for (const act of favActivities) {
      const h = entry.activityHours[act.id] || 0
      row.push(h > 0 ? h.toFixed(2) : '')
      monthActTotals[act.id] += h
    }

    const actH = calcActivityTotal(entry)
    row.push(actH > 0 ? actH.toFixed(2) : '')
    monthActTotal += actH

    bodyRows.push(row)
  }

  // Total row
  const totalRow: (string | number)[] = ['TOTAL', '']
  for (let s = 0; s < settings.shifts; s++) {
    totalRow.push('', '')
  }
  totalRow.push('') // break
  totalRow.push((Math.round(monthTimeTotal * 100) / 100).toFixed(2))
  for (const act of favActivities) {
    const t = monthActTotals[act.id]
    totalRow.push(t > 0 ? (Math.round(t * 100) / 100).toFixed(2) : '')
  }
  totalRow.push((Math.round(monthActTotal * 100) / 100).toFixed(2))
  bodyRows.push(totalRow)

  const tableStartY = doc.lastAutoTable.finalY + 6

  doc.autoTable({
    startY: tableStartY,
    head: [headers],
    body: bodyRows,
    theme: 'striped',
    styles: { fontSize: 7, cellPadding: 1.5, overflow: 'linebreak' },
    headStyles: {
      fillColor: [15, 23, 42], // surface
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 6.5,
    },
    alternateRowStyles: { fillColor: [245, 245, 248] },
    margin: { left: 14, right: 14 },
    didParseCell: (hookData: { section: string; row: { index: number }; cell: { styles: Record<string, unknown> } }) => {
      const { section, row, cell } = hookData
      if (section !== 'body') return
      const rowIdx = row.index
      const d = rowIdx + 1

      // Last row = total
      if (rowIdx === bodyRows.length - 1) {
        cell.styles.fontStyle = 'bold'
        cell.styles.fillColor = [230, 230, 235]
        return
      }

      // Weekend rows
      if (d <= daysInMonth && isWeekend(settings.year, month, d)) {
        cell.styles.fillColor = [235, 235, 240]
        cell.styles.fontStyle = 'italic'
        cell.styles.textColor = [150, 150, 160]
        return
      }

      // Discrepancy rows
      if (monthData[d] && isDiscrepancy(monthData[d])) {
        cell.styles.fillColor = [255, 248, 225]
      }
    },
    didDrawPage: () => {
      // Footer on every page
      const pageHeight = doc.internal.pageSize.getHeight()
      doc.setFontSize(7)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(130, 130, 140)
      doc.text(
        `Generated by Freelog — freelog.dbf-nexus.com | Developed by DBF Nexus | ${exportDate}`,
        14,
        pageHeight - 12,
      )
      doc.text(
        'This document serves as a monthly work time record.',
        14,
        pageHeight - 8,
      )
      doc.setTextColor(0, 0, 0)
    },
  })

  const fileName = `Freelog_${settings.name.replace(/\s+/g, '_')}_${monthName}_${settings.year}.pdf`
  doc.save(fileName)
}
