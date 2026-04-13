export default function Legend() {
  return (
    <div className="flex flex-wrap gap-4 px-4 py-3 text-[10px] text-labels">
      <span className="flex items-center gap-1.5">
        <span className="w-3 h-3 rounded bg-surface-weekend border border-surface-elevated" />
        Weekend
      </span>
      <span className="flex items-center gap-1.5">
        <span className="w-3 h-3 rounded bg-gold-tint border border-gold-solid/30" />
        Today
      </span>
      <span className="flex items-center gap-1.5">
        <span className="w-3 h-3 rounded bg-amber-tint border-l-2 border-l-gold-solid" />
        Discrepancy
      </span>
    </div>
  )
}
