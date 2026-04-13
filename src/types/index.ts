export interface Activity {
  id: string
  label: string
  colour: string
}

export interface Settings {
  name: string
  company: string
  year: number
  monthlyTarget: number
  shifts: 1 | 2 | 3
  activities: Activity[]
}

export interface TimeBlock {
  start: string // "HH:MM" or ""
  end: string   // "HH:MM" or ""
}

export interface DayEntry {
  timeBlocks: TimeBlock[]
  breakMinutes: number
  activityHours: Record<string, number>
}

export interface DayMap {
  [day: number]: DayEntry
}

export interface MonthData {
  [month: number]: DayMap
}

export interface MonthFavourites {
  [month: number]: string[]
}
