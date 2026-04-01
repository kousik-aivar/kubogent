import { GitBranch, Rocket } from 'lucide-react'
import type { PipelineCreationPath } from '../../../../types'

interface PipelineTypeStepProps {
  selected: PipelineCreationPath
  onSelect: (path: PipelineCreationPath) => void
}

export default function PipelineTypeStep({ selected, onSelect }: PipelineTypeStepProps) {
  const options = [
    {
      key: 'training' as const,
      icon: GitBranch,
      color: 'accent-purple',
      title: 'Training / Fine-Tuning Pipeline',
      description: 'Build a full ML lifecycle: fine-tune the model on your data, evaluate it, get approval, then deploy to inference.',
      details: [
        'LoRA, QLoRA, SFT, DPO and more',
        'Training data from S3',
        'Automated or manual approval gate',
        'Intelligent inference engine selection',
      ],
    },
    {
      key: 'direct' as const,
      icon: Rocket,
      color: 'accent-green',
      title: 'Direct to Inference',
      description: 'Skip training — deploy the selected model as-is directly to a serving endpoint.',
      details: [
        'Fastest path to production',
        'For already fine-tuned models',
        'Configure inference engine and cluster',
        'No training data required',
      ],
    },
  ]

  return (
    <div>
      <h3 className="text-lg font-semibold text-text-primary mb-1">Pipeline Type</h3>
      <p className="text-sm text-text-secondary mb-5">Choose the purpose of this pipeline.</p>
      <div className="grid grid-cols-2 gap-4">
        {options.map((opt) => {
          const isSelected = selected === opt.key
          return (
            <button
              key={opt.key}
              onClick={() => onSelect(opt.key)}
              className={`text-left p-5 rounded-xl border-2 transition-colors ${
                isSelected
                  ? `border-${opt.color} bg-${opt.color}/5`
                  : 'border-border bg-bg-secondary hover:border-border-light'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${isSelected ? `bg-${opt.color}/10` : 'bg-bg-tertiary'}`}>
                <opt.icon className={`w-5 h-5 ${isSelected ? `text-${opt.color}` : 'text-text-muted'}`} />
              </div>
              <div className="text-base font-semibold text-text-primary mb-1">{opt.title}</div>
              <p className="text-sm text-text-secondary mb-3">{opt.description}</p>
              <ul className="space-y-1">
                {opt.details.map((d) => (
                  <li key={d} className="flex items-center gap-2 text-xs text-text-muted">
                    <div className={`w-1 h-1 rounded-full ${isSelected ? `bg-${opt.color}` : 'bg-text-muted'}`} />
                    {d}
                  </li>
                ))}
              </ul>
            </button>
          )
        })}
      </div>
    </div>
  )
}
