import React from 'react'
import { Sliders, Zap, TrendingUp, Shield } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { RISK_PROFILES } from '../data/mockData'

const trackConfig = {
  yield: { label: 'Yield', icon: Zap, color: 'bg-sentinel-success', accent: 'text-sentinel-success' },
  trade: { label: 'Trade', icon: TrendingUp, color: 'bg-sentinel-accent', accent: 'text-sentinel-accent' },
  hedge: { label: 'Hedge', icon: Shield, color: 'bg-amber-400', accent: 'text-amber-400' },
}

export default function StrategyPanel() {
  const { riskProfile, allocation, updateRiskProfile, updateAllocation, totalIdleValue } = useApp()

  return (
    <div className="rounded-xl border border-sentinel-border bg-sentinel-card">
      <div className="flex items-center gap-2 border-b border-sentinel-border px-5 py-3.5">
        <Sliders className="h-4 w-4 text-sentinel-accent" />
        <h3 className="text-sm font-semibold text-sentinel-textBright">Strategy Allocation</h3>
      </div>

      <div className="p-5 space-y-5">
        {/* Risk Profile Selector */}
        <div>
          <p className="mb-2 text-xs text-sentinel-muted uppercase tracking-wider">Risk Profile</p>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(RISK_PROFILES).map(([key, profile]) => (
              <button
                key={key}
                onClick={() => updateRiskProfile(key)}
                className={`rounded-lg border px-3 py-2 text-xs font-semibold transition-all ${
                  riskProfile === key
                    ? 'border-sentinel-accent bg-sentinel-accent/10 text-sentinel-accent'
                    : 'border-sentinel-border bg-sentinel-surface text-sentinel-muted hover:border-sentinel-accent/30 hover:text-sentinel-text'
                }`}
              >
                {profile.label}
              </button>
            ))}
          </div>
        </div>

        {/* Allocation Sliders */}
        <div className="space-y-4">
          {Object.entries(trackConfig).map(([key, cfg]) => {
            const Icon = cfg.icon
            const value = allocation[key]
            const usdValue = (totalIdleValue * value / 100)

            return (
              <div key={key}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <Icon className={`h-3.5 w-3.5 ${cfg.accent}`} />
                    <span className="text-xs font-medium text-sentinel-text">{cfg.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-sentinel-muted">
                      ${usdValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </span>
                    <span className={`text-xs font-bold font-mono ${cfg.accent}`}>{value}%</span>
                  </div>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={value}
                  onChange={e => updateAllocation(key, parseInt(e.target.value))}
                  className="w-full h-1.5 rounded-full appearance-none bg-sentinel-border cursor-pointer accent-sentinel-accent"
                  style={{
                    background: `linear-gradient(to right, ${
                      key === 'yield' ? '#10b981' : key === 'trade' ? '#6366f1' : '#f59e0b'
                    } ${value}%, #1e2a45 ${value}%)`,
                  }}
                />
              </div>
            )
          })}
        </div>

        {/* Allocation Bar */}
        <div className="h-3 flex rounded-full overflow-hidden">
          <div className="bg-sentinel-success transition-all duration-300" style={{ width: `${allocation.yield}%` }} />
          <div className="bg-sentinel-accent transition-all duration-300" style={{ width: `${allocation.trade}%` }} />
          <div className="bg-amber-400 transition-all duration-300" style={{ width: `${allocation.hedge}%` }} />
          {allocation.yield + allocation.trade + allocation.hedge < 100 && (
            <div className="bg-sentinel-border flex-1" />
          )}
        </div>

        <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-sentinel-muted">
          <span>Total: {allocation.yield + allocation.trade + allocation.hedge}%</span>
          <span>Idle: ${totalIdleValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
        </div>
      </div>
    </div>
  )
}
