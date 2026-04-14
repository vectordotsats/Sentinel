const KAMINO_API = 'https://api.kamino.finance'

export async function fetchKaminoVaults() {
  try {
    // Get all vaults
    const vaultsRes = await fetch(`${KAMINO_API}/kvaults/vaults`)
    if (!vaultsRes.ok) throw new Error('Failed to fetch vaults')
    const vaults = await vaultsRes.json()

    // Get metrics for each vault (APY, TVL)
    const vaultsWithMetrics = await Promise.all(
      vaults.slice(0, 20).map(async (vault) => {
        try {
          const metricsRes = await fetch(`${KAMINO_API}/kvaults/metrics/${vault.address}`)
          const metrics = metricsRes.ok ? await metricsRes.json() : null

          const tokenMint = vault.state?.tokenMint || ''
          const name = vault.state?.name || 'Unknown Vault'

          return {
            address: vault.address,
            name: name,
            tokenMint: tokenMint,
            tvl: metrics?.tvl || 0,
            apy: metrics?.apy ? (metrics.apy * 100) : 0,
            token0: name.split('-')[0] || '?',
            token1: name.split('-')[1] || '',
            risk: metrics?.apy > 0.15 ? 'High' : metrics?.apy > 0.05 ? 'Medium' : 'Low',
          }
        } catch {
          return null
        }
      })
    )

    return vaultsWithMetrics.filter(v => v !== null && v.tvl > 0)
  } catch (err) {
    console.error('Kamino API error:', err)
    return []
  }
}