import React from 'react'
import { Activity, TrendingUp, TrendingDown } from 'lucide-react'
import { useApp } from '../context/AppContext'

export default function ActivePositions() {
  const { activePositions } = useApp()

  return (
    <div className="rounded-xl border border-sentinel-border bg-sentinel-card">
      <div className="flex items-center gap-2 border-b border-sentinel-border px-5 py-3.5">
        <Activity className="h-4 w-4 text-sentinel-success" />
        <h3 className="text-sm font-semibold text-sentinel-textBright">Active Positions</h3>
        <span className="ml-auto rounded-full bg-sentinel-success/10 px-2 py-0.5 text-xs font-medium text-sentinel-success">
          {activePositions.length} active
        </span>
      </div>

      <div className="divide-y divide-sentinel-border">
        {activePositions.map((pos, i) => {
          const pnl = pos.currentValue - pos.deposited
          const pnlPct = ((pnl / pos.deposited) * 100).toFixed(1)
          const isPositive = pnl >= 0

          return (
            <div key={i} className="px-5 py-3.5 hover:bg-white/[0.02] transition-colors">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-sentinel-accent/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-sentinel-accent">
                    {pos.protocol}
                  </span>
                  <span className="text-xs text-sentinel-muted">{pos.type}</span>
                </div>
                <div className={`flex items-center gap-1 text-xs font-medium ${isPositive ? 'text-sentinel-success' : 'text-sentinel-danger'}`}>
                  {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {isPositive ? '+' : ''}{pnlPct}%
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-sentinel-textBright">{pos.pair}</p>
                  {pos.apy && (
                    <p className="text-xs text-sentinel-muted">APY: <span className="text-sentinel-success">{pos.apy}%</span></p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm font-mono text-sentinel-textBright">
                    ${pos.currentValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                  <p className={`text-xs font-mono ${isPositive ? 'text-sentinel-success' : 'text-sentinel-danger'}`}>
                    {isPositive ? '+' : ''}${pnl.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
