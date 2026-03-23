import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import type { Pipeline } from '../../../types'

export default function PipelineCodeTab({ pipeline }: { pipeline: Pipeline }) {
  const [copied, setCopied] = useState(false)
  const [format, setFormat] = useState<'yaml' | 'python'>('yaml')

  const yamlContent = pipeline.yamlDefinition || '# No YAML definition available'

  const pythonContent = `# Auto-generated Python SDK definition for ${pipeline.name}
from kubogent.pipelines import Pipeline, Stage

pipeline = Pipeline(
    name="${pipeline.name.toLowerCase().replace(/\s+/g, '-')}",
    scheduler="${pipeline.scheduler.toLowerCase().replace(/\s+/g, '-')}",
    description="${pipeline.description || ''}",
)

${pipeline.stages.map((s, i) => `stage_${i + 1} = pipeline.add_stage(
    name="${s.name}",
    type="${s.type}",
    image="kubogent/${s.type}:latest",${s.resources ? `
    resources={
        "cpu": "${s.resources.cpu}",
        "memory": "${s.resources.memory}",
        "gpu": "${s.resources.gpu}",
    },` : ''}${s.parentIds && s.parentIds.length > 0 ? `
    depends_on=[${s.parentIds.map((_, j) => `stage_${pipeline.stages.findIndex(ps => ps.id === s.parentIds![j]) + 1}`).join(', ')}],` : ''}
)`).join('\n\n')}

pipeline.run()
`

  const handleCopy = () => {
    navigator.clipboard.writeText(format === 'yaml' ? yamlContent : pythonContent)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-bg-secondary border border-border rounded-lg p-1">
          {(['yaml', 'python'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFormat(f)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                format === f ? 'bg-accent-blue/10 text-accent-blue' : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              {f === 'yaml' ? 'YAML' : 'Python SDK'}
            </button>
          ))}
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-bg-tertiary border border-border text-text-secondary hover:text-text-primary transition-colors"
        >
          {copied ? <Check className="w-3 h-3 text-accent-green" /> : <Copy className="w-3 h-3" />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      <div className="bg-bg-primary border border-border rounded-xl overflow-hidden">
        <div className="px-4 py-2 border-b border-border flex items-center gap-2">
          <span className="text-xs text-text-muted">{format === 'yaml' ? `${pipeline.scheduler.toLowerCase().replace(' ', '-')}-pipeline.yaml` : 'pipeline.py'}</span>
        </div>
        <pre className="p-4 text-xs font-mono text-text-secondary overflow-x-auto max-h-[600px] overflow-y-auto leading-relaxed">
          {(format === 'yaml' ? yamlContent : pythonContent).split('\n').map((line, i) => {
            // Basic syntax highlighting
            let className = ''
            if (format === 'yaml') {
              if (line.match(/^\s*#/)) className = 'text-text-muted'
              else if (line.match(/^\s*\w+:/)) className = 'text-accent-cyan'
              else if (line.match(/^\s*- name:/)) className = 'text-accent-green'
              else if (line.match(/"[^"]*"/)) className = 'text-accent-amber'
            } else {
              if (line.match(/^\s*#/)) className = 'text-text-muted'
              else if (line.match(/^(from|import)\s/)) className = 'text-accent-purple'
              else if (line.match(/"[^"]*"/)) className = 'text-accent-amber'
              else if (line.match(/\b(pipeline|stage_\d+)\s*=/)) className = 'text-accent-cyan'
            }
            return (
              <div key={i} className="flex">
                <span className="text-text-muted w-8 text-right mr-4 select-none">{i + 1}</span>
                <span className={className}>{line || '\u00A0'}</span>
              </div>
            )
          })}
        </pre>
      </div>
    </div>
  )
}
