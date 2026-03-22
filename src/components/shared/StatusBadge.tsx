const statusStyles: Record<string, { dot: string; text: string; bg: string }> = {
  Running: { dot: 'bg-accent-green', text: 'text-accent-green', bg: 'bg-accent-green/10' },
  Available: { dot: 'bg-accent-green', text: 'text-accent-green', bg: 'bg-accent-green/10' },
  Completed: { dot: 'bg-accent-green', text: 'text-accent-green', bg: 'bg-accent-green/10' },
  Active: { dot: 'bg-accent-green', text: 'text-accent-green', bg: 'bg-accent-green/10' },
  Deploying: { dot: 'bg-accent-amber animate-pulse', text: 'text-accent-amber', bg: 'bg-accent-amber/10' },
  Building: { dot: 'bg-accent-amber animate-pulse', text: 'text-accent-amber', bg: 'bg-accent-amber/10' },
  Provisioning: { dot: 'bg-accent-blue animate-pulse', text: 'text-accent-blue', bg: 'bg-accent-blue/10' },
  Updating: { dot: 'bg-accent-blue animate-pulse', text: 'text-accent-blue', bg: 'bg-accent-blue/10' },
  Pending: { dot: 'bg-accent-blue animate-pulse', text: 'text-accent-blue', bg: 'bg-accent-blue/10' },
  Failed: { dot: 'bg-accent-red', text: 'text-accent-red', bg: 'bg-accent-red/10' },
  Error: { dot: 'bg-accent-red', text: 'text-accent-red', bg: 'bg-accent-red/10' },
  Degraded: { dot: 'bg-accent-red', text: 'text-accent-red', bg: 'bg-accent-red/10' },
  Stopped: { dot: 'bg-text-muted', text: 'text-text-muted', bg: 'bg-bg-tertiary' },
  Idle: { dot: 'bg-text-muted', text: 'text-text-muted', bg: 'bg-bg-tertiary' },
}

export default function StatusBadge({ status }: { status: string }) {
  const style = statusStyles[status] || statusStyles.Stopped
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {status}
    </span>
  )
}
