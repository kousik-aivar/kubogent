import {
  Download,
  Brain,
  BarChart3,
  ShieldCheck,
  Rocket,
  Activity,
  AlertTriangle,
} from 'lucide-react'
import { mockLifecycleEvents } from '../../../data/mockTrainingJobs'
import type { Pipeline, LifecycleEvent } from '../../../types'

interface PipelineLifecycleTabProps {
  pipeline: Pipeline
}

const eventConfig: Record<LifecycleEvent['type'], {
  Icon: typeof Download
  color: string
  bg: string
}> = {
  import:     { Icon: Download,      color: '#3b82f6', bg: 'bg-accent-blue/20' },
  training:   { Icon: Brain,         color: '#a855f7', bg: 'bg-accent-purple/20' },
  evaluation: { Icon: BarChart3,     color: '#f59e0b', bg: 'bg-accent-amber/20' },
  approval:   { Icon: ShieldCheck,   color: '#f59e0b', bg: 'bg-accent-amber/20' },
  deployment: { Icon: Rocket,        color: '#22c55e', bg: 'bg-accent-green/20' },
  inference:  { Icon: Activity,      color: '#22c55e', bg: 'bg-accent-green/20' },
  failure:    { Icon: AlertTriangle, color: '#ef4444', bg: 'bg-accent-red/20' },
}

function EventCard({ event, isLast }: { event: LifecycleEvent; isLast: boolean }) {
  const cfg = eventConfig[event.type]
  const { Icon } = cfg

  return (
    <div className="flex gap-4">
      {/* Timeline spine */}
      <div className="flex flex-col items-center flex-shrink-0">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${cfg.bg}`}
        >
          <Icon className="w-4 h-4" style={{ color: cfg.color }} />
        </div>
        {!isLast && <div className="w-px flex-1 bg-border mt-2" />}
      </div>

      {/* Content */}
      <div className={`pb-6 flex-1 min-w-0 ${isLast ? '' : ''}`}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
              <span className="text-sm font-medium text-text-primary">{event.title}</span>
              {event.modelVersion && (
                <span className="text-xs px-1.5 py-0.5 rounded bg-accent-blue/10 text-accent-blue flex-shrink-0">
                  {event.modelVersion}
                </span>
              )}
              {event.runId && (
                <span className="text-xs px-1.5 py-0.5 rounded bg-bg-tertiary text-text-muted flex-shrink-0">
                  {event.runId}
                </span>
              )}
            </div>
            <p className="text-sm text-text-secondary mb-2">{event.description}</p>
            {event.metrics && Object.keys(event.metrics).length > 0 && (
              <div className="flex items-center gap-3 flex-wrap">
                {Object.entries(event.metrics).map(([k, v]) => (
                  <span key={k} className="text-xs font-mono px-2 py-0.5 rounded bg-bg-tertiary text-text-secondary">
                    {k.replace(/_/g, ' ')}: <span className="text-text-primary">{typeof v === 'number' && v < 1 ? v.toFixed(3) : v}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
          <span className="text-xs text-text-muted flex-shrink-0">{event.timestamp}</span>
        </div>
      </div>
    </div>
  )
}

export default function PipelineLifecycleTab({ pipeline }: PipelineLifecycleTabProps) {
  const events = mockLifecycleEvents[pipeline.id] ?? []

  if (events.length === 0) {
    return (
      <div className="bg-bg-secondary border border-border rounded-xl p-12 text-center mt-4">
        <p className="text-text-muted">No lifecycle events recorded for this pipeline yet.</p>
      </div>
    )
  }

  return (
    <div className="mt-4 bg-bg-secondary border border-border rounded-xl p-6">
      <div className="mb-4">
        <h3 className="text-sm font-medium text-text-primary">Model Lifecycle</h3>
        <p className="text-xs text-text-secondary mt-0.5">End-to-end journey from base model import to production inference.</p>
      </div>
      <div>
        {events.map((event, i) => (
          <EventCard key={event.id} event={event} isLast={i === events.length - 1} />
        ))}
      </div>
    </div>
  )
}
