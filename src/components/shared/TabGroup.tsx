interface Tab {
  key: string
  label: string
}

interface TabGroupProps {
  tabs: Tab[]
  activeTab: string
  onChange: (key: string) => void
}

export default function TabGroup({ tabs, activeTab, onChange }: TabGroupProps) {
  return (
    <div className="sticky top-0 z-20 -mx-6 px-6 bg-bg-primary flex border-b border-border mb-6">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`px-4 py-3 text-sm font-medium transition-colors relative ${
            activeTab === tab.key
              ? 'text-accent-blue'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          {tab.label}
          {activeTab === tab.key && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-blue rounded-full" />
          )}
        </button>
      ))}
    </div>
  )
}
