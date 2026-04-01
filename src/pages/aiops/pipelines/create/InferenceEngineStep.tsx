import { useState } from 'react'
import { X, Settings, Sparkles } from 'lucide-react'
import { INFERENCE_ENGINE_RECOMMENDATIONS, MODEL_CATEGORY_LABELS } from '../../../../types'
import type { InferenceEngine, InferenceEngineConfig } from '../../../../types'
import { mockModels } from '../../../../data/mockModels'

interface InferenceEngineStepProps {
  modelId: string | null
  selectedEngine: InferenceEngine | null
  engineConfig: InferenceEngineConfig | null
  onSelect: (engine: InferenceEngine, config: InferenceEngineConfig) => void
}

const engineDescriptions: Record<InferenceEngine, string> = {
  'vLLM':          'PagedAttention-based serving. Highest throughput for LLMs. Best for high-concurrency text generation.',
  'Ray Serve':     'Flexible distributed serving. Good for multi-model pipelines and custom pre/post-processing.',
  'Triton':        'NVIDIA\'s production inference server. Supports ONNX, TensorRT, PyTorch. Best for Triton-native models.',
  'TensorRT-LLM':  'NVIDIA TensorRT optimised for LLM inference. Lowest latency on A100/H100. Requires TRT compilation.',
}

const defaultParams: Record<InferenceEngine, Record<string, string | number | boolean>> = {
  'vLLM': {
    tensor_parallel_size: 1,
    max_model_len: 4096,
    dtype: 'auto',
    gpu_memory_utilization: 0.9,
    max_num_seqs: 256,
    quantization: 'none',
  },
  'Ray Serve': {
    num_replicas: 2,
    max_concurrent_queries: 100,
    num_gpus: 1,
    autoscaling_min_replicas: 1,
    autoscaling_max_replicas: 4,
    autoscaling_target_num_ongoing_requests: 10,
  },
  'Triton': {
    model_format: 'pytorch',
    instance_group_kind: 'KIND_GPU',
    instance_group_count: 1,
    dynamic_batching_max_queue_delay_microseconds: 100,
    preferred_batch_size: 8,
    backend: 'pytorch_libtorch',
  },
  'TensorRT-LLM': {
    max_batch_size: 8,
    max_input_len: 2048,
    max_output_len: 512,
    tp_size: 1,
    pp_size: 1,
    quantization: 'int8',
  },
}

function EngineConfigPanel({ engine, config, onClose, onChange }: {
  engine: InferenceEngine
  config: Record<string, string | number | boolean>
  onClose: () => void
  onChange: (key: string, value: string | number | boolean) => void
}) {
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 h-screen w-96 bg-bg-secondary border-l border-border z-50 flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-accent-blue" />
            <span className="text-sm font-semibold text-text-primary">{engine} Configuration</span>
          </div>
          <button onClick={onClose} aria-label="Close panel" className="p-1.5 rounded-lg hover:bg-bg-tertiary transition-colors">
            <X className="w-4 h-4 text-text-secondary" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {Object.entries(config).map(([key, value]) => (
            <div key={key}>
              <label className="block text-xs text-text-secondary mb-1 font-mono">{key}</label>
              <input
                type={typeof value === 'number' ? 'number' : 'text'}
                value={String(value)}
                onChange={(e) => {
                  const parsed = typeof value === 'number' ? parseFloat(e.target.value) : e.target.value
                  onChange(key, isNaN(parsed as number) ? e.target.value : parsed)
                }}
                className="w-full px-3 py-2 bg-bg-tertiary border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent-blue transition-colors"
              />
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export default function InferenceEngineStep({ modelId, selectedEngine, engineConfig, onSelect }: InferenceEngineStepProps) {
  const [configPanelEngine, setConfigPanelEngine] = useState<InferenceEngine | null>(null)
  const [localConfigs, setLocalConfigs] = useState<Partial<Record<InferenceEngine, Record<string, string | number | boolean>>>>({})

  const model = mockModels.find((m) => m.id === modelId)
  const recommendedEngines = model ? INFERENCE_ENGINE_RECOMMENDATIONS[model.modelCategory] : []
  const allEngines: InferenceEngine[] = ['vLLM', 'Ray Serve', 'Triton', 'TensorRT-LLM']

  function getConfig(engine: InferenceEngine): Record<string, string | number | boolean> {
    return localConfigs[engine] ?? { ...defaultParams[engine] }
  }

  function handleParamChange(engine: InferenceEngine, key: string, value: string | number | boolean) {
    const updated = { ...getConfig(engine), [key]: value }
    setLocalConfigs((prev) => ({ ...prev, [engine]: updated }))
    if (selectedEngine === engine) {
      onSelect(engine, { engine, params: updated })
    }
  }

  function handleSelect(engine: InferenceEngine) {
    onSelect(engine, { engine, params: getConfig(engine) })
  }

  return (
    <div>
      <h3 className="text-lg font-semibold text-text-primary mb-1">Inference Engine</h3>
      <p className="text-sm text-text-secondary mb-5">
        Select the serving engine for{' '}
        <span className="text-text-primary font-medium">
          {model ? `${MODEL_CATEGORY_LABELS[model.modelCategory]} models` : 'this model'}
        </span>
        . AIVA recommends the best fit based on model type.
      </p>

      <div className="space-y-3">
        {allEngines.map((engine) => {
          const isSelected = selectedEngine === engine
          const isRecommended = recommendedEngines[0] === engine
          const isCompatible = recommendedEngines.includes(engine)

          return (
            <div
              key={engine}
              className={`p-4 rounded-xl border-2 transition-colors ${
                isSelected
                  ? 'border-accent-blue bg-accent-blue/5'
                  : isCompatible
                  ? 'border-border bg-bg-secondary hover:border-border-light'
                  : 'border-border bg-bg-secondary opacity-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <button onClick={() => handleSelect(engine)} className="flex-1 text-left">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-text-primary">{engine}</span>
                    {isRecommended && (
                      <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-accent-purple/10 text-accent-purple font-medium">
                        <Sparkles className="w-3 h-3" /> Recommended
                      </span>
                    )}
                    {!isCompatible && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-bg-tertiary text-text-muted">
                        Not optimised for this model type
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-text-secondary">{engineDescriptions[engine]}</p>
                </button>
                <button
                  onClick={() => setConfigPanelEngine(configPanelEngine === engine ? null : engine)}
                  aria-label={`Configure ${engine}`}
                  className="p-1.5 rounded-lg hover:bg-bg-tertiary transition-colors ml-3 flex-shrink-0"
                >
                  <Settings className="w-4 h-4 text-text-secondary" />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {configPanelEngine && (
        <EngineConfigPanel
          engine={configPanelEngine}
          config={getConfig(configPanelEngine)}
          onClose={() => setConfigPanelEngine(null)}
          onChange={(key, value) => handleParamChange(configPanelEngine, key, value)}
        />
      )}

      {engineConfig && selectedEngine && (
        <div className="mt-4 p-3 bg-bg-tertiary rounded-xl border border-border">
          <p className="text-xs text-text-muted">
            Selected: <span className="text-text-primary font-medium">{selectedEngine}</span>
            {' · '}
            <button onClick={() => setConfigPanelEngine(selectedEngine)} className="text-accent-blue hover:underline">
              Edit configuration
            </button>
          </p>
        </div>
      )}
    </div>
  )
}
