import { useState } from 'react'
import { Plus, ExternalLink, X, Square, Trash2, Server, Upload } from 'lucide-react'
import StatusBadge from '../../components/shared/StatusBadge'
import PublishModelModal from './PublishModelModal'
import { mockNotebookServers, NOTEBOOK_IMAGES, GPU_OPTIONS } from '../../data/mockNotebookServers'
import { mockClusters } from '../../data/mockClusters'
import type { NotebookServer } from '../../types'

// ─── Provision modal ──────────────────────────────────────────────────────────

interface ProvisionForm {
  name: string
  clusterId: string
  image: string
  gpu: string
  cpu: string
  memory: string
}

function ProvisionNotebookModal({ onClose, onProvision }: {
  onClose: () => void
  onProvision: (form: ProvisionForm) => void
}) {
  const [form, setForm] = useState<ProvisionForm>({
    name: '',
    clusterId: mockClusters.find((c) => c.status === 'Running')?.id ?? '',
    image: NOTEBOOK_IMAGES[0].value,
    gpu: GPU_OPTIONS[2].value,
    cpu: '8',
    memory: '32',
  })

  function set<K extends keyof ProvisionForm>(k: K, v: ProvisionForm[K]) {
    setForm((prev) => ({ ...prev, [k]: v }))
  }

  const runningClusters = mockClusters.filter((c) => c.status === 'Running')

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
        <div className="bg-bg-secondary border border-border rounded-xl w-full max-w-lg shadow-2xl">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-accent-blue" />
              <h2 className="text-base font-semibold text-text-primary">Provision Notebook Server</h2>
            </div>
            <button onClick={onClose} aria-label="Close" className="p-1.5 rounded-lg hover:bg-bg-tertiary transition-colors">
              <X className="w-4 h-4 text-text-secondary" />
            </button>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm text-text-secondary mb-1">Server Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="e.g. llama-finetune-ws"
                className="w-full px-3 py-2 bg-bg-tertiary border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-blue transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-1">Cluster</label>
              <select
                value={form.clusterId}
                onChange={(e) => set('clusterId', e.target.value)}
                className="w-full px-3 py-2 bg-bg-tertiary border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent-blue transition-colors"
              >
                {runningClusters.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} ({c.region})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-1">Container Image</label>
              <select
                value={form.image}
                onChange={(e) => set('image', e.target.value)}
                className="w-full px-3 py-2 bg-bg-tertiary border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent-blue transition-colors"
              >
                {NOTEBOOK_IMAGES.map((img) => (
                  <option key={img.value} value={img.value}>{img.label}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm text-text-secondary mb-1">GPU</label>
                <select
                  value={form.gpu}
                  onChange={(e) => set('gpu', e.target.value)}
                  className="w-full px-3 py-2 bg-bg-tertiary border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent-blue transition-colors"
                >
                  {GPU_OPTIONS.map((g) => (
                    <option key={g.value} value={g.value}>{g.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1">CPU (vCPU)</label>
                <select
                  value={form.cpu}
                  onChange={(e) => set('cpu', e.target.value)}
                  className="w-full px-3 py-2 bg-bg-tertiary border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent-blue transition-colors"
                >
                  {['2', '4', '8', '16', '32'].map((n) => <option key={n} value={n}>{n} vCPU</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1">Memory (GB)</label>
                <select
                  value={form.memory}
                  onChange={(e) => set('memory', e.target.value)}
                  className="w-full px-3 py-2 bg-bg-tertiary border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent-blue transition-colors"
                >
                  {['8', '16', '32', '64', '128'].map((n) => <option key={n} value={n}>{n} GB</option>)}
                </select>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-border">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
              Cancel
            </button>
            <button
              onClick={() => form.name && form.clusterId && onProvision(form)}
              disabled={!form.name || !form.clusterId}
              className="px-6 py-2 bg-accent-blue text-white rounded-lg text-sm font-medium hover:bg-accent-blue/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Provision
            </button>
          </div>
        </div>
      </div>
    </>
  )
}


// ─── Active notebook workspace (iframe view) ──────────────────────────────────

function NotebookWorkspaceView({ server, onClose, onPublish }: {
  server: NotebookServer
  onClose: () => void
  onPublish: () => void
}) {
  return (
    <div className="flex flex-col mt-4" style={{ height: 'calc(100vh - 260px)' }}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-bg-secondary border border-border rounded-t-xl flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-2 h-2 rounded-full bg-accent-green animate-pulse flex-shrink-0" />
          <span className="text-sm font-medium text-text-primary flex-shrink-0">{server.name}</span>
          <span className="text-xs px-2 py-0.5 rounded bg-bg-tertiary text-text-muted flex-shrink-0">{server.clusterName}</span>
          <span className="text-xs text-text-muted font-mono truncate">{server.url}</span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-4">
          <a
            href={server.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-text-primary border border-border rounded-lg hover:bg-bg-tertiary transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Open in Tab
          </a>
          <button
            onClick={onPublish}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-accent-green text-white rounded-lg hover:bg-accent-green/90 transition-colors"
          >
            <Upload className="w-3.5 h-3.5" /> Publish Model
          </button>
          <button onClick={onClose} aria-label="Close workspace" className="p-1.5 rounded-lg hover:bg-bg-tertiary transition-colors">
            <X className="w-4 h-4 text-text-secondary" />
          </button>
        </div>
      </div>
      {/* Embedded notebook */}
      <div className="flex-1 border-x border-b border-border rounded-b-xl overflow-hidden bg-bg-primary">
        <iframe
          src={server.url}
          className="w-full h-full border-0"
          title={`JupyterLab: ${server.name}`}
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-downloads"
        />
      </div>
    </div>
  )
}

// ─── Main tab ─────────────────────────────────────────────────────────────────

export default function WorkspaceTab() {
  const [servers, setServers] = useState<NotebookServer[]>(mockNotebookServers)
  const [openServerId, setOpenServerId] = useState<string | null>(null)
  const [showProvision, setShowProvision] = useState(false)
  const [showPublish, setShowPublish] = useState(false)

  const openServer = servers.find((s) => s.id === openServerId) ?? null

  function handleProvision(form: ProvisionForm) {
    const cluster = mockClusters.find((c) => c.id === form.clusterId)
    const newServer: NotebookServer = {
      id: `nb-${Date.now()}`,
      name: form.name,
      clusterId: form.clusterId,
      clusterName: cluster?.name ?? form.clusterId,
      status: 'Provisioning',
      url: `http://jupyter-${form.name}.${cluster?.name ?? 'cluster'}.svc.cluster.local:8888`,
      image: form.image,
      resources: {
        cpu: `${form.cpu} vCPU`,
        memory: `${form.memory} GB`,
        gpu: form.gpu === 'none' ? 'None' : form.gpu,
      },
      createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      lastActive: '—',
      createdBy: 'k.ramanathan',
    }
    setServers((prev) => [newServer, ...prev])
    setShowProvision(false)
  }

  function handleStop(id: string) {
    setServers((prev) => prev.map((s) => s.id === id ? { ...s, status: 'Stopped' } : s))
  }

  function handleDelete(id: string) {
    setServers((prev) => prev.filter((s) => s.id !== id))
    if (openServerId === id) setOpenServerId(null)
  }

  // Show workspace iframe view
  if (openServer) {
    return (
      <>
        <NotebookWorkspaceView
          server={openServer}
          onClose={() => setOpenServerId(null)}
          onPublish={() => setShowPublish(true)}
        />
        {showPublish && (
          <PublishModelModal serverName={openServer.name} onClose={() => setShowPublish(false)} />
        )}
      </>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium text-text-primary">Notebook Servers</h3>
          <p className="text-xs text-text-secondary mt-0.5">JupyterLab instances provisioned on your EKS clusters.</p>
        </div>
        <button
          onClick={() => setShowProvision(true)}
          className="flex items-center gap-2 px-4 py-2 bg-accent-blue text-white rounded-lg text-sm font-medium hover:bg-accent-blue/90 transition-colors"
        >
          <Plus className="w-4 h-4" /> Provision Notebook
        </button>
      </div>

      <div className="bg-bg-secondary border border-border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Cluster</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Image</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Resources</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Last Active</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {servers.map((server) => (
              <tr key={server.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3">
                  <span className="text-sm font-medium text-text-primary">{server.name}</span>
                  <p className="text-xs text-text-muted font-mono mt-0.5 truncate max-w-48">{server.url}</p>
                </td>
                <td className="px-4 py-3 text-sm text-text-secondary">{server.clusterName}</td>
                <td className="px-4 py-3"><StatusBadge status={server.status} /></td>
                <td className="px-4 py-3 text-xs font-mono text-text-secondary truncate max-w-40">{server.image.split('/').pop()}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-text-secondary">{server.resources.gpu}</span>
                    <span className="text-xs text-text-muted">{server.resources.cpu} · {server.resources.memory}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-text-muted">{server.lastActive}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    {server.status === 'Running' && (
                      <>
                        <button
                          onClick={() => setOpenServerId(server.id)}
                          className="px-2.5 py-1 text-xs font-medium bg-accent-blue/10 text-accent-blue rounded-lg hover:bg-accent-blue/20 transition-colors"
                        >
                          Open
                        </button>
                        <button
                          onClick={() => handleStop(server.id)}
                          aria-label="Stop server"
                          className="p-1.5 rounded-lg hover:bg-bg-tertiary transition-colors"
                        >
                          <Square className="w-3.5 h-3.5 text-text-muted" />
                        </button>
                      </>
                    )}
                    {server.status === 'Stopped' && (
                      <span className="text-xs text-text-muted">—</span>
                    )}
                    {server.status === 'Provisioning' && (
                      <span className="text-xs text-accent-amber animate-pulse">Starting…</span>
                    )}
                    <button
                      onClick={() => handleDelete(server.id)}
                      aria-label="Delete server"
                      className="p-1.5 rounded-lg hover:bg-bg-tertiary transition-colors ml-1"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-text-muted hover:text-accent-red" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {servers.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-text-muted text-sm">No notebook servers. Provision one to get started.</p>
          </div>
        )}
      </div>

      {showProvision && (
        <ProvisionNotebookModal onClose={() => setShowProvision(false)} onProvision={handleProvision} />
      )}
    </div>
  )
}
