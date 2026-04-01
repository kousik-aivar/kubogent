import { Clock, Bell, RefreshCw, Settings, Database } from 'lucide-react'
import type { Pipeline } from '../../../types'

function ConfigSection({ title, icon: Icon, children }: { title: string; icon: typeof Clock; children: React.ReactNode }) {
  return (
    <div className="bg-bg-secondary border border-border rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-4 h-4 text-accent-blue" />
        <h3 className="text-sm font-medium text-text-primary">{title}</h3>
      </div>
      {children}
    </div>
  )
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between py-2 border-b border-border last:border-0">
      <span className="text-sm text-text-secondary">{label}</span>
      <span className={`text-sm text-text-primary ${mono ? 'font-mono text-xs' : ''}`}>{value}</span>
    </div>
  )
}

export default function PipelineConfigTab({ pipeline }: { pipeline: Pipeline }) {
  const config = pipeline.config

  if (!config) {
    return (
      <div className="bg-bg-secondary border border-border rounded-xl p-8 text-center">
        <p className="text-text-muted text-sm">No configuration available</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* General */}
      <ConfigSection title="General" icon={Settings}>
        <div className="space-y-0">
          <Field label="Name" value={pipeline.name} />
          <Field label="Scheduler" value={pipeline.scheduler} />
          <Field label="Description" value={pipeline.description || 'No description'} />
          {pipeline.tags && (
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-sm text-text-secondary">Tags</span>
              <div className="flex gap-1">
                {pipeline.tags.map((tag) => (
                  <span key={tag} className="px-2 py-0.5 rounded text-xs bg-bg-tertiary text-text-secondary">{tag}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </ConfigSection>

      {/* Triggers */}
      <ConfigSection title="Triggers" icon={Clock}>
        <div className="space-y-3">
          {config.triggers.map((trigger, i) => (
            <div key={i} className="bg-bg-tertiary rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                  trigger.type === 'schedule' ? 'bg-accent-blue/10 text-accent-blue' :
                  trigger.type === 'event' ? 'bg-accent-amber/10 text-accent-amber' :
                  'bg-bg-elevated text-text-secondary'
                }`}>{trigger.type}</span>
              </div>
              {trigger.schedule && <div className="text-xs text-text-secondary mt-1">Cron: <span className="font-mono text-text-primary">{trigger.schedule}</span></div>}
              {trigger.eventSource && <div className="text-xs text-text-secondary mt-1">Source: <span className="text-text-primary">{trigger.eventSource}</span></div>}
            </div>
          ))}
        </div>
      </ConfigSection>

      {/* Notifications */}
      <ConfigSection title="Notifications" icon={Bell}>
        <div className="space-y-2">
          {config.notifications.map((notif, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <span className="text-sm text-text-primary">{notif.channel}</span>
              <div className="flex gap-1">
                {notif.events.map((event) => (
                  <span key={event} className={`text-xs px-1.5 py-0.5 rounded ${
                    event === 'failure' ? 'bg-accent-red/10 text-accent-red' : 'bg-accent-green/10 text-accent-green'
                  }`}>{event}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ConfigSection>

      {/* Advanced */}
      <ConfigSection title="Advanced" icon={RefreshCw}>
        <div className="space-y-0">
          <Field label="Retry Policy" value={`${config.retryPolicy.maxRetries} retries, ${config.retryPolicy.backoffSeconds}s backoff`} />
          <Field label="Timeout" value={config.timeout} />
          <Field label="Concurrency" value={String(config.concurrency)} />
        </div>
      </ConfigSection>

      {/* Artifact Storage */}
      <ConfigSection title="Artifact Storage" icon={Database}>
        <Field label="Storage Path" value={config.artifactStoragePath} mono />
      </ConfigSection>
    </div>
  )
}
