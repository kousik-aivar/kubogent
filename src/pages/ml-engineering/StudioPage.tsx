import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Plus, ArrowLeft, Upload, X, Clock, Tag, Maximize2, Minimize2, Copy, Check } from 'lucide-react'
import TabGroup from '../../components/shared/TabGroup'
import ExperimentsTab from './ExperimentsTab'
import WorkspaceTab from './WorkspaceTab'
import { mockNotebooks, NOTEBOOK_TEMPLATES } from '../../data/mockNotebooks'
import { MODEL_CATEGORY_LABELS } from '../../types'
import { mockBenchmarks, loadTestingResults, costPerMillionTokens } from '../../data/mockBenchmarks'
import PublishModelModal from './PublishModelModal'
import NotebookViewer from './NotebookViewer'
import type { MockNotebook } from '../../data/mockNotebooks'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import StatusBadge from '../../components/shared/StatusBadge'

// ─── New Notebook modal ───────────────────────────────────────────────────────

function NewNotebookModal({ onClose, onCreate }: {
  onClose: () => void
  onCreate: (name: string, templateId: string) => void
}) {
  const [name, setName] = useState('')
  const [template, setTemplate] = useState('blank')
  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
        <div className="bg-bg-secondary border border-border rounded-xl w-full max-w-md shadow-2xl">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h2 className="text-base font-semibold text-text-primary">New Notebook</h2>
            <button onClick={onClose} aria-label="Close" className="p-1.5 rounded-lg hover:bg-bg-tertiary transition-colors">
              <X className="w-4 h-4 text-text-secondary" />
            </button>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm text-text-secondary mb-1">Notebook Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. llama-experiment.ipynb"
                autoFocus
                className="w-full px-3 py-2 bg-bg-tertiary border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-blue transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-2">Template</label>
              <div className="space-y-2">
                {NOTEBOOK_TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTemplate(t.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      template === t.id ? 'border-accent-blue bg-accent-blue/5' : 'border-border hover:border-border-light'
                    }`}
                  >
                    <div className="text-sm font-medium text-text-primary">{t.label}</div>
                    <div className="text-xs text-text-muted mt-0.5">{t.description}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-border">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
              Cancel
            </button>
            <button
              onClick={() => name.trim() && onCreate(name.trim(), template)}
              disabled={!name.trim()}
              className="px-6 py-2 bg-accent-blue text-white rounded-lg text-sm font-medium hover:bg-accent-blue/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Create
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

// ─── Optimization tab ─────────────────────────────────────────────────────────

type ServingProfile = 'latency' | 'throughput' | 'cost'
type ExportFormat   = 'pytorch' | 'onnx' | 'tensorrt' | 'gguf'

function OptimizationTab({ notebook }: { notebook: MockNotebook }) {
  const isLLM    = notebook.modelCategory === 'llm' || notebook.modelCategory === 'slm'
  const isVision = notebook.modelCategory === 'object-detect' || notebook.modelCategory === 'vision' || notebook.modelCategory === 'diffusion'

  const [profile,   setProfile]   = useState<ServingProfile>('latency')
  const [format,    setFormat]    = useState<ExportFormat>(isLLM ? 'tensorrt' : 'onnx')
  const [copied,    setCopied]    = useState(false)
  const [checklist, setChecklist] = useState<Record<string, boolean>>({
    trained: false, quantized: false, exported: false, benchmarked: false, published: false,
  })

  const profiles: Array<{ key: ServingProfile; label: string; desc: string; quant: string; runtime: string; gpus: number }> = [
    {
      key: 'latency',
      label: 'Latency-Optimised',
      desc: 'Lowest response time. Best for interactive APIs, chatbots, real-time inference.',
      quant: 'FP16',
      runtime: isLLM ? 'vLLM' : isVision ? 'TensorRT' : 'ONNX Runtime',
      gpus: 1,
    },
    {
      key: 'throughput',
      label: 'Throughput-Optimised',
      desc: 'Highest tokens/sec or frames/sec. Best for batch pipelines and offline processing.',
      quant: 'INT8',
      runtime: isLLM ? 'vLLM (continuous batching)' : 'ONNX Runtime',
      gpus: 2,
    },
    {
      key: 'cost',
      label: 'Cost-Optimised',
      desc: 'Best efficiency per dollar. Best for dev/test, low-traffic, or CPU-only deployments.',
      quant: isLLM ? 'INT4 / GGUF' : 'INT8',
      runtime: isLLM ? 'llama.cpp' : 'ONNX Runtime (CPU)',
      gpus: 0,
    },
  ]

  const formats: Array<{ key: ExportFormat; label: string; compat: string; accuracy: string; size: string; best: string; supported: boolean }> = [
    { key: 'pytorch',   label: 'PyTorch',   compat: 'Universal',          accuracy: '100%',    size: '1×',        best: 'Development & fine-tuning',   supported: true     },
    { key: 'onnx',      label: 'ONNX',      compat: 'CPU / GPU / Edge',   accuracy: '99.9%',   size: '0.95×',     best: 'Cross-platform deployment',   supported: true     },
    { key: 'tensorrt',  label: 'TensorRT',  compat: 'NVIDIA GPU only',    accuracy: '99.5%',   size: '0.7×',      best: 'Lowest latency on GPU',       supported: true     },
    { key: 'gguf',      label: 'GGUF',      compat: 'CPU + GPU offload',  accuracy: '98–99%',  size: '0.25–0.5×', best: 'Portable CPU inference',      supported: isLLM    },
  ]

  const selectedProfile = profiles.find((p) => p.key === profile)!

  function getSnippet(): string {
    if (isLLM) {
      if (format === 'gguf') return [
        '# Cost-optimised: GGUF (Q4_K_M) via llama.cpp',
        '# Convert first: python convert_hf_to_gguf.py ./model --outtype q4_k_m',
        '',
        'from llama_cpp import Llama',
        '',
        'llm = Llama(',
        '    model_path="model-q4_k_m.gguf",',
        '    n_ctx=4096,',
        '    n_gpu_layers=-1,  # offload all layers to GPU if available',
        ')',
        'output = llm("Explain transformers in one sentence:", max_tokens=256)',
        'print(output["choices"][0]["text"])',
      ].join('\n')

      if (format === 'onnx') return [
        '# Export LLM to ONNX via Hugging Face Optimum',
        'from optimum.exporters.onnx import main_export',
        '',
        'main_export(',
        `    model_name_or_path="${notebook.modelId}",`,
        '    output="./model-onnx/",',
        '    task="text-generation-with-past",',
        '    dtype="fp16",',
        ')',
        '',
        'import onnxruntime as ort',
        'sess = ort.InferenceSession(',
        '    "./model-onnx/model.onnx",',
        '    providers=["CUDAExecutionProvider"],',
        ')',
      ].join('\n')

      // pytorch or tensorrt → serve with vLLM (best LLM runtime for both profiles)
      return [
        `# ${profile === 'latency' ? 'Latency' : 'Throughput'}-optimised: vLLM with FP16`,
        'from vllm import LLM, SamplingParams',
        '',
        'llm = LLM(',
        `    model="${notebook.modelId}",`,
        '    dtype="float16",',
        '    tensor_parallel_size=1,',
        '    gpu_memory_utilization=0.9,',
        ')',
        'params = SamplingParams(temperature=0.7, max_tokens=512)',
        'outputs = llm.generate(["What is machine learning?"], params)',
        'for o in outputs:',
        '    print(o.outputs[0].text)',
      ].join('\n')
    }

    if (isVision) {
      if (format === 'tensorrt') return [
        '# TensorRT export — lowest latency for NVIDIA GPU vision inference',
        'import torch',
        'from torch2trt import torch2trt',
        '',
        'model = torch.load("best.pt").cuda().eval()',
        'dummy = torch.ones((1, 3, 640, 640)).cuda()',
        'model_trt = torch2trt(model, [dummy], fp16_mode=True)',
        'torch.save(model_trt.state_dict(), "model_trt.pth")',
        'print("TensorRT model saved — expect 3–4× speedup over PyTorch")',
      ].join('\n')

      return [  // onnx or pytorch
        '# Export to ONNX — CPU and GPU, cross-platform',
        'import torch',
        '',
        'model = torch.load("best.pt").eval()',
        'dummy = torch.randn(1, 3, 640, 640)',
        'torch.onnx.export(',
        '    model, dummy, "model.onnx",',
        '    opset_version=17,',
        '    input_names=["images"],',
        '    output_names=["output"],',
        '    dynamic_axes={"images": {0: "batch"}},',
        ')',
        '',
        'import onnxruntime as ort',
        'sess = ort.InferenceSession("model.onnx",',
        '    providers=["CUDAExecutionProvider"])',
        'print("ONNX model ready")',
      ].join('\n')
    }

    // STT / TTS / other
    return [
      '# Export audio model to ONNX for efficient inference',
      '# ONNX Runtime is 2–3× faster than native PyTorch for STT/TTS',
      'from optimum.exporters.onnx import main_export',
      '',
      'main_export(',
      `    model_name_or_path="${notebook.modelId}",`,
      '    output="./model-onnx/",',
      '    task="automatic-speech-recognition",',
      ')',
      '',
      'import onnxruntime as ort',
      'sess = ort.InferenceSession(',
      '    "./model-onnx/model.onnx",',
      '    providers=["CUDAExecutionProvider", "CPUExecutionProvider"],',
      ')',
    ].join('\n')
  }

  function copySnippet() {
    navigator.clipboard.writeText(getSnippet())
      .then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
      .catch(() => undefined)
  }

  const checklistItems = [
    { key: 'trained',     label: 'Model trained or loaded' },
    { key: 'quantized',   label: 'Quantization applied' },
    { key: 'exported',    label: `Exported to ${format.toUpperCase()}` },
    { key: 'benchmarked', label: 'Benchmark run (see Benchmarks tab)' },
    { key: 'published',   label: 'Published to registry or S3' },
  ]
  const readyCount = checklistItems.filter((item) => checklist[item.key]).length

  return (
    <div className="space-y-6 mt-4">
      <p className="text-sm text-text-secondary">
        Choose a serving strategy for{' '}
        <span className="font-medium text-text-primary font-mono">{notebook.name}</span>.
        {' '}The generated snippet applies the chosen strategy — paste it into a new notebook cell.
      </p>

      {/* Serving profiles */}
      <div className="grid grid-cols-3 gap-4">
        {profiles.map((p) => (
          <button
            key={p.key}
            onClick={() => setProfile(p.key)}
            className={`text-left p-4 rounded-xl border transition-colors ${
              profile === p.key
                ? 'border-accent-blue bg-accent-blue/5'
                : 'border-border hover:border-border-light bg-bg-secondary'
            }`}
          >
            <div className="text-sm font-medium text-text-primary mb-1">{p.label}</div>
            <div className="text-xs text-text-muted leading-relaxed">{p.desc}</div>
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-bg-tertiary text-text-secondary font-mono">{p.quant}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-bg-tertiary text-text-secondary">{p.runtime}</span>
              {p.gpus > 0
                ? <span className="text-[10px] px-1.5 py-0.5 rounded bg-bg-tertiary text-text-secondary">{p.gpus} GPU{p.gpus > 1 ? 's' : ''}</span>
                : <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent-amber/10 text-accent-amber">CPU-friendly</span>
              }
            </div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left: format table + snippet */}
        <div className="col-span-2 space-y-6">
          {/* Export format */}
          <div className="bg-bg-secondary border border-border rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h3 className="text-sm font-medium text-text-primary">Export Format</h3>
              <p className="text-xs text-text-muted mt-0.5">Grayed formats are not applicable to this model type.</p>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {['Format', 'Compatibility', 'Accuracy', 'Size vs PT', 'Best for'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {formats.map((f) => (
                  <tr
                    key={f.key}
                    onClick={() => f.supported && setFormat(f.key)}
                    className={`border-b border-border last:border-0 transition-colors ${
                      !f.supported
                        ? 'opacity-30 cursor-not-allowed'
                        : format === f.key
                        ? 'bg-accent-blue/5 cursor-pointer'
                        : 'hover:bg-bg-tertiary cursor-pointer'
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {format === f.key && f.supported && (
                          <span className="w-1.5 h-1.5 rounded-full bg-accent-blue flex-shrink-0" />
                        )}
                        <span className={`text-sm font-medium ${format === f.key && f.supported ? 'text-accent-blue' : 'text-text-primary'}`}>
                          {f.label}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-text-secondary">{f.compat}</td>
                    <td className="px-4 py-3 text-sm font-mono text-text-primary">{f.accuracy}</td>
                    <td className="px-4 py-3 text-sm font-mono text-text-secondary">{f.size}</td>
                    <td className="px-4 py-3 text-xs text-text-muted">{f.best}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Generated snippet */}
          <div className="bg-bg-secondary border border-border rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-text-primary">Generated Snippet</h3>
                <p className="text-xs text-text-muted mt-0.5">Paste into a new cell in your notebook to apply this strategy.</p>
              </div>
              <button
                onClick={copySnippet}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-bg-tertiary rounded-lg transition-colors"
              >
                {copied
                  ? <><Check className="w-3.5 h-3.5 text-accent-green" /><span className="text-accent-green">Copied</span></>
                  : <><Copy className="w-3.5 h-3.5" />Copy to clipboard</>
                }
              </button>
            </div>
            <pre className="p-5 text-xs text-text-secondary font-mono leading-relaxed overflow-x-auto bg-bg-primary whitespace-pre">
              {getSnippet()}
            </pre>
          </div>
        </div>

        {/* Right: summary + readiness */}
        <div className="space-y-4">
          <div className="bg-bg-secondary border border-border rounded-xl p-5">
            <h3 className="text-sm font-medium text-text-primary mb-4">Strategy Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-text-secondary">Profile</span><span className="text-text-primary capitalize">{profile}</span></div>
              <div className="flex justify-between"><span className="text-text-secondary">Format</span><span className="text-text-primary uppercase font-mono text-xs">{format}</span></div>
              <div className="flex justify-between"><span className="text-text-secondary">Quantization</span><span className="text-text-primary font-mono text-xs">{selectedProfile.quant}</span></div>
              <div className="flex justify-between"><span className="text-text-secondary">Runtime</span><span className="text-text-primary text-xs text-right max-w-[60%]">{selectedProfile.runtime}</span></div>
              <div className="flex justify-between"><span className="text-text-secondary">Hardware</span><span className="text-text-primary text-xs">{selectedProfile.gpus === 0 ? 'CPU / GPU' : `${selectedProfile.gpus} GPU${selectedProfile.gpus > 1 ? 's' : ''} min`}</span></div>
            </div>
          </div>

          <div className="bg-bg-secondary border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-text-primary">Readiness</h3>
              <span className={`text-xs font-medium ${readyCount === checklistItems.length ? 'text-accent-green' : 'text-text-muted'}`}>
                {readyCount}/{checklistItems.length}
              </span>
            </div>
            <div className="space-y-3">
              {checklistItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => setChecklist((prev) => ({ ...prev, [item.key]: !prev[item.key] }))}
                  className="w-full flex items-center gap-3 text-left group"
                >
                  <div className={`w-4 h-4 rounded flex-shrink-0 flex items-center justify-center border transition-colors ${
                    checklist[item.key]
                      ? 'bg-accent-green border-accent-green'
                      : 'border-border group-hover:border-border-light'
                  }`}>
                    {checklist[item.key] && <Check className="w-2.5 h-2.5 text-white" />}
                  </div>
                  <span className={`text-xs transition-colors ${
                    checklist[item.key]
                      ? 'text-text-muted line-through'
                      : 'text-text-secondary group-hover:text-text-primary'
                  }`}>
                    {item.key === 'exported' ? `Exported to ${format.toUpperCase()}` : item.label}
                  </span>
                </button>
              ))}
            </div>
            {readyCount === checklistItems.length && (
              <div className="mt-4 p-3 rounded-lg bg-accent-green/10 border border-accent-green/20">
                <p className="text-xs font-medium text-accent-green">Ready to deploy</p>
                <p className="text-xs text-text-muted mt-0.5">Push to pipeline or publish directly.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Benchmarks tab ───────────────────────────────────────────────────────────

function BenchmarksTab() {
  const [subTab, setSubTab] = useState<'gpu' | 'cost'>('gpu')
  const [modelFilter, setModelFilter] = useState('Llama-3.3-70B')
  const filtered = mockBenchmarks.filter((b) => b.modelName === modelFilter)
  return (
    <div className="space-y-6 mt-4">
      <div className="flex items-center gap-4">
        <div className="flex rounded-lg border border-border overflow-hidden">
          {(['gpu', 'cost'] as const).map((t) => (
            <button key={t} onClick={() => setSubTab(t)}
              className={`px-4 py-1.5 text-sm transition-colors ${subTab === t ? 'bg-bg-tertiary text-text-primary' : 'text-text-secondary hover:text-text-primary'}`}>
              {t === 'gpu' ? 'GPU Benchmark' : 'Cost Analysis'}
            </button>
          ))}
        </div>
        {subTab === 'gpu' && (
          <>
            <label className="text-sm text-text-secondary">Model:</label>
            <select value={modelFilter} onChange={(e) => setModelFilter(e.target.value)}
              className="px-3 py-1.5 bg-bg-tertiary border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent-blue transition-colors">
              <option>Llama-3.3-70B</option><option>Mistral-7B</option>
            </select>
          </>
        )}
      </div>
      {subTab === 'gpu' && (
        <>
          <div className="bg-bg-secondary border border-border rounded-xl overflow-hidden">
            <table className="w-full">
              <thead><tr className="border-b border-border">
                {['GPU', 'Instance', 'VRAM', 'TTFT (ms)', 'Throughput', 'Cost/hr', 'Tok/$', 'Success'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">{h}</th>
                ))}</tr></thead>
              <tbody>{filtered.map((b) => (
                <tr key={b.gpuType} className="border-b border-border last:border-0 hover:bg-bg-tertiary transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-text-primary">{b.gpuType}</td>
                  <td className="px-4 py-3 text-sm font-mono text-text-secondary">{b.instanceType}</td>
                  <td className="px-4 py-3 text-sm text-text-secondary">{b.vram}</td>
                  <td className="px-4 py-3 text-sm text-text-primary">{b.ttftMs}</td>
                  <td className="px-4 py-3 text-sm text-text-primary">{b.throughputTokensPerMin.toLocaleString()} tok/min</td>
                  <td className="px-4 py-3 text-sm text-text-primary">${b.costPerHour}</td>
                  <td className="px-4 py-3 text-sm text-accent-green">{b.tokensPerDollar.toLocaleString()}</td>
                  <td className="px-4 py-3"><StatusBadge status="Running" /></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
          <div className="bg-bg-secondary border border-border rounded-xl p-5">
            <h3 className="text-sm font-medium text-text-primary mb-4">Load Testing — Llama 3.3 70B on L40S</h3>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={loadTestingResults}>
                <CartesianGrid stroke="#262626" strokeDasharray="3 3" />
                <XAxis dataKey="users" tick={{ fill: '#a3a3a3', fontSize: 12 }} />
                <YAxis yAxisId="left" tick={{ fill: '#a3a3a3', fontSize: 12 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fill: '#a3a3a3', fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #262626', borderRadius: 8 }} />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="ttftAvg" stroke="#3b82f6" strokeWidth={2} name="Avg TTFT (s)" />
                <Line yAxisId="left" type="monotone" dataKey="ttftP95" stroke="#ef4444" strokeWidth={2} name="P95 TTFT (s)" />
                <Line yAxisId="right" type="monotone" dataKey="throughput" stroke="#22c55e" strokeWidth={2} name="Throughput" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
      {subTab === 'cost' && (
        <>
          <div className="grid grid-cols-4 gap-4">
            {costPerMillionTokens.map((c) => (
              <div key={c.gpu} className="bg-bg-secondary border border-border rounded-xl p-4">
                <div className="text-sm font-medium text-text-primary">{c.gpu}</div>
                <div className="text-2xl font-semibold text-accent-blue mt-2">${c.cost}</div>
                <div className="text-xs text-text-muted mt-1">per 1M tokens</div>
              </div>
            ))}
          </div>
          <div className="bg-bg-secondary border border-border rounded-xl p-5">
            <h3 className="text-sm font-medium text-text-primary mb-4">Cost per 1M Tokens</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={costPerMillionTokens}>
                <CartesianGrid stroke="#262626" strokeDasharray="3 3" />
                <XAxis dataKey="gpu" tick={{ fill: '#a3a3a3', fontSize: 12 }} />
                <YAxis tick={{ fill: '#a3a3a3', fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #262626', borderRadius: 8 }} />
                <Bar dataKey="cost" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  )
}

// ─── Notebook workspace (tabs) ────────────────────────────────────────────────

const workspaceTabs = [
  { key: 'notebook',     label: 'Notebook' },
  { key: 'experiments',  label: 'Experiments' },
  { key: 'optimization', label: 'Optimization' },
  { key: 'benchmarks',   label: 'Benchmarks' },
  { key: 'servers',      label: 'Servers' },
]

function NotebookWorkspace({ notebook, onBack }: { notebook: MockNotebook; onBack: () => void }) {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('notebook')
  const [showPublish, setShowPublish] = useState(false)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [savedLabel, setSavedLabel] = useState('Saved')
  const mountedAt = useRef(Date.now())

  useEffect(() => {
    const timer = setInterval(() => {
      const s = Math.floor((Date.now() - mountedAt.current) / 1000)
      if (s < 60) setSavedLabel('Saved')
      else if (s < 3600) setSavedLabel(`Saved ${Math.floor(s / 60)}m ago`)
      else setSavedLabel('Saved')
    }, 30000) // update every 30s
    return () => clearInterval(timer)
  }, []) // run once on mount — timer resets per notebook open

  return (
    <div className={isFullScreen ? 'fixed inset-0 z-50 bg-bg-primary overflow-y-auto p-6' : 'relative'}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" /> Workbench
          </button>
          <span className="text-text-muted">/</span>
          <h1 className="text-lg font-semibold text-text-primary font-mono">{notebook.name}</h1>
          <span className="flex items-center gap-1.5 text-xs text-text-muted">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-green" />
            {savedLabel}
          </span>
          <span className={`text-xs px-2 py-0.5 rounded font-medium ${
            notebook.modelCategory === 'llm' ? 'bg-accent-purple/10 text-accent-purple' :
            notebook.modelCategory === 'object-detect' ? 'bg-accent-blue/10 text-accent-blue' :
            'bg-accent-amber/10 text-accent-amber'
          }`}>
            {MODEL_CATEGORY_LABELS[notebook.modelCategory]}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/aiops/pipelines/create', { state: { modelId: notebook.modelId } })}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium border border-border rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-colors"
          >
            Push to Pipeline
          </button>
          <button
            onClick={() => setShowPublish(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-accent-green text-white rounded-lg text-sm font-medium hover:bg-accent-green/90 transition-colors"
          >
            <Upload className="w-4 h-4" /> Publish Model
          </button>
          <button
            onClick={() => setIsFullScreen(!isFullScreen)}
            aria-label={isFullScreen ? 'Exit full screen' : 'Full screen'}
            title={isFullScreen ? 'Exit full screen' : 'Full screen'}
            className="p-2 rounded-lg hover:bg-bg-tertiary transition-colors"
          >
            {isFullScreen
              ? <Minimize2 className="w-4 h-4 text-text-secondary" />
              : <Maximize2 className="w-4 h-4 text-text-secondary" />
            }
          </button>
        </div>
      </div>

      <TabGroup tabs={workspaceTabs} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'notebook'     && <NotebookViewer notebook={notebook} />}
      {activeTab === 'experiments'  && <ExperimentsTab notebookId={notebook.id} />}
      {activeTab === 'optimization' && <OptimizationTab notebook={notebook} />}
      {activeTab === 'benchmarks'   && <BenchmarksTab />}
      {activeTab === 'servers'      && <WorkspaceTab />}

      {showPublish && (
        <PublishModelModal serverName={notebook.name} onClose={() => setShowPublish(false)} />
      )}
    </div>
  )
}

// ─── Notebook list (initial view) ─────────────────────────────────────────────

const categoryColors: Record<string, string> = {
  llm:           'bg-accent-purple/10 text-accent-purple',
  slm:           'bg-accent-purple/10 text-accent-purple',
  'object-detect': 'bg-accent-blue/10 text-accent-blue',
  stt:           'bg-accent-cyan/10 text-accent-cyan',
  tts:           'bg-accent-cyan/10 text-accent-cyan',
  'traditional-ml': 'bg-accent-amber/10 text-accent-amber',
}

export default function WorkbenchPage() {
  const location = useLocation()
  const [notebooks, setNotebooks] = useState<MockNotebook[]>(mockNotebooks)
  const [openNotebook, setOpenNotebook] = useState<MockNotebook | null>(null)
  const [showNewModal, setShowNewModal] = useState(false)

  // Auto-open a notebook if navigated with notebookId state
  const navState = location.state as { notebookId?: string } | null
  const [handled] = useState(() => {
    if (navState?.notebookId) {
      const nb = mockNotebooks.find((n) => n.id === navState.notebookId)
      return nb ?? null
    }
    return null
  })

  const activeNotebook = openNotebook ?? handled

  if (activeNotebook) {
    return <NotebookWorkspace notebook={activeNotebook} onBack={() => setOpenNotebook(null)} />
  }

  function handleCreate(name: string) {
    const newNb: MockNotebook = {
      id: `nb-${Date.now()}`,
      name: name.endsWith('.ipynb') ? name : `${name}.ipynb`,
      description: 'New notebook',
      modelCategory: 'llm',
      modelId: 'mdl-001',
      tags: [],
      lastModified: new Date().toISOString().slice(0, 16).replace('T', ' '),
      cells: [
        { type: 'markdown', content: `## ${name}\n\nStart experimenting here.` },
        { type: 'code', executionCount: undefined, content: '# Your code here\n' },
      ],
    }
    setNotebooks((prev) => [newNb, ...prev])
    setShowNewModal(false)
    setOpenNotebook(newNb)
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">Workbench</h1>
          <p className="text-sm text-text-secondary mt-1">Experiment, build, and publish models — before pushing to a production pipeline.</p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-accent-blue text-white rounded-lg text-sm font-medium hover:bg-accent-blue/90 transition-colors"
        >
          <Plus className="w-4 h-4" /> New Notebook
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {notebooks.map((nb) => (
          <button
            key={nb.id}
            onClick={() => setOpenNotebook(nb)}
            className="text-left bg-bg-secondary border border-border rounded-xl p-5 hover:border-border-light transition-colors group"
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-sm font-medium text-text-primary font-mono group-hover:text-accent-blue transition-colors truncate mr-3">
                {nb.name}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded font-medium flex-shrink-0 ${categoryColors[nb.modelCategory] ?? 'bg-bg-tertiary text-text-muted'}`}>
                {MODEL_CATEGORY_LABELS[nb.modelCategory]}
              </span>
            </div>
            <p className="text-xs text-text-secondary mb-3 line-clamp-2">{nb.description}</p>
            <div className="flex items-center gap-4 text-xs text-text-muted">
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {nb.lastModified}</span>
              {nb.tags.slice(0, 2).map((tag) => (
                <span key={tag} className="flex items-center gap-1"><Tag className="w-3 h-3" />{tag}</span>
              ))}
              <span className="ml-auto">{nb.cells.filter(c => c.type === 'code').length} cells</span>
            </div>
          </button>
        ))}
      </div>

      {showNewModal && (
        <NewNotebookModal onClose={() => setShowNewModal(false)} onCreate={handleCreate} />
      )}
    </div>
  )
}
