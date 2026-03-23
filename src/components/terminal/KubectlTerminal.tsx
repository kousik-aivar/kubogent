import { useState, useRef, useEffect, useCallback } from 'react'
import { kubectlMockResponses } from '../../data/terminalMockData'
import type { TerminalCommand } from '../../types'

interface KubectlTerminalProps {
  clusterName?: string
  namespace?: string
}

function parseColorTokens(text: string): React.ReactNode[] {
  const colorMap: Record<string, string> = {
    green: 'text-accent-green',
    red: 'text-accent-red',
    yellow: 'text-accent-amber',
    cyan: 'text-accent-cyan',
    reset: '',
  }

  const parts: React.ReactNode[] = []
  let remaining = text
  let currentColor = ''
  let key = 0

  while (remaining.length > 0) {
    const match = remaining.match(/\{\{(\w+)\}\}/)
    if (!match || match.index === undefined) {
      parts.push(
        <span key={key++} className={currentColor}>
          {remaining}
        </span>
      )
      break
    }

    if (match.index > 0) {
      parts.push(
        <span key={key++} className={currentColor}>
          {remaining.slice(0, match.index)}
        </span>
      )
    }

    const colorName = match[1]
    currentColor = colorMap[colorName] || ''
    remaining = remaining.slice(match.index + match[0].length)
  }

  return parts
}

function executeCommand(input: string): { output: string; isError: boolean } {
  const trimmed = input.trim()
  if (!trimmed) return { output: '', isError: false }
  if (trimmed === 'clear') return { output: '__CLEAR__', isError: false }

  for (const mock of kubectlMockResponses) {
    const match = trimmed.match(mock.pattern)
    if (match) {
      const response = typeof mock.response === 'function' ? mock.response(match) : mock.response
      return { output: response, isError: mock.isError ?? false }
    }
  }

  return {
    output: `bash: ${trimmed.split(' ')[0]}: command not found\nType 'help' for a list of supported commands.`,
    isError: true,
  }
}

export default function KubectlTerminal({ clusterName = 'eks-prod-us-east-1', namespace = 'default' }: KubectlTerminalProps) {
  const [history, setHistory] = useState<TerminalCommand[]>([
    {
      input: '',
      output: `Welcome to {{cyan}}Kubogent kubectl Console{{reset}}
Connected to cluster: {{green}}${clusterName}{{reset}}
Type '{{cyan}}help{{reset}}' for a list of supported commands.\n`,
      timestamp: new Date().toISOString(),
    },
  ])
  const [currentInput, setCurrentInput] = useState('')
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const outputRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = useCallback(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [history, scrollToBottom])

  const handleSubmit = () => {
    const trimmed = currentInput.trim()
    if (!trimmed) return

    const result = executeCommand(trimmed)

    if (result.output === '__CLEAR__') {
      setHistory([])
      setCurrentInput('')
      setCommandHistory(prev => [trimmed, ...prev])
      setHistoryIndex(-1)
      return
    }

    setHistory(prev => [
      ...prev,
      {
        input: trimmed,
        output: result.output,
        timestamp: new Date().toISOString(),
        isError: result.isError,
      },
    ])
    setCommandHistory(prev => [trimmed, ...prev])
    setCurrentInput('')
    setHistoryIndex(-1)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit()
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (commandHistory.length > 0) {
        const newIndex = Math.min(historyIndex + 1, commandHistory.length - 1)
        setHistoryIndex(newIndex)
        setCurrentInput(commandHistory[newIndex])
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1
        setHistoryIndex(newIndex)
        setCurrentInput(commandHistory[newIndex])
      } else {
        setHistoryIndex(-1)
        setCurrentInput('')
      }
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault()
      setHistory([])
    }
  }

  const prompt = (
    <>
      <span className="text-accent-green">kubogent@{clusterName.split('-').slice(0, 2).join('-')}</span>
      <span className="text-text-muted">:</span>
      <span className="text-accent-blue">~/{namespace}</span>
      <span className="text-text-muted">$ </span>
    </>
  )

  return (
    <div
      className="bg-bg-primary border border-border rounded-xl overflow-hidden flex flex-col"
      style={{ height: 'calc(100vh - 220px)', minHeight: '400px' }}
      onClick={() => inputRef.current?.focus()}
    >
      {/* Header */}
      <div className="bg-bg-secondary border-b border-border px-4 py-2.5 flex items-center gap-3 shrink-0">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-accent-red" />
          <div className="w-3 h-3 rounded-full bg-accent-amber" />
          <div className="w-3 h-3 rounded-full bg-accent-green" />
        </div>
        <span className="font-mono text-xs text-text-secondary">kubectl console</span>
        <span className="ml-auto px-2.5 py-0.5 rounded-full bg-bg-tertiary text-xs font-mono text-accent-cyan">
          {clusterName}
        </span>
        <span className="px-2.5 py-0.5 rounded-full bg-bg-tertiary text-xs font-mono text-accent-purple">
          ns:{namespace}
        </span>
      </div>

      {/* Output area */}
      <div ref={outputRef} className="flex-1 overflow-y-auto p-4 font-mono text-sm space-y-2">
        {history.map((cmd, i) => (
          <div key={i}>
            {cmd.input && (
              <div className="flex">
                {prompt}
                <span className="text-text-primary">{cmd.input}</span>
              </div>
            )}
            {cmd.output && (
              <pre className={`whitespace-pre-wrap mt-1 ${cmd.isError ? 'text-accent-red' : 'text-text-secondary'}`}>
                {cmd.output.split('\n').map((line, j) => (
                  <div key={j}>{parseColorTokens(line)}</div>
                ))}
              </pre>
            )}
          </div>
        ))}

        {/* Current input line */}
        <div className="flex items-center">
          {prompt}
          <input
            ref={inputRef}
            type="text"
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="bg-transparent border-none outline-none flex-1 font-mono text-sm text-text-primary caret-accent-green"
            autoFocus
            spellCheck={false}
            autoComplete="off"
          />
        </div>
      </div>
    </div>
  )
}
