import { useCallback } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  type Node,
  type Edge,
  Handle,
  Position,
  BackgroundVariant,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { Database, Cpu, CheckSquare, ShieldCheck, Rocket, Activity, Users } from 'lucide-react'
import type { PipelineCreationPath, PipelineCreationState } from '../../../../types'
import { mockModels } from '../../../../data/mockModels'
import { mockClusters } from '../../../../data/mockClusters'

interface PreviewNodeData {
  label: string
  subtitle: string
  type: string
  status: 'ready' | 'optional'
  [key: string]: unknown
}

const typeConfig: Record<string, { color: string; Icon: typeof Database }> = {
  'model-source': { color: '#3b82f6', Icon: Database },
  'data-prep':    { color: '#3b82f6', Icon: Database },
  'training':     { color: '#a855f7', Icon: Cpu },
  'evaluation':   { color: '#f59e0b', Icon: CheckSquare },
  'approval':     { color: '#f59e0b', Icon: Users },
  'deployment':   { color: '#22c55e', Icon: Rocket },
  'monitoring':   { color: '#06b6d4', Icon: Activity },
  'safety':       { color: '#ef4444', Icon: ShieldCheck },
}

function PreviewNode({ data }: { data: PreviewNodeData }) {
  const cfg = typeConfig[data.type] ?? typeConfig['deployment']
  const { Icon } = cfg

  return (
    <div
      className="bg-bg-secondary border border-border rounded-xl overflow-hidden w-44"
      style={{ borderTop: `3px solid ${cfg.color}` }}
    >
      <Handle type="target" position={Position.Left} style={{ background: cfg.color, border: 'none', width: 8, height: 8 }} />
      <div className="px-3 py-2.5">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-5 h-5 rounded flex items-center justify-center" style={{ background: `${cfg.color}20` }}>
            <Icon style={{ color: cfg.color }} className="w-3 h-3" />
          </div>
          <span className="text-xs font-medium text-text-primary leading-tight">{data.label}</span>
        </div>
        <p className="text-[10px] text-text-muted leading-tight">{data.subtitle}</p>
      </div>
      <Handle type="source" position={Position.Right} style={{ background: cfg.color, border: 'none', width: 8, height: 8 }} />
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const nodeTypes: Record<string, any> = { previewNode: PreviewNode }

function buildNodes(state: PipelineCreationState): { nodes: PreviewNodeData[]; edges: string[][] } {
  const model = mockModels.find((m) => m.id === state.modelId)
  const cluster = mockClusters.find((c) => c.id === state.clusterId)

  if (state.pipelinePath === 'direct') {
    return {
      nodes: [
        { label: model?.name ?? 'Model', subtitle: model ? `${model.parameters} · ${model.source}` : 'Base model', type: 'model-source', status: 'ready' },
        { label: 'Deploy to Inference', subtitle: `${state.inferenceEngine ?? 'Engine TBD'} · ${cluster?.name ?? 'Cluster TBD'}`, type: 'deployment', status: 'ready' },
        { label: 'Monitoring', subtitle: 'Latency, throughput, GPU', type: 'monitoring', status: 'ready' },
      ],
      edges: [['0', '1'], ['1', '2']],
    }
  }

  const nodes: PreviewNodeData[] = [
    { label: model?.name ?? 'Model', subtitle: model ? `${model.parameters} · ${model.source}` : 'Base model', type: 'model-source', status: 'ready' },
    { label: 'Data Preparation', subtitle: state.dataS3Path ? state.dataS3Path.split('/').slice(-2).join('/') : 'S3 source', type: 'data-prep', status: 'ready' },
    { label: state.trainingMethod ?? 'Training', subtitle: `Fine-tuning stage`, type: 'training', status: 'ready' },
    { label: 'Evaluation', subtitle: state.evalApproval.metrics.length > 0 ? state.evalApproval.metrics.slice(0, 2).join(', ') : 'Metrics TBD', type: 'evaluation', status: 'ready' },
    { label: state.evalApproval.approvalMode === 'manual' ? 'Manual Approval' : 'Auto Approval', subtitle: state.evalApproval.approvalMode === 'manual' ? 'Human review gate' : 'Automated threshold check', type: 'approval', status: 'ready' },
    { label: 'Deploy to Inference', subtitle: `${state.inferenceEngine ?? 'Engine TBD'} · ${cluster?.name ?? 'Cluster TBD'}`, type: 'deployment', status: 'ready' },
    { label: 'Monitoring', subtitle: 'Latency, throughput, GPU', type: 'monitoring', status: 'ready' },
  ]

  const edges: string[][] = [['0', '1'], ['1', '2'], ['2', '3'], ['3', '4'], ['4', '5'], ['5', '6']]
  return { nodes, edges }
}

function buildReactFlowData(state: PipelineCreationState): { nodes: Node[]; edges: Edge[] } {
  const { nodes: rawNodes, edges: rawEdges } = buildNodes(state)
  const isTraining = state.pipelinePath === 'training'
  const xGap = 210
  const totalWidth = rawNodes.length * xGap
  const startX = -totalWidth / 2 + xGap / 2

  const nodes: Node[] = rawNodes.map((n, i) => ({
    id: String(i),
    type: 'previewNode',
    position: { x: startX + i * xGap, y: isTraining ? (i % 2 === 0 ? 0 : 60) : 0 },
    data: n,
  }))

  const edges: Edge[] = rawEdges.map(([s, t]) => ({
    id: `e${s}-${t}`,
    source: s,
    target: t,
    style: { stroke: '#333333', strokeWidth: 1.5, strokeDasharray: '6 3' },
    animated: false,
  }))

  return { nodes, edges }
}

interface PipelineGraphStepProps {
  state: PipelineCreationState
  pipelinePath: PipelineCreationPath
}

export default function PipelineGraphStep({ state }: PipelineGraphStepProps) {
  const { nodes, edges } = buildReactFlowData(state)
  const onNodeClick = useCallback(() => {}, [])

  return (
    <div>
      <h3 className="text-lg font-semibold text-text-primary mb-1">Pipeline Preview</h3>
      <p className="text-sm text-text-secondary mb-5">
        This is your pipeline graph based on the configuration above. Each node represents a stage.
        Click any node to review its settings.
      </p>
      <div className="bg-bg-secondary border border-border rounded-xl overflow-hidden" style={{ height: 320 }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodeClick={onNodeClick}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          zoomOnScroll={false}
          panOnDrag={false}
          preventScrolling={false}
        >
          <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="#333333" />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>
      <p className="text-xs text-text-muted mt-3 text-center">
        {nodes.length} stages · {state.pipelinePath === 'training' ? 'Training + Inference pipeline' : 'Direct inference pipeline'}
      </p>
    </div>
  )
}
