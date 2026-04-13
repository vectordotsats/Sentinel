import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { MOCK_TOKENS, MOCK_ACTIVE_POSITIONS, RISK_PROFILES, generateSimulationSteps, generateMockTxHash } from '../data/mockData'

const AppContext = createContext(null)

const STORAGE_KEY = 'sentinel_state'

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return JSON.parse(saved)
  } catch (e) { /* ignore */ }
  return null
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (e) { /* ignore */ }
}

export function AppProvider({ children }) {
  const saved = loadState()

  const [connected, setConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState(null)
  const [tokens, setTokens] = useState(MOCK_TOKENS)
  const [activePositions] = useState(MOCK_ACTIVE_POSITIONS)
  const [riskProfile, setRiskProfile] = useState(saved?.riskProfile || 'balanced')
  const [allocation, setAllocation] = useState(saved?.allocation || { yield: 45, trade: 30, hedge: 25 })
  const [simulationSteps, setSimulationSteps] = useState([])
  const [isSimulating, setIsSimulating] = useState(false)
  const [isExecuting, setIsExecuting] = useState(false)
  const [executionLog, setExecutionLog] = useState(saved?.executionLog || [])
  const [solPrice, setSolPrice] = useState(178.50)

  useEffect(() => {
    saveState({ riskProfile, allocation, executionLog })
  }, [riskProfile, allocation, executionLog])

  const connectWallet = useCallback(() => {
    const mockAddr = '7xKX...m4Dp'
    setWalletAddress(mockAddr)
    setConnected(true)
    addLogEntry('system', `Wallet connected: ${mockAddr}`)
  }, [])

  const disconnectWallet = useCallback(() => {
    setWalletAddress(null)
    setConnected(false)
    setSimulationSteps([])
    addLogEntry('system', 'Wallet disconnected')
  }, [])

  const updateRiskProfile = useCallback((profile) => {
    setRiskProfile(profile)
    const preset = RISK_PROFILES[profile]
    setAllocation({ yield: preset.yield, trade: preset.trade, hedge: preset.hedge })
    setSimulationSteps([])
  }, [])

  const updateAllocation = useCallback((track, value) => {
    setAllocation(prev => {
      const newAlloc = { ...prev, [track]: value }
      const total = newAlloc.yield + newAlloc.trade + newAlloc.hedge
      if (total > 100) {
        const others = Object.keys(newAlloc).filter(k => k !== track)
        const remaining = 100 - value
        const otherTotal = others.reduce((s, k) => s + prev[k], 0)
        if (otherTotal > 0) {
          others.forEach(k => {
            newAlloc[k] = Math.round((prev[k] / otherTotal) * remaining)
          })
          const adjustedTotal = others.reduce((s, k) => s + newAlloc[k], 0)
          if (adjustedTotal + value !== 100) {
            newAlloc[others[0]] += (100 - value - adjustedTotal)
          }
        }
      }
      return newAlloc
    })
    setSimulationSteps([])
  }, [])

  const simulate = useCallback(async () => {
    setIsSimulating(true)
    setSimulationSteps([])
    await new Promise(r => setTimeout(r, 1200))
    const steps = generateSimulationSteps(tokens, allocation, riskProfile)
    setSimulationSteps(steps)
    setIsSimulating(false)
    addLogEntry('simulate', `Simulation generated ${steps.length} steps for ${RISK_PROFILES[riskProfile].label} profile`)
  }, [tokens, allocation, riskProfile])

  const execute = useCallback(async () => {
    if (simulationSteps.length === 0) return
    setIsExecuting(true)

    for (let i = 0; i < simulationSteps.length; i++) {
      await new Promise(r => setTimeout(r, 800 + Math.random() * 1200))
      const step = simulationSteps[i]
      const txHash = generateMockTxHash()

      setSimulationSteps(prev =>
        prev.map((s, idx) => idx === i ? { ...s, status: 'complete', txHash } : idx === i + 1 ? { ...s, status: 'executing' } : s)
      )

      addLogEntry('execute', step.action, txHash)
    }

    setIsExecuting(false)
    addLogEntry('system', 'Strategy execution complete')
  }, [simulationSteps])

  function addLogEntry(type, message, txHash = null) {
    setExecutionLog(prev => [{
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      type,
      message,
      txHash,
    }, ...prev].slice(0, 100))
  }

  const clearLog = useCallback(() => setExecutionLog([]), [])

  const totalPortfolioValue = tokens.reduce((sum, t) => sum + t.balance * t.usdPrice, 0)
    + activePositions.reduce((sum, p) => sum + p.currentValue, 0)

  const totalIdleValue = tokens.filter(t => t.idle).reduce((sum, t) => sum + t.balance * t.usdPrice, 0)
  const totalActiveValue = activePositions.reduce((sum, p) => sum + p.currentValue, 0)

  const value = {
    connected,
    walletAddress,
    tokens,
    activePositions,
    riskProfile,
    allocation,
    simulationSteps,
    isSimulating,
    isExecuting,
    executionLog,
    solPrice,
    totalPortfolioValue,
    totalIdleValue,
    totalActiveValue,
    connectWallet,
    disconnectWallet,
    updateRiskProfile,
    updateAllocation,
    simulate,
    execute,
    clearLog,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
