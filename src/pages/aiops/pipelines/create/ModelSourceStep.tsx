import { useState } from 'react'
import { Search, Box } from 'lucide-react'
import StatusBadge from '../../../../components/shared/StatusBadge'
import { mockModels } from '../../../../data/mockModels'
import { MODEL_CATEGORY_LABELS } from '../../../../types'
import type { ModelCategory } from '../../../../types'

interface ModelSourceStepProps {
  selectedModelId: string | null
  onSelect: (id: string) => void
}

const categoryColors: Record<ModelCategory, string> = {
  llm: 'bg-accent-purple/10 text-accent-purple',
  slm: 'bg-accent-blue/10 text-accent-blue',
  code: 'bg-accent-cyan/10 text-accent-cyan',
  embedding: 'bg-accent-amber/10 text-accent-amber',
  stt: 'bg-accent-green/10 text-accent-green',
  tts: 'bg-accent-green/10 text-accent-green',
  vision: 'bg-accent-blue/10 text-accent-blue',
  'video-gen': 'bg-accent-red/10 text-accent-red',
  'object-detect': 'bg-accent-amber/10 text-accent-amber',
  'traditional-ml': 'bg-accent-cyan/10 text-accent-cyan',
  diffusion: 'bg-accent-purple/10 text-accent-purple',
}

export default function ModelSourceStep({ selectedModelId, onSelect }: ModelSourceStepProps) {
  const [search, setSearch] = useState('')

  const available = mockModels.filter(
    (m) => m.status === 'Available' && m.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <h3 className="text-lg font-semibold text-text-primary mb-1">Select a Model</h3>
      <p className="text-sm text-text-secondary mb-5">Choose a model from your catalog to build a pipeline around.</p>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search models..."
          className="w-full pl-10 pr-4 py-2 bg-bg-tertiary border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-blue transition-colors"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {available.map((m) => {
          const isSelected = selectedModelId === m.id
          return (
            <button
              key={m.id}
              onClick={() => onSelect(m.id)}
              className={`text-left p-4 rounded-xl border-2 transition-colors ${
                isSelected
                  ? 'border-accent-blue bg-accent-blue/5'
                  : 'border-border bg-bg-secondary hover:border-border-light'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="w-8 h-8 rounded-lg bg-bg-tertiary flex items-center justify-center">
                  <Box className="w-4 h-4 text-text-secondary" />
                </div>
                <StatusBadge status={m.status} />
              </div>
              <div className="text-sm font-medium text-text-primary mb-1">{m.name}</div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${categoryColors[m.modelCategory]}`}>
                  {MODEL_CATEGORY_LABELS[m.modelCategory]}
                </span>
                <span className="text-xs text-text-muted">{m.parameters} · {m.size}</span>
              </div>
            </button>
          )
        })}
      </div>

      {available.length === 0 && (
        <div className="bg-bg-secondary border border-border rounded-xl p-8 text-center">
          <p className="text-sm text-text-muted">No available models match your search</p>
        </div>
      )}
    </div>
  )
}
