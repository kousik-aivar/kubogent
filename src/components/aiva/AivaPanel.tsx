import { X, Sparkles, TrendingUp, AlertTriangle, Zap, Lightbulb } from 'lucide-react'
import { useAiva } from './AivaContext'
import type { AivaSuggestion } from '../../types'

const typeConfig: Record<AivaSuggestion['type'], { icon: typeof Sparkles; label: string }> = {
  recommendation: { icon: Sparkles, label: 'Recommendation' },
  warning:        { icon: AlertTriangle, label: 'Warning' },
  insight:        { icon: TrendingUp, label: 'Insight' },
  action:         { icon: Zap, label: 'Action' },
}

const accentText: Record<AivaSuggestion['accent'], string> = {
  blue:   'text-accent-blue',
  green:  'text-accent-green',
  amber:  'text-accent-amber',
  red:    'text-accent-red',
  purple: 'text-accent-purple',
}

const accentBg: Record<AivaSuggestion['accent'], string> = {
  blue:   'bg-accent-blue/10',
  green:  'bg-accent-green/10',
  amber:  'bg-accent-amber/10',
  red:    'bg-accent-red/10',
  purple: 'bg-accent-purple/10',
}

function SuggestionCard({ suggestion }: { suggestion: AivaSuggestion }) {
  const { icon: Icon, label } = typeConfig[suggestion.type]
  return (
    <div className="bg-bg-tertiary border border-border rounded-xl p-4 space-y-2">
      <div className="flex items-center gap-2">
        <div className={`w-6 h-6 rounded flex items-center justify-center ${accentBg[suggestion.accent]}`}>
          <Icon className={`w-3.5 h-3.5 ${accentText[suggestion.accent]}`} />
        </div>
        <span className={`text-xs font-medium ${accentText[suggestion.accent]}`}>{label}</span>
      </div>
      <div className="text-sm font-medium text-text-primary">{suggestion.title}</div>
      <p className="text-xs text-text-secondary leading-relaxed">{suggestion.body}</p>
      {suggestion.actionLabel && (
        <button className="text-xs font-medium text-accent-purple hover:text-accent-purple/80 transition-colors">
          {suggestion.actionLabel} →
        </button>
      )}
    </div>
  )
}

export default function AivaPanel() {
  const { isOpen, close, pageContext } = useAiva()

  if (!isOpen) return null

  const suggestions = pageContext?.suggestions ?? []

  return (
    <>
      {/* Backdrop — click to close */}
      <div className="fixed inset-0 z-40" onClick={close} />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-screen w-96 bg-bg-secondary border-l border-border z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-accent-purple/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-accent-purple" />
            </div>
            <span className="text-sm font-semibold text-text-primary">AIVA</span>
            <span className="text-xs text-text-muted">· Kubogent Intelligence</span>
          </div>
          <button
            onClick={close}
            aria-label="Close AIVA"
            className="p-1.5 rounded-lg hover:bg-bg-tertiary transition-colors"
          >
            <X className="w-4 h-4 text-text-secondary" />
          </button>
        </div>

        {/* Context label */}
        {pageContext?.entityName && (
          <div className="px-5 py-2 border-b border-border">
            <span className="text-xs text-text-muted">Context: </span>
            <span className="text-xs text-text-secondary">{pageContext.entityName}</span>
          </div>
        )}

        {/* Suggestions */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {suggestions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-4">
              <div className="w-10 h-10 rounded-xl bg-bg-tertiary flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-text-muted" />
              </div>
              <p className="text-sm text-text-muted">No suggestions for this view</p>
            </div>
          ) : (
            suggestions.map((s) => <SuggestionCard key={s.id} suggestion={s} />)
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-border">
          <p className="text-xs text-text-muted text-center">AIVA analyses your infrastructure in real-time</p>
        </div>
      </div>
    </>
  )
}
