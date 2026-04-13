interface Props {
  name: string
  company: string
}

export default function Header({ name, company }: Props) {
  return (
    <header className="flex items-center justify-between px-6 py-3 border-b border-surface-elevated">
      <h1 className="font-display text-2xl font-bold tracking-tight">
        <span className="text-white">Free</span>
        <span className="text-gold-gradient">log</span>
      </h1>
      <div className="flex items-center gap-2">
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
    </header>
  )
}
