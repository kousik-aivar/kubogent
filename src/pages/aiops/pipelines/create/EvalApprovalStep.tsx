import { CheckSquare, Users, Zap } from 'lucide-react'
import type { EvalApprovalConfig, ApprovalMode, ModelCategory } from '../../../../types'
import { mockModels } from '../../../../data/mockModels'

interface EvalApprovalStepProps {
  modelId: string | null
  config: EvalApprovalConfig
  onChange: (config: EvalApprovalConfig) => void
}

const metricsByCategory: Record<ModelCategory, string[]> = {
  llm:            ['accuracy', 'bleu', 'rouge_l', 'perplexity', 'eval_loss'],
  slm:            ['accuracy', 'bleu', 'rouge_l', 'eval_loss'],
  code:           ['pass@1', 'pass@10', 'eval_loss', 'exact_match'],
  embedding:      ['accuracy', 'f1', 'mrr', 'map'],
  stt:            ['wer', 'cer', 'eval_loss'],
  tts:            ['mos_score', 'mel_cepstral_distortion', 'eval_loss'],
  vision:         ['accuracy', 'top5_accuracy', 'eval_loss'],
  'video-gen':    ['fid', 'fvd', 'eval_loss'],
  'object-detect':['map_50', 'map_75', 'precision', 'recall'],
  'traditional-ml':['accuracy', 'f1', 'auc_roc', 'precision', 'recall'],
  diffusion:      ['fid', 'clip_score', 'eval_loss'],
}

const defaultThresholds: Record<string, number> = {
  accuracy: 0.85, bleu: 0.30, rouge_l: 0.35, perplexity: 5.0, eval_loss: 0.5,
  'pass@1': 0.60, 'pass@10': 0.80, exact_match: 0.55, f1: 0.80, mrr: 0.75, map: 0.70,
  wer: 0.05, cer: 0.03, mos_score: 3.5, mel_cepstral_distortion: 5.0,
  top5_accuracy: 0.95, fid: 50.0, fvd: 200.0, map_50: 0.60, map_75: 0.45,
  precision: 0.80, recall: 0.75, auc_roc: 0.85, clip_score: 0.25,
}

export default function EvalApprovalStep({ modelId, config, onChange }: EvalApprovalStepProps) {
  const model = mockModels.find((m) => m.id === modelId)
  const availableMetrics = model ? metricsByCategory[model.modelCategory] : []

  function toggleMetric(metric: string) {
    const metrics = config.metrics.includes(metric)
      ? config.metrics.filter((m) => m !== metric)
      : [...config.metrics, metric]
    const thresholds = { ...config.thresholds }
    if (!config.metrics.includes(metric)) {
      thresholds[metric] = defaultThresholds[metric] ?? 0.8
    }
    onChange({ ...config, metrics, thresholds })
  }

  function setThreshold(metric: string, value: string) {
    onChange({ ...config, thresholds: { ...config.thresholds, [metric]: parseFloat(value) || 0 } })
  }

  function setApprovalMode(approvalMode: ApprovalMode) {
    onChange({ ...config, approvalMode })
  }

  return (
    <div>
      <h3 className="text-lg font-semibold text-text-primary mb-1">Evaluation & Approval</h3>
      <p className="text-sm text-text-secondary mb-5">Define quality thresholds and who approves model promotion.</p>

      <div className="space-y-5">
        {/* Metrics */}
        <div className="bg-bg-secondary border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <CheckSquare className="w-4 h-4 text-accent-blue" />
            <span className="text-sm font-medium text-text-primary">Evaluation Metrics</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {availableMetrics.map((metric) => {
              const selected = config.metrics.includes(metric)
              return (
                <div key={metric} className={`p-3 rounded-lg border transition-colors ${selected ? 'border-accent-blue bg-accent-blue/5' : 'border-border bg-bg-tertiary'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <button onClick={() => toggleMetric(metric)} className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${selected ? 'border-accent-blue bg-accent-blue' : 'border-border'}`}>
                        {selected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <span className="text-sm text-text-primary font-mono">{metric}</span>
                    </button>
                  </div>
                  {selected && (
                    <div>
                      <label className="text-xs text-text-muted">Min threshold</label>
                      <input
                        type="number"
                        step="0.01"
                        value={config.thresholds[metric] ?? defaultThresholds[metric] ?? 0.8}
                        onChange={(e) => setThreshold(metric, e.target.value)}
                        className="w-full mt-1 px-2 py-1 bg-bg-secondary border border-border rounded text-xs text-text-primary focus:outline-none focus:border-accent-blue transition-colors"
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Approval mode */}
        <div className="bg-bg-secondary border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-4 h-4 text-accent-green" />
            <span className="text-sm font-medium text-text-primary">Approval Gate</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {([
              { key: 'manual' as const, icon: Users, title: 'Manual Approval', description: 'A team member must review and approve before the model is promoted to inference.' },
              { key: 'automated' as const, icon: Zap, title: 'Automated', description: 'Promote automatically if all evaluation metric thresholds are met.' },
            ]).map((opt) => {
              const isSelected = config.approvalMode === opt.key
              return (
                <button
                  key={opt.key}
                  onClick={() => setApprovalMode(opt.key)}
                  className={`text-left p-4 rounded-xl border-2 transition-colors ${isSelected ? 'border-accent-green bg-accent-green/5' : 'border-border bg-bg-tertiary hover:border-border-light'}`}
                >
                  <opt.icon className={`w-4 h-4 mb-2 ${isSelected ? 'text-accent-green' : 'text-text-muted'}`} />
                  <div className="text-sm font-medium text-text-primary mb-1">{opt.title}</div>
                  <p className="text-xs text-text-secondary">{opt.description}</p>
                </button>
              )
            })}
          </div>
        </div>

        {/* Notification channel */}
        <div className="bg-bg-secondary border border-border rounded-xl p-5">
          <label className="block text-sm font-medium text-text-primary mb-2">Notification Channel</label>
          <input
            type="text"
            value={config.notificationChannel}
            onChange={(e) => onChange({ ...config, notificationChannel: e.target.value })}
            placeholder="#ml-approvals or team@company.com"
            className="w-full px-3 py-2 bg-bg-tertiary border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-blue transition-colors"
          />
          <p className="text-xs text-text-muted mt-1.5">
            {config.approvalMode === 'manual'
              ? 'Approval request will be sent here when evaluation completes.'
              : 'Pass/fail notification will be sent here after automated evaluation.'}
          </p>
        </div>
      </div>
    </div>
  )
}
