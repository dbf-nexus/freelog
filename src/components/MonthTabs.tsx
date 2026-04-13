import { getMonthName } from '../utils/dateUtils'

interface Props {
  activeMonth: number
  onSelect: (month: number) => void
  year: number
}

export default function MonthTabs({ activeMonth, onSelect, year }: Props) {
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()

  return (
    <div className="border-b border-surface-elevated overflow-x-auto scrollbar-hide">
      <div className="flex min-w-max px-4">
        {Array.from({ length: 12 }, (_, i) => {
          const isActive = i === activeMonth
          const isCurrent = i === currentMonth && year === currentYear
          return (
            <button
              key={i}
              onClick={() => onSelect(i)}
              className={`relative px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                isActive
                  ? 'text-gold-solid'
                  : isCurrent
                    ? 'text-white hover:text-gold-highlight'
                    : 'text-labels hover:text-body-text'
              }`}
            >
              {getMonthName(i).slice(0, 3)}
              {isActive && (
                <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-gold-solid rounded-full" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
