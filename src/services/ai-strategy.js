export async function generateStrategy(tokens, allocation, riskProfile, kaminoVaults) {
  const totalValue = tokens.reduce((sum, t) => sum + t.balance * t.usdPrice, 0)
  const yieldAmount = (totalValue * allocation.yield / 100).toFixed(2)
  const tradeAmount = (totalValue * allocation.trade / 100).toFixed(2)
  const hedgeAmount = (totalValue * allocation.hedge / 100).toFixed(2)

  const mainToken = tokens[0]?.symbol || 'SOL'
  const mainPrice = tokens[0]?.usdPrice || 0
  const bestVault = kaminoVaults?.[0]

  // Simulate AI thinking time
  await new Promise(r => setTimeout(r, 1500))

  const steps = []
  let stepId = 1

  // YIELD TRACK
  if (allocation.yield > 0) {
    const swapAmount = (yieldAmount * 0.5).toFixed(0)
    steps.push({
      id: stepId++,
      type: 'swap',
      track: 'Yield',
      status: 'pending',
      action: `Swap $${swapAmount} ${mainToken} → USDC via Jupiter Swap V2`,
      detail: `DFlow MEV-protected routing, estimated slippage: 0.1%`,
      api: 'Swap V2',
    })
    steps.push({
      id: stepId++,
      type: 'deposit',
      track: 'Yield',
      status: 'pending',
      action: `Deposit $${yieldAmount} into ${bestVault?.name || 'Kamino USDC'} vault`,
      detail: `Expected APY: ${bestVault?.apy?.toFixed(1) || '8.5'}% — Auto-compounding via Kamino`,
      api: 'Lend',
    })
  }

  // TRADE TRACK
  if (allocation.trade > 0) {
    const slPercent = riskProfile === 'aggressive' ? 10 : riskProfile === 'conservative' ? 3 : 5
    const tpPercent = riskProfile === 'aggressive' ? 20 : riskProfile === 'conservative' ? 8 : 12
    const tpPrice = mainPrice > 0 ? (mainPrice * (1 + tpPercent / 100)).toFixed(2) : 'N/A'
    const slPrice = mainPrice > 0 ? (mainPrice * (1 - slPercent / 100)).toFixed(2) : 'N/A'

    steps.push({
      id: stepId++,
      type: 'order',
      track: 'Trade',
      status: 'pending',
      action: `Set OCO order on ${mainToken} ($${tradeAmount})`,
      detail: `TP: $${tpPrice} (+${tpPercent}%) / SL: $${slPrice} (-${slPercent}%) via Jupiter Trigger API`,
      api: 'Trigger',
    })

    const dcaAmount = (tradeAmount * 0.3).toFixed(0)
    steps.push({
      id: stepId++,
      type: 'order',
      track: 'Trade',
      status: 'pending',
      action: `Set DCA buyback: $${dcaAmount} → ${mainToken} over 4 weeks`,
      detail: `Weekly purchases via Jupiter Recurring API — activates if SL triggers`,
      api: 'Recurring',
    })
  }

  // HEDGE TRACK
  if (allocation.hedge > 0) {
    const predAmount = (hedgeAmount * 0.5).toFixed(0)
    const perpAmount = (hedgeAmount * 0.5).toFixed(0)
    const leverage = riskProfile === 'aggressive' ? '3x' : riskProfile === 'conservative' ? '1.5x' : '2x'

    steps.push({
      id: stepId++,
      type: 'hedge',
      track: 'Hedge',
      status: 'pending',
      action: `Prediction market hedge: $${predAmount} on ${mainToken} downside`,
      detail: `Bet on "${mainToken} below $${mainPrice > 0 ? (mainPrice * 0.85).toFixed(0) : '?'}" via Jupiter Prediction Markets API`,
      api: 'Prediction Markets',
    })
    steps.push({
      id: stepId++,
      type: 'hedge',
      track: 'Hedge',
      status: 'pending',
      action: `Open ${leverage} short hedge via Perps ($${perpAmount})`,
      detail: `${leverage} leveraged short on ${mainToken}-PERP — portfolio insurance via Jupiter Perps API`,
      api: 'Perps',
    })
  }

  return steps
}