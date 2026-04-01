import { useState } from 'react'
import { Database, Brain, BarChart3, Rocket, Activity, Cpu, HardDrive, Zap, FileText, Download } from 'lucide-react'
import StatusBadge from '../../../components/shared/StatusBadge'
import type { PipelineStage } from '../../../types'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const typeIcons: Record<string, typeof Database> = {
  'data-prep': Database,
  training: Brain,
  evaluation: BarChart3,
  deployment: Rocket,
  monitoring: Activity,
}

const subTabs = ['Overview', 'Resources', 'Params', 'Artifacts', 'Logs', 'Metrics']

export default function StageDetailPanel({ stage, onClose }: { stage: PipelineStage; onClose: () => void }) {
  const [activeSubTab, setActiveSubTab] = useState('Overview')
  const Icon = typeIcons[stage.type] || Database

  // Generate mock training loss curve for training stages (deterministic jitter)
  const lossCurve = stage.type === 'training' && stage.metrics?.current_loss
    ? Array.from({ length: 20 }, (_, i) => ({
        step: (i + 1) * 200,
        loss: 1.8 * Math.exp(-0.08 * (i + 1)) + 0.15 + (i % 5) * 0.01,
      }))
    : null

  return (
    <div className="w-80 bg-bg-secondary border border-border rounded-xl flex flex-col overflow-hidden shrink-0">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-text-secondary" />
          <h3 className="text-sm font-medium text-text-primary">{stage.name}</h3>
        </div>
        <button onClick={onClose} className="text-text-muted hover:text-text-primary text-lg">&times;</button>
      </div>

      {/* Sub-tabs */}
      <div className="flex border-b border-border overflow-x-auto px-2">
        {subTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveSubTab(tab)}
            className={`px-2.5 py-2 text-xs font-medium whitespace-nowrap transition-colors border-b-2 ${
              activeSubTab === tab
                ? 'border-accent-blue text-accent-blue'
                : 'border-transparent text-text-muted hover:text-text-secondary'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeSubTab === 'Overview' && (
          <div className="space-y-3 text-sm">
            <div><span className="text-text-muted">Type:</span> <span className="text-text-primary capitalize">{stage.type.replace('-', ' ')}</span></div>
            <div className="flex items-center gap-2"><span className="text-text-muted">Status:</span> <StatusBadge status={stage.status} /></div>
            <div><span className="text-text-muted">Duration:</span> <span className="text-text-primary">{stage.duration}</span></div>
            {stage.description && (
              <div>
                <span className="text-text-muted block mb-1">Description:</span>
                <p className="text-text-secondary text-xs leading-relaxed">{stage.description}</p>
              </div>
            )}
            {stage.parentIds && stage.parentIds.length > 0 && (
              <div><span className="text-text-muted">Depends on:</span> <span className="text-xs text-accent-blue">{stage.parentIds.join(', ')}</span></div>
            )}
          </div>
        )}

        {activeSubTab === 'Resources' && (
          <div className="space-y-3">
            {stage.resources ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-bg-tertiary rounded-lg p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Cpu className="w-3 h-3 text-accent-blue" />
                      <span className="text-xs text-text-muted">CPU</span>
                    </div>
                    <span className="text-sm font-medium text-text-primary">{stage.resources.cpu} cores</span>
                  </div>
                  <div className="bg-bg-tertiary rounded-lg p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <HardDrive className="w-3 h-3 text-accent-purple" />
                      <span className="text-xs text-text-muted">Memory</span>
                    </div>
                    <span className="text-sm font-medium text-text-primary">{stage.resources.memory}</span>
                  </div>
                </div>
                {stage.resources.gpu !== '0' && (
                  <div className="bg-bg-tertiary rounded-lg p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Zap className="w-3 h-3 text-accent-green" />
                      <span className="text-xs text-text-muted">GPU</span>
                    </div>
                    <span className="text-sm font-medium text-text-primary">{stage.resources.gpu}</span>
                  </div>
                )}
                {stage.resources.instanceType && (
                  <div className="text-xs text-text-muted">Instance: <span className="text-text-secondary">{stage.resources.instanceType}</span></div>
                )}
              </>
            ) : (
              <p className="text-xs text-text-muted">No resource configuration</p>
            )}
          </div>
        )}

        {activeSubTab === 'Params' && (
          <div className="space-y-1">
            {stage.parameters && Object.keys(stage.parameters).length > 0 ? (
              <div className="bg-bg-primary rounded-lg border border-border overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left px-3 py-2 text-text-muted font-medium">Parameter</th>
                      <th className="text-left px-3 py-2 text-text-muted font-medium">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(stage.parameters).map(([key, value]) => (
                      <tr key={key} className="border-b border-border last:border-0">
                        <td className="px-3 py-2 font-mono text-accent-cyan">{key}</td>
                        <td className="px-3 py-2 text-text-primary">{String(value)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-text-muted">No parameters configured</p>
            )}
          </div>
        )}

        {activeSubTab === 'Artifacts' && (
          <div className="space-y-2">
            {stage.artifacts && stage.artifacts.length > 0 ? (
              stage.artifacts.map((artifact, i) => (
                <div key={i} className="bg-bg-tertiary rounded-lg p-3 flex items-start gap-2">
                  <FileText className="w-4 h-4 text-text-muted shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-text-primary truncate">{artifact.name}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                        artifact.type === 'input' ? 'bg-accent-blue/10 text-accent-blue' : 'bg-accent-green/10 text-accent-green'
                      }`}>{artifact.type}</span>
                    </div>
                    <div className="text-[10px] text-text-muted mt-0.5 font-mono truncate">{artifact.path}</div>
                    {artifact.size && <div className="text-[10px] text-text-muted">{artifact.size}</div>}
                  </div>
                  <Download className="w-3 h-3 text-text-muted hover:text-text-primary cursor-pointer shrink-0" />
                </div>
              ))
            ) : (
              <p className="text-xs text-text-muted">No artifacts</p>
            )}
          </div>
        )}

        {activeSubTab === 'Logs' && (
          <div className="bg-bg-primary border border-border rounded-lg p-3 font-mono text-[10px] max-h-80 overflow-y-auto space-y-0.5">
            {stage.logs && stage.logs.length > 0 ? (
              stage.logs.map((line, i) => {
                const isError = line.includes('ERROR')
                const isWarn = line.includes('WARN')
                return (
                  <div key={i} className={`${isError ? 'text-accent-red' : isWarn ? 'text-accent-amber' : 'text-text-secondary'}`}>
                    {line}
                  </div>
                )
              })
            ) : (
              <span className="text-text-muted">No logs available</span>
            )}
          </div>
        )}

        {activeSubTab === 'Metrics' && (
          <div className="space-y-3">
            {stage.metrics && Object.keys(stage.metrics).length > 0 ? (
              <>
                <div className="space-y-2">
                  {Object.entries(stage.metrics).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-xs py-1 border-b border-border last:border-0">
                      <span className="text-text-muted">{key.replace(/_/g, ' ')}</span>
                      <span className="text-text-primary font-medium">{typeof value === 'number' && value < 1 && value > 0 ? value.toFixed(3) : value}</span>
                    </div>
                  ))}
                </div>
                {lossCurve && (
                  <div className="mt-3">
                    <h4 className="text-xs text-text-muted mb-2">Training Loss</h4>
                    <ResponsiveContainer width="100%" height={120}>
                      <AreaChart data={lossCurve}>
                        <CartesianGrid stroke="#262626" strokeDasharray="3 3" />
                        <XAxis dataKey="step" tick={{ fill: '#a3a3a3', fontSize: 9 }} />
                        <YAxis tick={{ fill: '#a3a3a3', fontSize: 9 }} domain={[0, 'auto']} />
                        <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #262626', borderRadius: 8, fontSize: 11 }} />
                        <Area type="monotone" dataKey="loss" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </>
            ) : (
              <p className="text-xs text-text-muted">No metrics available yet</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
