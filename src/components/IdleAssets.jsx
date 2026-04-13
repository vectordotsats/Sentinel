import React from 'react'
import { Coins } from 'lucide-react'
import { useApp } from '../context/AppContext'

export default function IdleAssets() {
  const { tokens } = useApp()
  const idleTokens = tokens.filter(t => t.idle)

  return (
    <div className="rounded-xl border border-sentinel-border bg-sentinel-card">
      <div className="flex items-center gap-2 border-b border-sentinel-border px-5 py-3.5">
        <Coins className="h-4 w-4 text-amber-400" />
        <h3 className="text-sm font-semibold text-sentinel-textBright">Idle Assets</h3>
        <span className="ml-auto rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-400">
          {idleTokens.length} tokens
        </span>
      </div>

      <div className="divide-y divide-sentinel-border">
        {idleTokens.map(token => {
          const usdValue = token.balance * token.usdPrice
          return (
            <div key={token.symbol} className="flex items-center justify-between px-5 py-3 hover:bg-white/[0.02] transition-colors">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sentinel-accent/10 text-lg">
                  {token.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-sentinel-textBright">{token.symbol}</p>
                  <p className="text-xs text-sentinel-muted">{token.name}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-mono text-sentinel-textBright">
                  {token.balance.toLocaleString(undefined, { maximumFractionDigits: token.balance < 1 ? 8 : 2 })}
                </p>
                <p className="text-xs font-mono text-sentinel-muted">
                  ${usdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
