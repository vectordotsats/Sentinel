import React from 'react'
import { TrendingUp, Wallet, Activity, Shield } from 'lucide-react'
import { useApp } from '../context/AppContext'

export default function PortfolioSummary() {
  const { totalPortfolioValue, totalIdleValue, totalActiveValue, tokens } = useApp()

  const stats = [
    {
      label: 'Total Portfolio',
      value: totalPortfolioValue,
      icon: Wallet,
      color: 'from-sentinel-accent to-purple-500',
      textColor: 'text-sentinel-accent',
    },
    {
      label: 'Idle Assets',
      value: totalIdleValue,
      icon: Shield,
      color: 'from-amber-500 to-orange-500',
      textColor: 'text-amber-400',
    },
    {
      label: 'Active Positions',
      value: totalActiveValue,
      icon: Activity,
      color: 'from-sentinel-success to-emerald-400',
      textColor: 'text-sentinel-success',
    },
    {
      label: 'Token Count',
      value: tokens.length,
      icon: TrendingUp,
      color: 'from-cyan-500 to-blue-500',
      textColor: 'text-cyan-400',
      isCount: true,
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {stats.map(({ label, value, icon: Icon, color, textColor, isCount }) => (
        <div
          key={label}
          className="group relative overflow-hidden rounded-xl border border-sentinel-border bg-sentinel-card p-4 transition-all hover:border-sentinel-accent/30"
        >
          <div className={`absolute -right-4 -top-4 h-16 w-16 rounded-full bg-gradient-to-br ${color} opacity-10 transition-opacity group-hover:opacity-20`} />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-sentinel-muted">{label}</p>
              <p className={`mt-1 text-xl font-bold font-mono ${textColor}`}>
                {isCount ? value : `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              </p>
            </div>
            <div className={`rounded-lg bg-gradient-to-br ${color} p-2 opacity-80`}>
              <Icon className="h-4 w-4 text-white" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
