import { Rocket, GitBranch } from 'lucide-react'

export type DeploymentPath = 'direct' | 'pipeline' | null

export default function DeploymentPathStep({ selected, onSelect }: { selected: DeploymentPath; onSelect: (path: DeploymentPath) => void }) {
  const options = [
    {
      key: 'direct' as const,
      icon: Rocket,
      title: 'Direct Deploy',
      description: 'Deploy the model as-is to an inference endpoint. Best for pre-trained or already fine-tuned models.',
      details: ['Fastest deployment path', 'Use for production-ready models', 'No additional training or evaluation'],
      color: 'accent-green',
    },
    {
      key: 'pipeline' as const,
      icon: GitBranch,
      title: 'Pipeline Deploy',
      description: 'Run the model through a pipeline first (fine-tuning, evaluation, safety checks) before deploying.',
      details: ['Fine-tune with LoRA/QLoRA', 'Automated evaluation & safety checks', 'Scheduled retraining support'],
      color: 'accent-purple',
    },
  ]

  return (
    <div>
      <h3 className="text-lg font-medium text-text-primary mb-2">Choose Deployment Path</h3>
      <p className="text-sm text-text-secondary mb-6">How would you like to deploy this model?</p>
      <div className="grid grid-cols-2 gap-4">
        {options.map((opt) => {
          const isSelected = selected === opt.key
          return (
            <button
              key={opt.key}
              onClick={() => onSelect(opt.key)}
              className={`text-left p-5 rounded-xl border-2 transition-all ${
                isSelected
                  ? `border-${opt.color} bg-${opt.color}/5`
                  : 'border-border bg-bg-secondary hover:border-border-light'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
                isSelected ? `bg-${opt.color}/10` : 'bg-bg-tertiary'
              }`}>
                <opt.icon className={`w-5 h-5 ${isSelected ? `text-${opt.color}` : 'text-text-muted'}`} />
              </div>
              <div className="text-base font-semibold text-text-primary mb-1">{opt.title}</div>
              <p className="text-sm text-text-secondary mb-3">{opt.description}</p>
              <ul className="space-y-1">
                {opt.details.map((d, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-text-muted">
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
