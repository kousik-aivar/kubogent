import type { LucideIcon } from 'lucide-react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { AreaChart, Area, ResponsiveContainer } from 'recharts'

interface MetricCardProps {
  label: string
  value: string | number
  trend?: number
  trendDirection?: 'up' | 'down'
  sparklineData?: number[]
  icon?: LucideIcon
  prefix?: string
  suffix?: string
}

export default function MetricCard({
  label,
  value,
  trend,
  trendDirection = 'up',
  sparklineData,
  icon: Icon,
  prefix = '',
  suffix = '',
}: MetricCardProps) {
  const trendColor = trendDirection === 'up' ? 'text-accent-green' : 'text-accent-red'
  const chartData = sparklineData?.map((v, i) => ({ i, v }))

  return (
    <div className="bg-bg-secondary border border-border rounded-xl p-5 relative overflow-hidden">
      <div className="flex items-start justify-between mb-3">
        <span className="text-sm text-text-secondary">{label}</span>
        {Icon && (
          <div className="w-8 h-8 rounded-lg bg-bg-tertiary flex items-center justify-center">
            <Icon className="w-4 h-4 text-text-secondary" />
          </div>
        )}
      </div>
      <div className="text-3xl font-semibold text-text-primary mb-2">
        {prefix}{value}{suffix}
      </div>
      {trend !== undefined && (
        <div className={`flex items-center gap-1 text-xs ${trendColor}`}>
          {trendDirection === 'up' ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          <span>{trendDirection === 'up' ? '+' : ''}{trend}% from last week</span>
        </div>
      )}
      {chartData && chartData.length > 0 && (
        <div className="absolute bottom-0 right-0 w-24 h-12 opacity-40">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <Area
                type="monotone"
                dataKey="v"
                stroke={trendDirection === 'up' ? '#22c55e' : '#ef4444'}
                fill={trendDirection === 'up' ? '#22c55e' : '#ef4444'}
                fillOpacity={0.2}
                strokeWidth={1.5}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
