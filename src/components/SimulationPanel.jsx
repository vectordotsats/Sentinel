import React from 'react'
import { Play, Loader2, CheckCircle, Circle, Clock, ExternalLink, Rocket } from 'lucide-react'
import { useApp } from '../context/AppContext'

const trackColors = {
  Yield: 'border-sentinel-success text-sentinel-success bg-sentinel-success/10',
  Trade: 'border-sentinel-accent text-sentinel-accent bg-sentinel-accent/10',
  Hedge: 'border-amber-400 text-amber-400 bg-amber-400/10',
}

function StepIcon({ status }) {
  if (status === 'complete') return <CheckCircle className="h-4 w-4 text-sentinel-success" />
  if (status === 'executing') return <Loader2 className="h-4 w-4 text-sentinel-accent animate-spin" />
  return <Circle className="h-4 w-4 text-sentinel-muted" />
}

export default function SimulationPanel() {
  const { simulationSteps, isSimulating, isExecuting, simulate, execute } = useApp()

  return (
    <div className="rounded-xl border border-sentinel-border bg-sentinel-card">
      <div className="flex items-center justify-between border-b border-sentinel-border px-5 py-3.5">
        <div className="flex items-center gap-2">
          <Play className="h-4 w-4 text-sentinel-highlight" />
          <h3 className="text-sm font-semibold text-sentinel-textBright">Strategy Simulation</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={simulate}
            disabled={isSimulating || isExecuting}
            className="flex items-center gap-1.5 rounded-lg border border-sentinel-accent/50 bg-sentinel-accent/10 px-3 py-1.5 text-xs font-semibold text-sentinel-accent transition-all hover:bg-sentinel-accent/20 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isSimulating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}
            Simulate
          </button>
          {simulationSteps.length > 0 && !isSimulating && (
            <button
              onClick={execute}
              disabled={isExecuting}
              className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-sentinel-accent to-purple-500 px-3 py-1.5 text-xs font-semibold text-white transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-sentinel-accent/20"
            >
              {isExecuting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Rocket className="h-3 w-3" />}
              Execute
            </button>
          )}
        </div>
      </div>

      <div className="p-5">
        {isSimulating && (
          <div className="flex flex-col items-center justify-center py-10">
            <Loader2 className="h-8 w-8 text-sentinel-accent animate-spin mb-3" />
            <p className="text-sm text-sentinel-muted">Running simulation...</p>
            <p className="text-xs text-sentinel-muted mt-1">Analyzing routes and protocols</p>
          </div>
        )}

        {!isSimulating && simulationSteps.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Clock className="h-8 w-8 text-sentinel-muted/50 mb-3" />
            <p className="text-sm text-sentinel-muted">No simulation running</p>
            <p className="text-xs text-sentinel-muted mt-1">Adjust your allocation and click Simulate to preview the strategy</p>
          </div>
        )}

        {!isSimulating && simulationSteps.length > 0 && (
          <div className="space-y-3">
            {simulationSteps.map((step, i) => (
              <div
                key={step.id}
                className={`relative rounded-lg border p-3.5 transition-all ${
                  step.status === 'complete'
                    ? 'border-sentinel-success/30 bg-sentinel-success/5'
                    : step.status === 'executing'
                    ? 'border-sentinel-accent/50 bg-sentinel-accent/5 shadow-lg shadow-sentinel-accent/10'
                    : 'border-sentinel-border bg-sentinel-surface/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    <StepIcon status={step.status} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider border ${trackColors[step.track] || 'border-sentinel-border text-sentinel-muted'}`}>
                        {step.track}
                      </span>
                      <span className="text-[10px] text-sentinel-muted uppercase tracking-wider">
                        Step {i + 1}
                      </span>
                    </div>
                    <p className="text-sm text-sentinel-textBright">{step.action}</p>
                    <p className="text-xs text-sentinel-muted mt-0.5">{step.detail}</p>
                    {step.txHash && (
                      <div className="mt-2 flex items-center gap-1.5">
                        <span className="text-[10px] font-mono text-sentinel-success">
                          tx: {step.txHash.slice(0, 8)}...{step.txHash.slice(-4)}
                        </span>
                        <ExternalLink className="h-3 w-3 text-sentinel-muted" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
