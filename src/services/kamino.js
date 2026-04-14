const KAMINO_API = 'https://api.kamino.finance'

export async function fetchKaminoVaults() {
  try {
    const vaultsRes = await fetch(`${KAMINO_API}/kvaults/vaults`)
    if (!vaultsRes.ok) throw new Error('Failed to fetch vaults')
    const vaults = await vaultsRes.json()

    const processed = vaults
      .map((vault) => {
        const state = vault.state || {}
        const name = state.name || 'Unknown'
        const tokenAvailable = parseFloat(state.tokenAvailable) || 0
        const sharesIssued = parseFloat(state.sharesIssued) || 0
        const prevAum = parseFloat(state.prevAum) || 0
        const cumulativeInterest = parseFloat(state.cumulativeEarnedInterest) || 0
        const creationTime = state.creationTimestamp || 0
        
        // Estimate APY from cumulative interest and AUM
        const now = Math.floor(Date.now() / 1000)
        const ageSeconds = now - creationTime
        const ageYears = ageSeconds / (365 * 24 * 3600)
        let apy = 0
        if (prevAum > 0 && cumulativeInterest > 0 && ageYears > 0) {
          apy = (cumulativeInterest / prevAum / ageYears) * 100
        }

        return {
          address: vault.address,
          name: name,
          tokenMint: state.tokenMint || '',
          tvl: prevAum,
          apy: Math.min(apy, 999),
          token0: name.split('-')[0] || name.split(' ')[0] || '?',
          token1: name.split('-')[1] || '',
          risk: apy > 15 ? 'High' : apy > 5 ? 'Medium' : 'Low',
        }
      })
      .filter(v => v.tvl > 0)
      .sort((a, b) => b.tvl - a.tvl)
      .slice(0, 20)

    return processed
  } catch (err) {
    console.error('Kamino API error:', err)
    return []
  }
}