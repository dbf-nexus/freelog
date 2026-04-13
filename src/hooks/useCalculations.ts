import type { DayEntry } from '../types'

/** Parse "HH:MM" to fractional hours. Returns 0 for empty/invalid. */
function parseTime(t: string): number {
  if (!t) return 0
  const [h, m] = t.split(':').map(Number)
  if (isNaN(h) || isNaN(m)) return 0
  return h + m / 60
}

/** Calculate total time hours for a day: sum of shift blocks minus break. */
export function calcTimeHours(entry: DayEntry): number {
  let total = 0
  for (const block of entry.timeBlocks) {
    const start = parseTime(block.start)
    const end = parseTime(block.end)
    if (start > 0 || end > 0) {
      total += Math.max(0, end - start)
    }
  }
  total -= entry.breakMinutes / 60
  return Math.max(0, Math.round(total * 100) / 100)
}

/** Sum all activity hours for a day. */
export function calcActivityTotal(entry: DayEntry): number {
  let total = 0
  for (const val of Object.values(entry.activityHours)) {
    total += val || 0
  }
  return Math.round(total * 100) / 100
}

/** Discrepancy: abs(timeH - actH) > 0.1 and both non-zero. */
export function isDiscrepancy(entry: DayEntry): boolean {
  const timeH = calcTimeHours(entry)
  const actH = calcActivityTotal(entry)
  if (timeH === 0 || actH === 0) return false
  return Math.abs(timeH - actH) > 0.1
}

/** Count working days (Mon-Fri) in a given month/year. */
export function countWorkingDays(year: number, month: number): number {
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  let count = 0
  for (let d = 1; d <= daysInMonth; d++) {
    const dow = new Date(year, month, d).getDay()
    if (dow !== 0 && dow !== 6) count++
  }
  return count
}

/** Count remaining working days from today (inclusive) in a given month/year. */
export function countWorkingDaysRemaining(year: number, month: number): number {
  const today = new Date()
  const todayYear = today.getFullYear()
  const todayMonth = today.getMonth()
  const todayDate = today.getDate()

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  let count = 0

  // If the month/year is in the past, 0 remaining
  if (year < todayYear || (year === todayYear && month < todayMonth)) return 0
  // If the month/year is in the future, count all working days
  const startDay = year === todayYear && month === todayMonth ? todayDate : 1

  for (let d = startDay; d <= daysInMonth; d++) {
    const dow = new Date(year, month, d).getDay()
    if (dow !== 0 && dow !== 6) count++
  }
  return count
}

export function useCalculations() {
  return {
    calcTimeHours,
    calcActivityTotal,
    isDiscrepancy,
    countWorkingDays,
    countWorkingDaysRemaining,
  }
}
