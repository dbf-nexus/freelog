import { useState, useRef, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import type { Settings, Activity, MonthData, MonthFavourites } from '../types'
import { getMonthName } from '../utils/dateUtils'
import { InfoIcon } from './Tooltip'

const COLOUR_PRESETS = [
  '#e8c547', '#3b82f6', '#10b981', '#f43f5e',
  '#a855f7', '#f97316', '#06b6d4', '#84cc16',
]

interface Props {
  open: boolean
  onClose: () => void
  settings: Settings
  data: MonthData
  favourites: MonthFavourites
  onUpdateSettings: (partial: Partial<Settings>) => void
  onSetSettings: (settings: Settings) => void
  onSetMonthFavourites: (month: number, ids: string[]) => void
  onToast: (message: string) => void
}

export default function SettingsPanel({
  open,
  onClose,
  settings,
  data,
  favourites,
  onUpdateSettings,
  onSetSettings,
  onSetMonthFavourites,
  onToast,
}: Props) {
  // Profile
  const [nameInput, setNameInput] = useState(settings.name)
  const [companyInput, setCompanyInput] = useState(settings.company)

  // Sync when settings change externally
  useEffect(() => {
    setNameInput(settings.name)
    setCompanyInput(settings.company)
  }, [settings.name, settings.company])

  // Activities
  const [newActivityLabel, setNewActivityLabel] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editLabel, setEditLabel] = useState('')
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  // Favourites month
  const [favMonth, setFavMonth] = useState(new Date().getMonth())

  // Reset modal
  const [showResetModal, setShowResetModal] = useState(false)
  const [resetInput, setResetInput] = useState('')

  // Restore
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [restoreError, setRestoreError] = useState('')

  const backdropRef = useRef<HTMLDivElement>(null)

  if (!open) return null

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === backdropRef.current) onClose()
  }

  // --- Profile ---
  const saveProfile = () => {
    if (nameInput.trim().length < 2) return
    onUpdateSettings({ name: nameInput.trim(), company: companyInput.trim() })
    onToast('Settings saved')
  }

  // --- Timesheet ---
  const handleTargetChange = (v: number) => {
    if (v >= 10 && v <= 400) onUpdateSettings({ monthlyTarget: v })
  }

  const handleShiftsChange = (s: 1 | 2 | 3) => {
    onUpdateSettings({ shifts: s })
  }

  // --- Activities ---
  const addActivity = () => {
    if (newActivityLabel.trim().length < 1 || settings.activities.length >= 12) return
    if (settings.activities.some(a => a.label.toLowerCase() === newActivityLabel.trim().toLowerCase())) return
    const activity: Activity = {
      id: uuidv4(),
      label: newActivityLabel.trim(),
      colour: COLOUR_PRESETS[settings.activities.length % COLOUR_PRESETS.length],
    }
    onSetSettings({ ...settings, activities: [...settings.activities, activity] })
    setNewActivityLabel('')
  }

  const startEdit = (a: Activity) => {
    setEditingId(a.id)
    setEditLabel(a.label)
  }

  const commitEdit = () => {
    if (!editingId || editLabel.trim().length < 1) return
    const updated = settings.activities.map(a =>
      a.id === editingId ? { ...a, label: editLabel.trim() } : a,
    )
    onSetSettings({ ...settings, activities: updated })
    setEditingId(null)
  }

  const setActivityColour = (id: string, colour: string) => {
    const updated = settings.activities.map(a =>
      a.id === id ? { ...a, colour } : a,
    )
    onSetSettings({ ...settings, activities: updated })
  }

  const hasLoggedHours = (actId: string): boolean => {
    for (const monthKey of Object.keys(data)) {
      const dayMap = data[Number(monthKey)]
      if (!dayMap) continue
      for (const dayKey of Object.keys(dayMap)) {
        const entry = dayMap[Number(dayKey)]
        if (entry?.activityHours[actId] && entry.activityHours[actId] > 0) return true
      }
    }
    return false
  }

  const deleteActivity = (id: string) => {
    const updated = settings.activities.filter(a => a.id !== id)
    onSetSettings({ ...settings, activities: updated })
    setDeleteConfirmId(null)
  }

  // --- Favourites ---
  const monthFavIds = favourites[favMonth] ?? []

  const toggleFavourite = (actId: string) => {
    const current = [...monthFavIds]
    const idx = current.indexOf(actId)
    if (idx >= 0) current.splice(idx, 1)
    else current.push(actId)
    onSetMonthFavourites(favMonth, current)
  }

  // --- Data: Export backup ---
  const exportBackup = () => {
    const backup = {
      freelog_settings: JSON.parse(localStorage.getItem('freelog_settings') || 'null'),
      freelog_data: JSON.parse(localStorage.getItem('freelog_data') || '{}'),
      freelog_favourites: JSON.parse(localStorage.getItem('freelog_favourites') || '{}'),
    }
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const today = new Date().toISOString().slice(0, 10)
    a.href = url
    a.download = `freelog_backup_${today}.json`
    a.click()
    URL.revokeObjectURL(url)
    localStorage.setItem('freelog_backup_date', new Date().toISOString())
    onToast('Backup exported')
  }

  // --- Data: Restore ---
  const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRestoreError('')
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string)
        if (!parsed.freelog_settings || typeof parsed.freelog_settings !== 'object') {
          setRestoreError('Invalid backup file — missing settings.')
          return
        }
        if (!parsed.freelog_settings.name || !parsed.freelog_settings.activities) {
          setRestoreError('Invalid backup file — corrupted settings data.')
          return
        }
        localStorage.setItem('freelog_settings', JSON.stringify(parsed.freelog_settings))
        localStorage.setItem('freelog_data', JSON.stringify(parsed.freelog_data ?? {}))
        localStorage.setItem('freelog_favourites', JSON.stringify(parsed.freelog_favourites ?? {}))
        onToast('Data restored — reloading...')
        setTimeout(() => window.location.reload(), 1000)
      } catch {
        setRestoreError('Invalid JSON file.')
      }
    }
    reader.readAsText(file)
    // Reset input so same file can be selected again
    e.target.value = ''
  }

  // --- Data: Reset ---
  const handleReset = () => {
    localStorage.removeItem('freelog_settings')
    localStorage.removeItem('freelog_data')
    localStorage.removeItem('freelog_favourites')
    localStorage.removeItem('freelog_backup_date')
    window.location.reload()
  }

  const inputClass =
    'w-full bg-surface border border-surface-elevated rounded-lg px-3 py-2 text-white placeholder:text-labels text-sm focus:outline-none focus:border-gold-solid transition-colors'
  const sectionTitle = 'text-eyebrows text-xs uppercase tracking-wider font-semibold mb-3'
  const btnGold =
    'px-4 py-2 rounded-lg bg-gold-solid text-deep-text text-sm font-semibold hover:bg-gold-highlight transition-colors disabled:opacity-30 disabled:cursor-not-allowed'

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 bg-black/60 flex justify-end"
    >
      <div className="w-full max-w-md bg-canvas border-l border-surface-elevated h-full overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-elevated sticky top-0 bg-canvas z-10">
          <h2 className="text-white text-lg font-semibold">Settings</h2>
          <button
            onClick={onClose}
            className="text-labels hover:text-white transition-colors text-xl leading-none"
          >
            &times;
          </button>
        </div>

        <div className="px-5 py-5 space-y-8">
          {/* Section 1 — Profile */}
          <section>
            <h3 className={sectionTitle}>Profile</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-labels text-xs mb-1">Name *</label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  className={inputClass}
                />
                {nameInput.length > 0 && nameInput.trim().length < 2 && (
                  <p className="text-rose text-xs mt-1">At least 2 characters</p>
                )}
              </div>
              <div>
                <label className="block text-labels text-xs mb-1">Company</label>
                <input
                  type="text"
                  value={companyInput}
                  onChange={e => setCompanyInput(e.target.value)}
                  placeholder="Optional"
                  className={inputClass}
                />
              </div>
              <button
                onClick={saveProfile}
                disabled={nameInput.trim().length < 2}
                className={btnGold}
              >
                Save profile
              </button>
            </div>
          </section>

          {/* Section 2 — Timesheet */}
          <section>
            <h3 className={sectionTitle}>Timesheet</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-labels text-xs mb-1">Monthly target (hours)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={10}
                    max={400}
                    value={settings.monthlyTarget}
                    onChange={e => handleTargetChange(Number(e.target.value))}
                    className="flex-1 accent-gold-solid"
                  />
                  <input
                    type="number"
                    min={10}
                    max={400}
                    value={settings.monthlyTarget}
                    onChange={e => handleTargetChange(Number(e.target.value))}
                    className="w-20 bg-surface border border-surface-elevated rounded-lg px-2 py-2 text-white text-center font-mono text-sm focus:outline-none focus:border-gold-solid transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="text-labels text-xs mb-2 flex items-center gap-1.5">
                  Shifts per day
                  <InfoIcon text="A shift is one continuous block of work — most people work 1 or 2 per day" position="right" />
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {([1, 2, 3] as const).map(n => (
                    <button
                      key={n}
                      onClick={() => handleShiftsChange(n)}
                      className={`rounded-lg border p-3 text-center transition-all ${
                        settings.shifts === n
                          ? 'border-gold-solid bg-gold-tint'
                          : 'border-surface-elevated bg-surface hover:border-labels'
                      }`}
                    >
                      <div className="flex justify-center gap-0.5 mb-2">
                        {Array.from({ length: n }).map((_, i) => (
                          <div
                            key={i}
                            className={`w-4 h-7 rounded ${
                              settings.shifts === n ? 'bg-gold-solid/30' : 'bg-surface-elevated'
                            }`}
                          />
                        ))}
                      </div>
                      <span
                        className={`text-xs font-medium ${
                          settings.shifts === n ? 'text-gold-solid' : 'text-body-text'
                        }`}
                      >
                        {n}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Section 3 — Activities */}
          <section>
            <h3 className={sectionTitle}>Activities ({settings.activities.length}/12)</h3>
            <div className="space-y-2 mb-3">
              {settings.activities.map(a => (
                <div key={a.id} className="bg-surface rounded-lg px-3 py-2 space-y-2">
                  <div className="flex items-center gap-2">
                    {/* Colour dots */}
                    <div className="flex gap-1 shrink-0">
                      {COLOUR_PRESETS.map(c => (
                        <button
                          key={c}
                          onClick={() => setActivityColour(a.id, c)}
                          className={`w-3.5 h-3.5 rounded-full transition-transform ${
                            a.colour === c
                              ? 'ring-2 ring-white ring-offset-1 ring-offset-canvas scale-110'
                              : 'hover:scale-110'
                          }`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                    {/* Label */}
                    {editingId === a.id ? (
                      <input
                        type="text"
                        value={editLabel}
                        onChange={e => setEditLabel(e.target.value)}
                        onBlur={commitEdit}
                        onKeyDown={e => { if (e.key === 'Enter') commitEdit() }}
                        autoFocus
                        className="flex-1 bg-transparent border-b border-gold-solid text-white text-sm focus:outline-none"
                      />
                    ) : (
                      <span
                        onClick={() => startEdit(a)}
                        className="flex-1 text-white text-sm cursor-pointer hover:text-gold-highlight transition-colors"
                        title="Click to rename"
                      >
                        {a.label}
                      </span>
                    )}
                    {/* Delete */}
                    {deleteConfirmId === a.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => deleteActivity(a.id)}
                          className="text-rose text-xs font-semibold"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="text-labels text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          if (hasLoggedHours(a.id)) setDeleteConfirmId(a.id)
                          else deleteActivity(a.id)
                        }}
                        className="text-labels hover:text-rose text-xs transition-colors shrink-0"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                  {deleteConfirmId === a.id && (
                    <p className="text-rose text-xs">This activity has logged hours. Delete anyway?</p>
                  )}
                </div>
              ))}
            </div>
            {settings.activities.length < 12 && (
              <form
                onSubmit={e => { e.preventDefault(); addActivity() }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={newActivityLabel}
                  onChange={e => setNewActivityLabel(e.target.value)}
                  placeholder="New activity..."
                  maxLength={30}
                  className={inputClass}
                />
                <button
                  type="submit"
                  disabled={newActivityLabel.trim().length < 1}
                  className="px-3 py-2 rounded-lg bg-surface-elevated text-white text-sm hover:bg-gold-solid/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
                >
                  Add
                </button>
              </form>
            )}
          </section>

          {/* Section 4 — Monthly Favourites */}
          <section>
            <h3 className={sectionTitle}>Monthly Favourites</h3>
            <p className="text-labels text-xs mb-3">
              Choose which activities appear as columns each month.
            </p>
            <select
              value={favMonth}
              onChange={e => setFavMonth(Number(e.target.value))}
              className="w-full bg-surface border border-surface-elevated rounded-lg px-3 py-2 text-white text-sm mb-3 focus:outline-none focus:border-gold-solid"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i} value={i}>
                  {getMonthName(i)} {settings.year}
                </option>
              ))}
            </select>
            <div className="space-y-1">
              {settings.activities.map(a => {
                const active = monthFavIds.includes(a.id)
                return (
                  <button
                    key={a.id}
                    onClick={() => toggleFavourite(a.id)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                      active
                        ? 'bg-gold-tint text-white'
                        : 'bg-surface text-labels hover:text-body-text'
                    }`}
                  >
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: a.colour }}
                    />
                    <span className="flex-1 text-left">{a.label}</span>
                    <span className={`text-xs ${active ? 'text-gold-solid' : 'text-labels'}`}>
                      {active ? '★' : '☆'}
                    </span>
                  </button>
                )
              })}
              {settings.activities.length === 0 && (
                <p className="text-labels text-xs text-center py-2">
                  No activities defined yet.
                </p>
              )}
            </div>
          </section>

          {/* Section 5 — Data */}
          <section>
            <h3 className={sectionTitle}>Data</h3>
            <div className="space-y-3">
              <button onClick={exportBackup} className={`w-full ${btnGold}`}>
                Export backup
              </button>

              <div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full px-4 py-2 rounded-lg border border-surface-elevated text-body-text text-sm hover:text-white hover:border-labels transition-colors"
                >
                  Restore from backup
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleRestore}
                  className="hidden"
                />
                {restoreError && (
                  <p className="text-rose text-xs mt-1">{restoreError}</p>
                )}
              </div>

              <button
                onClick={() => { setShowResetModal(true); setResetInput('') }}
                className="w-full px-4 py-2 rounded-lg border border-rose/30 text-rose text-sm hover:bg-rose/10 transition-colors"
              >
                Reset all data
              </button>
            </div>
          </section>
        </div>
      </div>

      {/* Reset confirmation modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-[60] bg-black/70 flex items-center justify-center px-4">
          <div className="bg-canvas border border-surface-elevated rounded-xl p-6 w-full max-w-sm space-y-4">
            <h3 className="text-white text-lg font-semibold">Reset all data?</h3>
            <p className="text-body-text text-sm">
              This will permanently delete all your settings, timesheet data, and favourites.
              This action cannot be undone.
            </p>
            <div>
              <label className="block text-labels text-xs mb-1">
                Type <span className="text-rose font-mono">RESET</span> to confirm
              </label>
              <input
                type="text"
                value={resetInput}
                onChange={e => setResetInput(e.target.value)}
                autoFocus
                className={inputClass}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowResetModal(false)}
                className="flex-1 px-4 py-2 rounded-lg border border-surface-elevated text-body-text text-sm hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                disabled={resetInput !== 'RESET'}
                className="flex-1 px-4 py-2 rounded-lg bg-rose text-white text-sm font-semibold disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Reset everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
