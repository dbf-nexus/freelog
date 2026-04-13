import { useState, useCallback } from 'react'
import type { MonthFavourites } from '../types'

const STORAGE_KEY = 'freelog_favourites'

function loadFavourites(): MonthFavourites {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    return JSON.parse(raw) as MonthFavourites
  } catch {
    return {}
  }
}

function saveFavourites(favs: MonthFavourites): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favs))
}

export function useFavourites() {
  const [favourites, setFavouritesState] = useState<MonthFavourites>(loadFavourites)

  const getFavourites = useCallback(
    (month: number): string[] => {
      return favourites[month] ?? []
    },
    [favourites],
  )

  const setMonthFavourites = useCallback(
    (month: number, activityIds: string[]) => {
      setFavouritesState(prev => {
        const next = { ...prev, [month]: activityIds }
        saveFavourites(next)
        return next
      })
    },
    [],
  )

  const clearFavourites = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setFavouritesState({})
  }, [])

  return { favourites, getFavourites, setMonthFavourites, clearFavourites }
}
