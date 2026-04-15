import type { ReactNode } from 'react'

interface TooltipProps {
  text: string
  children: ReactNode
  position?: 'top' | 'bottom' | 'right'
}

export default function Tooltip({ text, children, position = 'top' }: TooltipProps) {
  return (
    <span className={`tooltip-wrap tooltip-${position}`}>
      {children}
      <span className="tooltip-bubble" role="tooltip">
        {text}
      </span>
    </span>
  )
}

interface InfoIconProps {
  text: string
  position?: 'top' | 'bottom' | 'right'
}

export function InfoIcon({ text, position = 'top' }: InfoIconProps) {
  return (
    <Tooltip text={text} position={position}>
      <span
        aria-label={text}
        className="info-icon"
      >
        i
      </span>
    </Tooltip>
  )
}
