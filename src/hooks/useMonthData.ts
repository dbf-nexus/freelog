import { useState, useCallback } from 'react'
import type { MonthData, DayEntry, TimeBlock } from '../types'

const STORAGE_KEY = 'freelog_data'

function loadData(): MonthData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    return JSON.parse(raw) as MonthData
  } catch {
    return {}
  }
}

function saveData(data: MonthData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

function createEmptyEntry(shifts: number): DayEntry {
  const timeBlocks: TimeBlock[] = Array.from({ length: shifts }, () => ({
    start: '',
    end: '',
  }))
  return { timeBlocks, breakMinutes: 0, activityHours: {} }
}

export function useMonthData() {
  const [data, setDataState] = useState<MonthData>(loadData)

  const getDay = useCallback(
    (month: number, day: number, shifts: number): DayEntry => {
      return data[month]?.[day] ?? createEmptyEntry(shifts)
    },
    [data],
  )

  const setDay = useCallback(
    (month: number, day: number, entry: DayEntry) => {
      setDataState(prev => {
        const next = {
          ...prev,
          [month]: {
            ...prev[month],
            [day]: entry,
          },
        }
        saveData(next)
        return next
      })
    },
    [],
  )

  const clearData = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setDataState({})
  }, [])

  return { data, getDay, setDay, clearData }
}
