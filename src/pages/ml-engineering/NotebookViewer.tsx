import type { MockNotebook, NotebookCell } from '../../data/mockNotebooks'

function MarkdownCell({ content }: { content: string }) {
  // Render a minimal markdown cell: bold, headers, regular text
  const lines = content.split('\n')
  return (
    <div className="px-4 py-3 text-sm text-text-secondary leading-relaxed">
      {lines.map((line, i) => {
        if (line.startsWith('## ')) {
          return <p key={i} className="text-base font-semibold text-text-primary mb-1">{line.slice(3)}</p>
        }
        if (line.startsWith('# ')) {
          return <p key={i} className="text-lg font-semibold text-text-primary mb-2">{line.slice(2)}</p>
        }
        if (!line) return <div key={i} className="h-2" />
        // Render **bold** text
        const parts = line.split(/(\*\*[^*]+\*\*)/)
        return (
          <p key={i} className="mb-1">
            {parts.map((part, j) =>
              part.startsWith('**') && part.endsWith('**')
                ? <strong key={j} className="text-text-primary font-medium">{part.slice(2, -2)}</strong>
                : part
            )}
          </p>
        )
      })}
    </div>
  )
}

function CodeCell({ cell }: { cell: NotebookCell }) {
  return (
    <div className="flex gap-0 group">
      {/* Execution count gutter */}
      <div className="w-14 flex-shrink-0 pt-3 pr-3 text-right">
        <span className="text-xs text-text-muted font-mono">
          {cell.executionCount !== undefined ? `[${cell.executionCount}]:` : '[ ]:'}
        </span>
      </div>
      {/* Code content */}
      <div className="flex-1 bg-bg-primary border border-border-light rounded-lg overflow-hidden">
        <pre className="p-4 text-xs font-mono text-text-primary overflow-x-auto leading-5 whitespace-pre">
          {cell.content}
        </pre>
      </div>
    </div>
  )
}

function OutputCell({ content }: { content: string }) {
  return (
    <div className="flex gap-0">
      <div className="w-14 flex-shrink-0" />
      <div className="flex-1 bg-bg-tertiary rounded-lg px-4 py-3">
        <pre className="text-xs font-mono text-text-secondary whitespace-pre-wrap leading-5">
          {content}
        </pre>
      </div>
    </div>
  )
}

interface NotebookViewerProps {
  notebook: MockNotebook
}

export default function NotebookViewer({ notebook }: NotebookViewerProps) {
  return (
    <div className="mt-4 bg-bg-secondary border border-border rounded-xl overflow-hidden">
      {/* Notebook toolbar */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border bg-bg-secondary">
        <span className="text-xs px-2 py-0.5 rounded bg-bg-tertiary text-accent-green font-mono">Python 3.11 | Idle</span>
        <div className="h-3.5 w-px bg-border" />
        <span className="text-xs text-text-muted">
          {notebook.cells.filter(c => c.type === 'code').length} cells
          {notebook.lastRun && ` · last run ${notebook.lastRun}`}
        </span>
      </div>
      {/* Cells */}
      <div className="p-4 space-y-3">
        {notebook.cells.map((cell, i) => {
          if (cell.type === 'markdown') return <MarkdownCell key={i} content={cell.content} />
          if (cell.type === 'code')     return <CodeCell key={i} cell={cell} />
          if (cell.type === 'output')   return <OutputCell key={i} content={cell.content} />
          return null
        })}
      </div>
    </div>
  )
}
