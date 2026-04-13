export const MOCK_TOKENS = [
  { symbol: 'SOL', name: 'Solana', mint: 'So11111111111111111111111111111111111111112', balance: 45.23, usdPrice: 178.50, icon: '◎', decimals: 9, idle: true },
  { symbol: 'USDC', name: 'USD Coin', mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', balance: 3200.00, usdPrice: 1.00, icon: '$', decimals: 6, idle: true },
  { symbol: 'JUP', name: 'Jupiter', mint: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN', balance: 1500, usdPrice: 1.42, icon: '♃', decimals: 6, idle: true },
  { symbol: 'RAY', name: 'Raydium', mint: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R', balance: 320, usdPrice: 3.85, icon: '☀', decimals: 6, idle: true },
  { symbol: 'BONK', name: 'Bonk', mint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', balance: 15000000, usdPrice: 0.0000285, icon: '🅱', decimals: 5, idle: true },
  { symbol: 'JTO', name: 'Jito', mint: 'jtojtomepa8beP8AuQc6eXt5FriJwfFMwQx2v2f9mCL', balance: 85, usdPrice: 3.92, icon: '⚡', decimals: 9, idle: true },
]

export const MOCK_ACTIVE_POSITIONS = [
  { protocol: 'Kamino', type: 'Liquidity Vault', pair: 'SOL-USDC', deposited: 2500, currentValue: 2680, apy: 12.4, status: 'active' },
  { protocol: 'Marinade', type: 'Liquid Staking', pair: 'mSOL', deposited: 1800, currentValue: 1935, apy: 7.2, status: 'active' },
  { protocol: 'Drift', type: 'Perp Position', pair: 'SOL-PERP', deposited: 500, currentValue: 545, apy: null, pnl: 45, status: 'active' },
]

export const MOCK_KAMINO_VAULTS = [
  { name: 'SOL-USDC', tvl: 45200000, apy: 14.2, token0: 'SOL', token1: 'USDC', risk: 'Medium' },
  { name: 'JUP-SOL', tvl: 12800000, apy: 22.5, token0: 'JUP', token1: 'SOL', risk: 'High' },
  { name: 'USDC-USDT', tvl: 89000000, apy: 5.8, token0: 'USDC', token1: 'USDT', risk: 'Low' },
  { name: 'mSOL-SOL', tvl: 31500000, apy: 8.9, token0: 'mSOL', token1: 'SOL', risk: 'Low' },
  { name: 'JTO-SOL', tvl: 8900000, apy: 18.7, token0: 'JTO', token1: 'SOL', risk: 'Medium' },
  { name: 'RAY-USDC', tvl: 6200000, apy: 16.3, token0: 'RAY', token1: 'USDC', risk: 'Medium' },
  { name: 'BONK-SOL', tvl: 4100000, apy: 35.2, token0: 'BONK', token1: 'SOL', risk: 'High' },
  { name: 'HNT-SOL', tvl: 2800000, apy: 11.4, token0: 'HNT', token1: 'SOL', risk: 'Medium' },
]

export const RISK_PROFILES = {
  conservative: { yield: 70, trade: 10, hedge: 20, label: 'Conservative', color: '#10b981' },
  balanced: { yield: 45, trade: 30, hedge: 25, label: 'Balanced', color: '#f59e0b' },
  aggressive: { yield: 20, trade: 60, hedge: 20, label: 'Aggressive', color: '#ef4444' },
}

export function generateSimulationSteps(tokens, allocation, riskProfile) {
  const totalIdle = tokens.filter(t => t.idle).reduce((sum, t) => sum + t.balance * t.usdPrice, 0)
  const yieldAmount = (totalIdle * allocation.yield / 100).toFixed(2)
  const tradeAmount = (totalIdle * allocation.trade / 100).toFixed(2)
  const hedgeAmount = (totalIdle * allocation.hedge / 100).toFixed(2)

  const steps = []
  const profile = riskProfile || 'balanced'

  if (allocation.yield > 0) {
    steps.push({
      id: 1,
      type: 'swap',
      action: `Swap $${(yieldAmount * 0.5).toFixed(0)} USDC → SOL via Jupiter`,
      detail: 'Best route: USDC → SOL (Direct, 0.1% slippage)',
      status: 'pending',
      track: 'Yield',
    })
    steps.push({
      id: 2,
      type: 'deposit',
      action: `Deposit $${yieldAmount} into Kamino SOL-USDC vault`,
      detail: `Expected APY: ${profile === 'aggressive' ? '22.5%' : '14.2%'} — Auto-compounding enabled`,
      status: 'pending',
      track: 'Yield',
    })
  }

  if (allocation.trade > 0) {
    steps.push({
      id: 3,
      type: 'swap',
      action: `Swap $${(tradeAmount * 0.4).toFixed(0)} to JUP via DFlow routing`,
      detail: 'DFlow MEV-protected order, priority fee: 0.0001 SOL',
      status: 'pending',
      track: 'Trade',
    })
    steps.push({
      id: 4,
      type: 'order',
      action: `Open ${profile === 'aggressive' ? '3x' : '2x'} long SOL-PERP on Drift ($${(tradeAmount * 0.6).toFixed(0)})`,
      detail: `Leverage: ${profile === 'aggressive' ? '3x' : '2x'}, Stop-loss: -5%, Take-profit: +12%`,
      status: 'pending',
      track: 'Trade',
    })
  }

  if (allocation.hedge > 0) {
    steps.push({
      id: 5,
      type: 'deposit',
      action: `Stake $${(hedgeAmount * 0.6).toFixed(0)} SOL → mSOL via Marinade`,
      detail: 'Liquid staking, APY: 7.2%, instant unstake available',
      status: 'pending',
      track: 'Hedge',
    })
    steps.push({
      id: 6,
      type: 'swap',
      action: `Convert $${(hedgeAmount * 0.4).toFixed(0)} to USDC stablecoin reserve`,
      detail: 'Stablecoin buffer for rebalancing and gas fees',
      status: 'pending',
      track: 'Hedge',
    })
  }

  return steps
}

export function generateMockTxHash() {
  const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
  let hash = ''
  for (let i = 0; i < 44; i++) {
    hash += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return hash
}
