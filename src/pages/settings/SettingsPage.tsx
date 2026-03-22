import { useState } from 'react'
import PageHeader from '../../components/shared/PageHeader'
import TabGroup from '../../components/shared/TabGroup'
import { Eye, EyeOff, Copy } from 'lucide-react'

const tabs = [
  { key: 'general', label: 'General' },
  { key: 'api', label: 'API Keys' },
  { key: 'team', label: 'Team' },
  { key: 'notifications', label: 'Notifications' },
]

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general')
  const [showKey, setShowKey] = useState(false)

  return (
    <div>
      <PageHeader title="Settings" description="Manage your Kubogent platform settings" />
      <TabGroup tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'general' && (
        <div className="bg-bg-secondary border border-border rounded-xl p-6 space-y-4 max-w-2xl">
          <div><label className="block text-sm text-text-secondary mb-1">Platform Name</label><input type="text" defaultValue="Kubogent" className="w-full px-3 py-2 bg-bg-tertiary border border-border rounded-lg text-sm text-text-primary" /></div>
          <div><label className="block text-sm text-text-secondary mb-1">Default Region</label><select className="w-full px-3 py-2 bg-bg-tertiary border border-border rounded-lg text-sm text-text-primary"><option>us-east-1</option><option>us-west-2</option><option>eu-west-1</option></select></div>
          <div><label className="block text-sm text-text-secondary mb-1">Default K8s Version</label><select className="w-full px-3 py-2 bg-bg-tertiary border border-border rounded-lg text-sm text-text-primary"><option>1.29</option><option>1.28</option></select></div>
          <button className="px-4 py-2 bg-accent-blue text-white rounded-lg text-sm font-medium">Save Changes</button>
        </div>
      )}

      {activeTab === 'api' && (
        <div className="bg-bg-secondary border border-border rounded-xl p-6 space-y-4 max-w-2xl">
          <div>
            <label className="block text-sm text-text-secondary mb-1">AWS Access Key</label>
            <div className="flex gap-2">
              <input type={showKey ? 'text' : 'password'} defaultValue="AKIAIOSFODNN7EXAMPLE" className="flex-1 px-3 py-2 bg-bg-tertiary border border-border rounded-lg text-sm text-text-primary font-mono" readOnly />
              <button onClick={() => setShowKey(!showKey)} className="p-2 bg-bg-tertiary border border-border rounded-lg hover:bg-bg-elevated">{showKey ? <EyeOff className="w-4 h-4 text-text-secondary" /> : <Eye className="w-4 h-4 text-text-secondary" />}</button>
              <button className="p-2 bg-bg-tertiary border border-border rounded-lg hover:bg-bg-elevated"><Copy className="w-4 h-4 text-text-secondary" /></button>
            </div>
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1">HuggingFace Token</label>
            <div className="flex gap-2">
              <input type="password" defaultValue="hf_xxxxxxxxxxxxxxxxxxxxxxxx" className="flex-1 px-3 py-2 bg-bg-tertiary border border-border rounded-lg text-sm text-text-primary font-mono" readOnly />
              <button className="p-2 bg-bg-tertiary border border-border rounded-lg hover:bg-bg-elevated"><Copy className="w-4 h-4 text-text-secondary" /></button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'team' && (
        <div className="bg-bg-secondary border border-border rounded-xl overflow-hidden max-w-2xl">
          <table className="w-full">
            <thead><tr className="border-b border-border">
              <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase">Email</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase">Role</th>
            </tr></thead>
            <tbody>
              <tr className="border-b border-border"><td className="px-4 py-3 text-sm text-text-primary">Kousik R</td><td className="px-4 py-3 text-sm text-text-secondary">kousik@aivar.tech</td><td className="px-4 py-3"><span className="text-xs px-2 py-0.5 rounded bg-accent-purple/10 text-accent-purple">Admin</span></td></tr>
              <tr className="border-b border-border"><td className="px-4 py-3 text-sm text-text-primary">Arun M</td><td className="px-4 py-3 text-sm text-text-secondary">arun@aivar.tech</td><td className="px-4 py-3"><span className="text-xs px-2 py-0.5 rounded bg-accent-blue/10 text-accent-blue">Engineer</span></td></tr>
              <tr><td className="px-4 py-3 text-sm text-text-primary">Priya S</td><td className="px-4 py-3 text-sm text-text-secondary">priya@aivar.tech</td><td className="px-4 py-3"><span className="text-xs px-2 py-0.5 rounded bg-accent-green/10 text-accent-green">Viewer</span></td></tr>
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="bg-bg-secondary border border-border rounded-xl p-6 space-y-4 max-w-2xl">
          {[
            { label: 'Deployment Alerts', desc: 'Get notified when deployments fail or scale' },
            { label: 'Cluster Health', desc: 'Alerts for cluster health degradation' },
            { label: 'Cost Threshold', desc: 'Alert when monthly spend exceeds budget' },
            { label: 'Pipeline Failures', desc: 'Notifications for pipeline run failures' },
          ].map((item, i) => (
            <div key={item.label} className="flex items-center justify-between py-3 border-b border-border last:border-0">
              <div>
                <div className="text-sm text-text-primary">{item.label}</div>
                <div className="text-xs text-text-muted">{item.desc}</div>
              </div>
              <div className={`w-10 h-5 rounded-full relative cursor-pointer ${i < 2 ? 'bg-accent-green' : 'bg-bg-tertiary'}`}>
                <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 ${i < 2 ? 'right-0.5' : 'left-0.5'}`} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
