import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import type { Settings, Activity } from '../types'

interface Props {
  onComplete: (settings: Settings, currentMonthFavourites: string[]) => void
}

const SUGGESTION_CHIPS = [
  'Development',
  'Design',
  'Meetings',
  'Research',
  'Admin',
  'QA / Testing',
  'Writing',
  'Support',
]

const COLOUR_PRESETS = [
  '#e8c547', // gold
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f43f5e', // rose
  '#a855f7', // purple
  '#f97316', // orange
  '#06b6d4', // cyan
  '#84cc16', // lime
]

export default function OnboardingWizard({ onComplete }: Props) {
  const [step, setStep] = useState(1)

  // Step 1
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')

  // Step 2
  const [monthlyTarget, setMonthlyTarget] = useState(120)

  // Step 3
  const [shifts, setShifts] = useState<1 | 2 | 3>(2)

  // Step 4
  const [activities, setActivities] = useState<Activity[]>([])
  const [customLabel, setCustomLabel] = useState('')
  const [nextColourIdx, setNextColourIdx] = useState(0)

  const canNext = (): boolean => {
    if (step === 1) return name.trim().length >= 2
    if (step === 2) return monthlyTarget >= 10 && monthlyTarget <= 400
    if (step === 3) return true
    if (step === 4) return activities.length >= 1
    return false
  }

  const addActivity = (label: string) => {
    if (activities.length >= 12) return
    if (activities.some(a => a.label.toLowerCase() === label.toLowerCase())) return
    const activity: Activity = {
      id: uuidv4(),
      label: label.trim(),
      colour: COLOUR_PRESETS[nextColourIdx % COLOUR_PRESETS.length],
    }
    setActivities(prev => [...prev, activity])
    setNextColourIdx(prev => prev + 1)
  }

  const removeActivity = (id: string) => {
    setActivities(prev => prev.filter(a => a.id !== id))
  }

  const setActivityColour = (id: string, colour: string) => {
    setActivities(prev =>
      prev.map(a => (a.id === id ? { ...a, colour } : a)),
    )
  }

  const handleComplete = () => {
    const settings: Settings = {
      name: name.trim(),
      company: company.trim(),
      year: new Date().getFullYear(),
      monthlyTarget,
      shifts,
      activities,
    }
    const allIds = activities.map(a => a.id)
    onComplete(settings, allIds)
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <h1 className="font-display text-3xl font-bold tracking-tight text-center mb-8">
          <span className="text-white">Free</span>
          <span className="text-gold-gradient">log</span>
        </h1>

        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3, 4].map(s => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-colors ${
                s <= step ? 'bg-gold-solid' : 'bg-surface-elevated'
              }`}
            />
          ))}
        </div>

        {/* Step 1: Name + Company */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-white text-xl font-semibold mb-1">What's your name?</h2>
              <p className="text-labels text-sm mb-4">This will appear on your exports.</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-eyebrows text-xs uppercase tracking-wider mb-1.5">
                  Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your name"
                  autoFocus
                  className="w-full bg-surface border border-surface-elevated rounded-lg px-3 py-2.5 text-white placeholder:text-labels focus:outline-none focus:border-gold-solid transition-colors"
                />
                {name.length > 0 && name.trim().length < 2 && (
                  <p className="text-rose text-xs mt-1">At least 2 characters</p>
                )}
              </div>
              <div>
                <label className="block text-eyebrows text-xs uppercase tracking-wider mb-1.5">
                  Company
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={e => setCompany(e.target.value)}
                  placeholder="Optional"
                  className="w-full bg-surface border border-surface-elevated rounded-lg px-3 py-2.5 text-white placeholder:text-labels focus:outline-none focus:border-gold-solid transition-colors"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Monthly Target */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-white text-xl font-semibold mb-1">Monthly hour target</h2>
              <p className="text-labels text-sm mb-4">How many hours do you bill per month?</p>
            </div>
            <div>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min={10}
                  max={400}
                  value={monthlyTarget}
                  onChange={e => setMonthlyTarget(Number(e.target.value))}
                  className="flex-1 accent-gold-solid"
                />
                <input
                  type="number"
                  min={10}
                  max={400}
                  value={monthlyTarget}
                  onChange={e => {
                    const v = Number(e.target.value)
                    if (v >= 10 && v <= 400) setMonthlyTarget(v)
                  }}
                  className="w-20 bg-surface border border-surface-elevated rounded-lg px-3 py-2.5 text-white text-center font-mono focus:outline-none focus:border-gold-solid transition-colors"
                />
              </div>
              <p className="text-labels text-xs mt-2">Between 10 and 400 hours</p>
            </div>
          </div>
        )}

        {/* Step 3: Shifts */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-white text-xl font-semibold mb-1">Shifts per day</h2>
              <p className="text-labels text-sm mb-4">
                How many time blocks do you log each day?
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {([1, 2, 3] as const).map(n => (
                <button
                  key={n}
                  onClick={() => setShifts(n)}
                  className={`rounded-xl border p-4 text-center transition-all ${
                    shifts === n
                      ? 'border-gold-solid bg-gold-tint'
                      : 'border-surface-elevated bg-surface hover:border-labels'
                  }`}
                >
                  <div className="flex justify-center gap-1 mb-3">
                    {Array.from({ length: n }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-6 h-10 rounded ${
                          shifts === n ? 'bg-gold-solid/30' : 'bg-surface-elevated'
                        }`}
                      />
                    ))}
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      shifts === n ? 'text-gold-solid' : 'text-body-text'
                    }`}
                  >
                    {n} shift{n > 1 ? 's' : ''}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Activities */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-white text-xl font-semibold mb-1">Your activities</h2>
              <p className="text-labels text-sm mb-4">
                What do you track time against? (1–12)
              </p>
            </div>

            {/* Suggestion chips */}
            <div className="flex flex-wrap gap-2">
              {SUGGESTION_CHIPS.filter(
                s => !activities.some(a => a.label.toLowerCase() === s.toLowerCase()),
              ).map(s => (
                <button
                  key={s}
                  onClick={() => addActivity(s)}
                  disabled={activities.length >= 12}
                  className="px-3 py-1.5 rounded-full border border-surface-elevated text-sm text-body-text hover:border-gold-solid hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  + {s}
                </button>
              ))}
            </div>

            {/* Custom input */}
            <form
              onSubmit={e => {
                e.preventDefault()
                if (customLabel.trim().length >= 1 && activities.length < 12) {
                  addActivity(customLabel.trim())
                  setCustomLabel('')
                }
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={customLabel}
                onChange={e => setCustomLabel(e.target.value)}
                placeholder="Custom activity..."
                maxLength={30}
                className="flex-1 bg-surface border border-surface-elevated rounded-lg px-3 py-2.5 text-white placeholder:text-labels focus:outline-none focus:border-gold-solid transition-colors"
              />
              <button
                type="submit"
                disabled={customLabel.trim().length < 1 || activities.length >= 12}
                className="px-4 py-2.5 rounded-lg bg-surface-elevated text-white text-sm font-medium hover:bg-gold-solid/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Add
              </button>
            </form>

            {/* Activity list */}
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {activities.map(a => (
                <div
                  key={a.id}
                  className="flex items-center gap-3 bg-surface rounded-lg px-3 py-2"
                >
                  {/* Colour picker */}
                  <div className="flex gap-1">
                    {COLOUR_PRESETS.map(c => (
                      <button
                        key={c}
                        onClick={() => setActivityColour(a.id, c)}
                        className={`w-4 h-4 rounded-full transition-transform ${
                          a.colour === c ? 'ring-2 ring-white ring-offset-1 ring-offset-canvas scale-110' : 'hover:scale-110'
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                  <span className="flex-1 text-white text-sm">{a.label}</span>
                  <button
                    onClick={() => removeActivity(a.id)}
                    className="text-labels hover:text-rose text-sm transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            {activities.length === 0 && (
              <p className="text-labels text-sm text-center">
                Add at least 1 activity to continue
              </p>
            )}
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex gap-3 mt-8">
          {step > 1 && (
            <button
              onClick={() => setStep(s => s - 1)}
              className="px-5 py-2.5 rounded-lg border border-surface-elevated text-body-text hover:text-white hover:border-labels transition-colors"
            >
              Back
            </button>
          )}
          <button
            onClick={() => {
              if (step < 4) setStep(s => s + 1)
              else handleComplete()
            }}
            disabled={!canNext()}
            className="flex-1 px-5 py-2.5 rounded-lg bg-gold-solid text-deep-text font-semibold hover:bg-gold-highlight transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {step < 4 ? 'Continue' : 'Start tracking'}
          </button>
        </div>

        {/* Step indicator */}
        <p className="text-labels text-xs text-center mt-4">
          Step {step} of 4
        </p>
      </div>
    </div>
  )
}
