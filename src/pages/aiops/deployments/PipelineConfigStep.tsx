import { useState } from 'react'
import { Brain, BarChart3, Database, Rocket, Wrench, ChevronDown, ChevronRight } from 'lucide-react'
import { pipelineTemplates } from '../../../data/mockPipelines'

const templateIcons: Record<string, typeof Brain> = { Brain, BarChart3, Database, Rocket, Settings: Wrench }

export interface PipelineDeployConfig {
  templateId: string | null
  trigger: 'once' | 'schedule' | 'event'
  schedule: string
  eventSource: string
  dataSource: string
  params: Record<string, string | number>
}

const defaultParams: Record<string, Record<string, string | number>> = {
  'tpl-1': { learning_rate: '2e-5', batch_size: 4, epochs: 3, lora_rank: 16, lora_alpha: 32 },
  'tpl-2': { eval_metrics: 'BLEU,ROUGE,perplexity', accuracy_threshold: 0.9, bias_check: 'true' },
  'tpl-3': { max_samples: 50000, quality_threshold: 0.8, tokenizer: 'auto' },
  'tpl-4': { learning_rate: '2e-5', batch_size: 4, epochs: 3, eval_metrics: 'accuracy', canary_pct: 10 },
  'tpl-5': {},
}

export default function PipelineConfigStep({ config, onChange }: { config: PipelineDeployConfig; onChange: (c: PipelineDeployConfig) => void }) {
  const [showParams, setShowParams] = useState(false)

  const handleTemplateSelect = (id: string) => {
    onChange({
      ...config,
      templateId: id,
      params: defaultParams[id] || {},
    })
  }

  return (
    <div className="space-y-6">
      {/* Template selection */}
      <div>
        <h3 className="text-lg font-medium text-text-primary mb-2">Configure Pipeline</h3>
        <p className="text-sm text-text-secondary mb-4">Choose a pipeline template for your model:</p>
        <div className="space-y-2">
          {pipelineTemplates.filter(t => t.id !== 'tpl-5').map((tpl) => {
            const Icon = templateIcons[tpl.icon] || Wrench
            const isSelected = config.templateId === tpl.id
            return (
              <button
                key={tpl.id}
                onClick={() => handleTemplateSelect(tpl.id)}
                className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3 ${
                  isSelected ? 'border-accent-purple bg-accent-purple/5' : 'border-border bg-bg-secondary hover:border-border-light'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? 'bg-accent-purple/10' : 'bg-bg-tertiary'}`}>
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-accent-purple' : 'text-text-muted'}`} />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-text-primary">{tpl.name}</div>
                  <div className="text-xs text-text-secondary mt-0.5">{tpl.description}</div>
                  <div className="flex gap-3 mt-1.5 text-[10px] text-text-muted">
                    <span>{tpl.stages} stages</span>
                    <span>~{tpl.estimatedDuration}</span>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {config.templateId && (
        <>
          {/* Pipeline parameters */}
          <div className="bg-bg-secondary border border-border rounded-xl overflow-hidden">
            <button
              onClick={() => setShowParams(!showParams)}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-bg-tertiary/50 transition-colors"
            >
              <span className="text-sm font-medium text-text-primary">Pipeline Parameters</span>
              {showParams ? <ChevronDown className="w-4 h-4 text-text-muted" /> : <ChevronRight className="w-4 h-4 text-text-muted" />}
            </button>
            {showParams && (
              <div className="px-4 pb-4 space-y-3">
                {Object.entries(config.params).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-3">
                    <label className="text-xs font-mono text-accent-cyan w-36 shrink-0">{key}</label>
                    <input
                      type="text"
                      value={String(value)}
                      onChange={(e) => onChange({ ...config, params: { ...config.params, [key]: e.target.value } })}
                      className="flex-1 px-3 py-1.5 bg-bg-tertiary border border-border rounded-lg text-sm text-text-primary font-mono"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Trigger configuration */}
          <div className="bg-bg-secondary border border-border rounded-xl p-4 space-y-3">
            <h4 className="text-sm font-medium text-text-primary">Trigger Configuration</h4>
            <div className="flex gap-2">
              {(['once', 'schedule', 'event'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => onChange({ ...config, trigger: t })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    config.trigger === t
                      ? 'bg-accent-blue/10 text-accent-blue border border-accent-blue/30'
                      : 'bg-bg-tertiary text-text-muted hover:text-text-secondary border border-transparent'
                  }`}
                >
                  {t === 'once' ? 'Run Once' : t === 'schedule' ? 'Scheduled' : 'Event-Driven'}
                </button>
              ))}
            </div>
            {config.trigger === 'schedule' && (
              <div>
                <label className="block text-xs text-text-secondary mb-1">Cron Schedule</label>
                <input
                  type="text"
                  value={config.schedule}
                  onChange={(e) => onChange({ ...config, schedule: e.target.value })}
                  placeholder="0 8 * * 1 (Weekly Monday 8am)"
                  className="w-full px-3 py-2 bg-bg-tertiary border border-border rounded-lg text-sm text-text-primary font-mono placeholder-text-muted"
                />
              </div>
            )}
            {config.trigger === 'event' && (
              <div>
                <label className="block text-xs text-text-secondary mb-1">Event Source</label>
                <select
                  value={config.eventSource}
                  onChange={(e) => onChange({ ...config, eventSource: e.target.value })}
                  className="w-full px-3 py-2 bg-bg-tertiary border border-border rounded-lg text-sm text-text-primary"
                >
                  <option value="data_drift">Data Drift Detected (&gt;5% shift)</option>
                  <option value="new_data">New Training Data (S3 upload)</option>
                  <option value="model_degradation">Model Performance Degradation</option>
                </select>
              </div>
            )}
          </div>

          {/* Data source for training */}
          <div className="bg-bg-secondary border border-border rounded-xl p-4">
            <label className="block text-sm font-medium text-text-primary mb-2">Training Data Source</label>
            <input
              type="text"
              value={config.dataSource}
              onChange={(e) => onChange({ ...config, dataSource: e.target.value })}
              placeholder="s3://your-bucket/training-data/"
              className="w-full px-3 py-2 bg-bg-tertiary border border-border rounded-lg text-sm text-text-primary font-mono placeholder-text-muted"
            />
            <p className="text-[10px] text-text-muted mt-1">S3 path to your training dataset (JSONL, Parquet, or CSV format)</p>
          </div>
        </>
      )}
    </div>
  )
}
