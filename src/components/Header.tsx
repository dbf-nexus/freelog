interface Props {
  name: string
  company: string
  onSettingsOpen: () => void
  onExportExcel: () => void
  onExportPDF: () => void
}

export default function Header({ name, company, onSettingsOpen, onExportExcel, onExportPDF }: Props) {
  const iconBtn =
    'w-8 h-8 rounded-lg flex items-center justify-center text-labels hover:text-white hover:bg-surface-elevated transition-colors'

  return (
    <header className="flex items-center justify-between px-6 py-3 border-b border-surface-elevated">
      <h1 className="font-display text-2xl font-bold tracking-tight">
        <span className="text-white">Free</span>
        <span className="text-gold-gradient">log</span>
      </h1>
      <div className="flex items-center gap-2">
        {/* Excel */}
        <button onClick={onExportExcel} className={iconBtn} title="Export Excel">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 1h8a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V2a1 1 0 011-1z" />
            <path d="M5.5 5l2.5 3-2.5 3M10.5 5L8 8l2.5 3" />
          </svg>
        </button>
        {/* PDF */}
        <button onClick={onExportPDF} className={iconBtn} title="Export PDF">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 1h5l4 4v9a1 1 0 01-1 1H4a1 1 0 01-1-1V2a1 1 0 011-1z" />
            <path d="M9 1v4h4" />
            <path d="M5 9h6M5 11.5h4" />
          </svg>
        </button>
        {/* Gear */}
        <button onClick={onSettingsOpen} className={iconBtn} title="Settings">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="8" cy="8" r="2" />
            <path d="M13.3 10a1.1 1.1 0 00.2 1.2l.04.04a1.33 1.33 0 11-1.88 1.88l-.04-.04a1.1 1.1 0 00-1.2-.2 1.1 1.1 0 00-.67 1.01v.12a1.33 1.33 0 11-2.67 0v-.06a1.1 1.1 0 00-.72-1.01 1.1 1.1 0 00-1.2.2l-.04.04a1.33 1.33 0 11-1.88-1.88l.04-.04a1.1 1.1 0 00.2-1.2 1.1 1.1 0 00-1.01-.67h-.12a1.33 1.33 0 110-2.67h.06a1.1 1.1 0 001.01-.72 1.1 1.1 0 00-.2-1.2l-.04-.04A1.33 1.33 0 114.81 2.9l.04.04a1.1 1.1 0 001.2.2h.05a1.1 1.1 0 00.67-1.01v-.12a1.33 1.33 0 112.67 0v.06a1.1 1.1 0 00.67 1.01 1.1 1.1 0 001.2-.2l.04-.04a1.33 1.33 0 111.88 1.88l-.04.04a1.1 1.1 0 00-.2 1.2v.05a1.1 1.1 0 001.01.67h.12a1.33 1.33 0 110 2.67h-.06a1.1 1.1 0 00-1.01.67z" />
          </svg>
        </button>
        {/* User chip */}
        <div className="flex items-center gap-2 ml-1 pl-2 border-l border-surface-elevated">
          <div className="w-7 h-7 rounded-full bg-gold-solid/20 flex items-center justify-center text-gold-solid text-xs font-semibold">
            {name.charAt(0).toUpperCase()}
          </div>
          <div className="text-right">
            <span className="text-white text-sm font-medium">{name}</span>
            {company && (
              <span className="text-labels text-xs block">{company}</span>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
