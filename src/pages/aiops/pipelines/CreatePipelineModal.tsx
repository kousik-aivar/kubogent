import { useState } from 'react'
import { X, Brain, BarChart3, Database, Rocket, Settings, Check } from 'lucide-react'
import { pipelineTemplates } from '../../../data/mockPipelines'

const templateIcons: Record<string, typeof Brain> = { Brain, BarChart3, Database, Rocket, Settings }

export default function CreatePipelineModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1)
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [scheduler, setScheduler] = useState('Argo Workflows')
  const [description, setDescription] = useState('')
  const [created, setCreated] = useState(false)

  const handleCreate = () => {
    setCreated(true)
    setTimeout(onClose, 1500)
  }

  const selectedTpl = pipelineTemplates.find(t => t.id === selectedTemplate)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-bg-secondary border border-border rounded-xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text-primary">Create Pipeline</h2>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary"><X className="w-5 h-5" /></button>
        </div>

        {/* Steps indicator */}
        <div className="px-6 py-3 border-b border-border flex items-center gap-4">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                s < step ? 'bg-accent-green text-white' : s === step ? 'bg-accent-blue text-white' : 'bg-bg-tertiary text-text-muted'
              }`}>
                {s < step ? <Check className="w-3 h-3" /> : s}
              </div>
              <span className={`text-xs ${s === step ? 'text-text-primary' : 'text-text-muted'}`}>
                {s === 1 ? 'Template' : s === 2 ? 'Configure' : 'Review'}
              </span>
              {s < 3 && <div className="w-8 h-px bg-border" />}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {created ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 rounded-full bg-accent-green/10 flex items-center justify-center mx-auto mb-4">
                <Check className="w-6 h-6 text-accent-green" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">Pipeline Created!</h3>
              <p className="text-sm text-text-secondary">Your pipeline is ready to configure and run.</p>
            </div>
          ) : step === 1 ? (
            <div className="space-y-3">
              <p className="text-sm text-text-secondary mb-4">Choose a template to get started:</p>
              {pipelineTemplates.map((tpl) => {
                const Icon = templateIcons[tpl.icon] || Settings
                const isSelected = selectedTemplate === tpl.id
                return (
                  <button
                    key={tpl.id}
                    onClick={() => setSelectedTemplate(tpl.id)}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      isSelected
                        ? 'border-accent-blue bg-accent-blue/5'
                        : 'border-border bg-bg-tertiary hover:border-border-light'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isSelected ? 'bg-accent-blue/10' : 'bg-bg-elevated'}`}>
                        <Icon className={`w-4 h-4 ${isSelected ? 'text-accent-blue' : 'text-text-muted'}`} />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-text-primary">{tpl.name}</div>
                        <div className="text-xs text-text-secondary mt-0.5">{tpl.description}</div>
                        <div className="flex gap-3 mt-2 text-xs text-text-muted">
                          {tpl.stages > 0 && <span>{tpl.stages} stages</span>}
                          <span>~{tpl.estimatedDuration}</span>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-accent-blue flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          ) : step === 2 ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-text-secondary mb-1">Pipeline Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., My Fine-Tuning Pipeline"
                  className="w-full px-3 py-2 bg-bg-tertiary border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-blue"
                />
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1">Scheduler</label>
                <select
                  value={scheduler}
                  onChange={(e) => setScheduler(e.target.value)}
                  className="w-full px-3 py-2 bg-bg-tertiary border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent-blue"
                >
                  <option>Argo Workflows</option>
                  <option>Kubeflow</option>
                  <option>Kueue</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your pipeline..."
                  rows={3}
                  className="w-full px-3 py-2 bg-bg-tertiary border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-blue resize-none"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-text-primary">Review Configuration</h3>
              <div className="bg-bg-tertiary rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between py-1"><span className="text-text-muted">Template</span><span className="text-text-primary">{selectedTpl?.name}</span></div>
                <div className="flex justify-between py-1"><span className="text-text-muted">Name</span><span className="text-text-primary">{name || 'Untitled Pipeline'}</span></div>
                <div className="flex justify-between py-1"><span className="text-text-muted">Scheduler</span><span className="text-text-primary">{scheduler}</span></div>
                <div className="flex justify-between py-1"><span className="text-text-muted">Stages</span><span className="text-text-primary">{selectedTpl?.stages || 0}</span></div>
                {description && <div className="pt-2 border-t border-border"><span className="text-text-muted">Description:</span><p className="text-text-secondary mt-1">{description}</p></div>}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {!created && (
          <div className="px-6 py-4 border-t border-border flex items-center justify-between">
            <button
              onClick={() => step > 1 ? setStep(step - 1) : onClose()}
              className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              {step === 1 ? 'Cancel' : 'Back'}
            </button>
            <button
              onClick={() => step < 3 ? setStep(step + 1) : handleCreate()}
              disabled={step === 1 && !selectedTemplate}
              className="px-4 py-2 bg-accent-blue text-white rounded-lg text-sm font-medium hover:bg-accent-blue/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {step === 3 ? 'Create Pipeline' : 'Next'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
