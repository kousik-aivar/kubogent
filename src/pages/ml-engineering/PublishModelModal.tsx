import { useState } from 'react'
import { X, Github, Upload } from 'lucide-react'

type PublishDestination = 'github' | 's3'

interface PublishForm {
  destination: PublishDestination
  modelName: string
  version: string
  repoUrl: string
  branch: string
  path: string
  commitMessage: string
  bucket: string
  prefix: string
  region: string
  format: string
}

const S3_REGIONS = ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1', 'ap-northeast-1']
const MODEL_FORMATS = ['safetensors', 'GGUF (q4_k_m)', 'ONNX', 'PyTorch .bin', 'TensorRT engine']

export default function PublishModelModal({ serverName, onClose }: {
  serverName: string
  onClose: () => void
}) {
  const [form, setForm] = useState<PublishForm>({
    destination: 'github',
    modelName: '',
    version: 'v1.0.0',
    repoUrl: '',
    branch: 'main',
    path: 'models/',
    commitMessage: 'Add fine-tuned model checkpoint',
    bucket: '',
    prefix: 'models/',
    region: 'us-east-1',
    format: 'safetensors',
  })
  const [published, setPublished] = useState(false)

  function set<K extends keyof PublishForm>(k: K, v: PublishForm[K]) {
    setForm((prev) => ({ ...prev, [k]: v }))
  }

  if (published) {
    return (
      <>
        <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose} />
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="bg-bg-secondary border border-border rounded-xl w-full max-w-md shadow-2xl p-10 text-center">
            <div className="w-14 h-14 rounded-full bg-accent-green/20 flex items-center justify-center mx-auto mb-4">
              <Upload className="w-7 h-7 text-accent-green" />
            </div>
            <h2 className="text-lg font-semibold text-text-primary mb-2">Model Published</h2>
            <p className="text-sm text-text-secondary mb-1">
              <span className="text-text-primary font-medium">{form.modelName || 'Model'}</span> {form.version}
            </p>
            <p className="text-xs text-text-muted mb-6">
              {form.destination === 'github'
                ? `→ ${form.repoUrl || 'github.com/org/repo'}/${form.path}`
                : `→ s3://${form.bucket}/${form.prefix}`}
            </p>
            <button onClick={onClose} className="px-6 py-2 bg-accent-blue text-white rounded-lg text-sm font-medium hover:bg-accent-blue/90 transition-colors">
              Done
            </button>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
        <div className="bg-bg-secondary border border-border rounded-xl w-full max-w-lg shadow-2xl">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <div>
              <h2 className="text-base font-semibold text-text-primary">Publish Model</h2>
              <p className="text-xs text-text-muted mt-0.5">from {serverName}</p>
            </div>
            <button onClick={onClose} aria-label="Close" className="p-1.5 rounded-lg hover:bg-bg-tertiary transition-colors">
              <X className="w-4 h-4 text-text-secondary" />
            </button>
          </div>

          <div className="flex border-b border-border">
            {(['github', 's3'] as const).map((d) => (
              <button key={d} onClick={() => set('destination', d)}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors border-b-2 ${
                  form.destination === d ? 'border-accent-blue text-accent-blue' : 'border-transparent text-text-secondary hover:text-text-primary'
                }`}>
                {d === 'github' ? <Github className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
                {d === 'github' ? 'GitHub' : 'Amazon S3'}
              </button>
            ))}
          </div>

          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-text-secondary mb-1">Model Name</label>
                <input type="text" value={form.modelName} onChange={(e) => set('modelName', e.target.value)}
                  placeholder="e.g. llama3.1-lora-custom"
                  className="w-full px-3 py-2 bg-bg-tertiary border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-blue transition-colors" />
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1">Version</label>
                <input type="text" value={form.version} onChange={(e) => set('version', e.target.value)}
                  className="w-full px-3 py-2 bg-bg-tertiary border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent-blue transition-colors" />
              </div>
            </div>
            {form.destination === 'github' ? (
              <>
                <div>
                  <label className="block text-sm text-text-secondary mb-1">Repository URL</label>
                  <input type="text" value={form.repoUrl} onChange={(e) => set('repoUrl', e.target.value)}
                    placeholder="github.com/org/ml-models"
                    className="w-full px-3 py-2 bg-bg-tertiary border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-blue transition-colors" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-text-secondary mb-1">Branch</label>
                    <input type="text" value={form.branch} onChange={(e) => set('branch', e.target.value)}
                      className="w-full px-3 py-2 bg-bg-tertiary border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent-blue transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm text-text-secondary mb-1">Path</label>
                    <input type="text" value={form.path} onChange={(e) => set('path', e.target.value)}
                      className="w-full px-3 py-2 bg-bg-tertiary border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent-blue transition-colors" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-text-secondary mb-1">Commit Message</label>
                  <input type="text" value={form.commitMessage} onChange={(e) => set('commitMessage', e.target.value)}
                    className="w-full px-3 py-2 bg-bg-tertiary border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent-blue transition-colors" />
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-text-secondary mb-1">S3 Bucket</label>
                    <input type="text" value={form.bucket} onChange={(e) => set('bucket', e.target.value)}
                      placeholder="my-ml-models"
                      className="w-full px-3 py-2 bg-bg-tertiary border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-blue transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm text-text-secondary mb-1">Prefix / Path</label>
                    <input type="text" value={form.prefix} onChange={(e) => set('prefix', e.target.value)}
                      className="w-full px-3 py-2 bg-bg-tertiary border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent-blue transition-colors" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-text-secondary mb-1">AWS Region</label>
                    <select value={form.region} onChange={(e) => set('region', e.target.value)}
                      className="w-full px-3 py-2 bg-bg-tertiary border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent-blue transition-colors">
                      {S3_REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-text-secondary mb-1">Model Format</label>
                    <select value={form.format} onChange={(e) => set('format', e.target.value)}
                      className="w-full px-3 py-2 bg-bg-tertiary border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent-blue transition-colors">
                      {MODEL_FORMATS.map((f) => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-border">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">Cancel</button>
            <button onClick={() => setPublished(true)}
              className="px-6 py-2 bg-accent-green text-white rounded-lg text-sm font-medium hover:bg-accent-green/90 transition-colors">
              Publish Model
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
