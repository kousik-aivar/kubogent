import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Grid, List } from 'lucide-react'
import PageHeader from '../../../components/shared/PageHeader'
import SearchInput from '../../../components/shared/SearchInput'
import StatusBadge from '../../../components/shared/StatusBadge'
import Modal from '../../../components/shared/Modal'
import TabGroup from '../../../components/shared/TabGroup'
import { mockModels } from '../../../data/mockModels'

const sourceColors: Record<string, string> = {
  HuggingFace: 'bg-amber-500/20 text-amber-400',
  GitHub: 'bg-gray-500/20 text-gray-300',
  S3: 'bg-orange-500/20 text-orange-400',
  MLflow: 'bg-blue-500/20 text-blue-400',
}

export default function ModelsListPage() {
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [importOpen, setImportOpen] = useState(false)
  const [importTab, setImportTab] = useState('huggingface')
  const navigate = useNavigate()

  const filtered = mockModels.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <PageHeader
        title="Models"
        description="Manage your AI model registry"
        actions={
          <button onClick={() => setImportOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-accent-blue text-white rounded-lg text-sm font-medium hover:bg-accent-blue/90 transition-colors">
            <Plus className="w-4 h-4" /> Import Model
          </button>
        }
      />
      <div className="flex items-center gap-4 mb-4">
        <div className="flex-1 max-w-sm">
          <SearchInput value={search} onChange={setSearch} placeholder="Search models..." />
        </div>
        <div className="flex bg-bg-secondary border border-border rounded-lg">
          <button onClick={() => setViewMode('grid')} className={`p-2 rounded-l-lg ${viewMode === 'grid' ? 'bg-bg-tertiary' : ''}`}><Grid className="w-4 h-4 text-text-secondary" /></button>
          <button onClick={() => setViewMode('list')} className={`p-2 rounded-r-lg ${viewMode === 'list' ? 'bg-bg-tertiary' : ''}`}><List className="w-4 h-4 text-text-secondary" /></button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((model) => (
            <button key={model.id} onClick={() => navigate(`/aiops/models/${model.id}`)} className="text-left bg-bg-secondary border border-border rounded-xl p-4 hover:border-border-light transition-colors">
              <div className="flex items-start justify-between mb-3">
                <span className={`text-xs px-2 py-0.5 rounded-full ${sourceColors[model.source]}`}>{model.source}</span>
                <StatusBadge status={model.status} />
              </div>
              <h3 className="text-sm font-medium text-text-primary mb-1">{model.name}</h3>
              <p className="text-xs text-text-muted mb-3 line-clamp-2">{model.description}</p>
              <div className="flex items-center gap-3 text-xs text-text-secondary">
                <span>{model.parameters} params</span>
                <span>{model.size}</span>
                {model.quantization && <span className="text-accent-purple">{model.quantization}</span>}
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="bg-bg-secondary border border-border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead><tr className="border-b border-border">
              <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase">Source</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase">Parameters</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase">Size</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase">Deployments</th>
            </tr></thead>
            <tbody>
              {filtered.map((m) => (
                <tr key={m.id} onClick={() => navigate(`/aiops/models/${m.id}`)} className="border-b border-border last:border-0 cursor-pointer hover:bg-bg-tertiary">
                  <td className="px-4 py-3 text-sm font-medium text-text-primary">{m.name}</td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full ${sourceColors[m.source]}`}>{m.source}</span></td>
                  <td className="px-4 py-3"><StatusBadge status={m.status} /></td>
                  <td className="px-4 py-3 text-sm text-text-secondary">{m.parameters}</td>
                  <td className="px-4 py-3 text-sm text-text-secondary">{m.size}</td>
                  <td className="px-4 py-3 text-sm text-text-secondary">{m.deploymentCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={importOpen} onClose={() => setImportOpen(false)} title="Import Model">
        <TabGroup
          tabs={[
            { key: 'huggingface', label: 'HuggingFace' },
            { key: 'github', label: 'GitHub' },
            { key: 's3', label: 'S3' },
            { key: 'mlflow', label: 'MLflow' },
          ]}
          activeTab={importTab}
          onChange={setImportTab}
        />
        {importTab === 'huggingface' && (
          <div className="space-y-4">
            <input type="text" placeholder="Search HuggingFace models..." className="w-full px-3 py-2 bg-bg-tertiary border border-border rounded-lg text-sm text-text-primary placeholder-text-muted" />
            <div className="space-y-2">
              {['meta-llama/Llama-3.1-70B-Instruct', 'mistralai/Mistral-7B-Instruct-v0.3', 'google/gemma-2-27b'].map((m) => (
                <div key={m} className="flex items-center justify-between p-3 bg-bg-tertiary rounded-lg hover:bg-bg-elevated cursor-pointer">
                  <span className="text-sm text-text-primary">{m}</span>
                  <button className="text-xs text-accent-blue">Import</button>
                </div>
              ))}
            </div>
          </div>
        )}
        {importTab === 'github' && (
          <div className="space-y-4">
            <div><label className="block text-sm text-text-secondary mb-1">Repository URL</label><input type="text" placeholder="https://github.com/org/model-repo" className="w-full px-3 py-2 bg-bg-tertiary border border-border rounded-lg text-sm text-text-primary placeholder-text-muted" /></div>
            <div><label className="block text-sm text-text-secondary mb-1">Branch</label><input type="text" defaultValue="main" className="w-full px-3 py-2 bg-bg-tertiary border border-border rounded-lg text-sm text-text-primary" /></div>
            <button className="px-4 py-2 bg-accent-blue text-white rounded-lg text-sm">Import from GitHub</button>
          </div>
        )}
        {importTab === 's3' && (
          <div className="space-y-4">
            <div><label className="block text-sm text-text-secondary mb-1">S3 Bucket</label><input type="text" placeholder="my-model-bucket" className="w-full px-3 py-2 bg-bg-tertiary border border-border rounded-lg text-sm text-text-primary placeholder-text-muted" /></div>
            <div><label className="block text-sm text-text-secondary mb-1">Path</label><input type="text" placeholder="models/llama-3.1-70b/" className="w-full px-3 py-2 bg-bg-tertiary border border-border rounded-lg text-sm text-text-primary placeholder-text-muted" /></div>
            <button className="px-4 py-2 bg-accent-blue text-white rounded-lg text-sm">Import from S3</button>
          </div>
        )}
        {importTab === 'mlflow' && (
          <div className="space-y-4">
            <div><label className="block text-sm text-text-secondary mb-1">MLflow Registry</label><select className="w-full px-3 py-2 bg-bg-tertiary border border-border rounded-lg text-sm text-text-primary"><option>Production Registry</option><option>Staging Registry</option></select></div>
            <div className="space-y-2">
              {['Custom-FinBERT-v2', 'Sentiment-BERT-v1'].map((m) => (
                <div key={m} className="flex items-center justify-between p-3 bg-bg-tertiary rounded-lg hover:bg-bg-elevated cursor-pointer">
                  <span className="text-sm text-text-primary">{m}</span>
                  <button className="text-xs text-accent-blue">Import</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
