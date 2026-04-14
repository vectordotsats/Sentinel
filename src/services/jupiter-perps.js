const JUP_API = 'https://api.jup.ag'
const API_KEY = import.meta.env.VITE_JUPITER_API_KEY

export async function getPerpMarkets() {
  const res = await fetch(`${JUP_API}/perps/v1/markets`, {
    headers: { 'x-api-key': API_KEY }
  })
  if (!res.ok) throw new Error('Failed to fetch perp markets')
  return await res.json()
}

export async function openPerpPosition(market, side, size, leverage, userPublicKey) {
  const res = await fetch(`${JUP_API}/perps/v1/openPosition`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
    },
    body: JSON.stringify({
      market,
      side,
      size: size.toString(),
      leverage: leverage.toString(),
      maker: userPublicKey.toBase58(),
    }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Open perp failed: ${err}`)
  }
  return await res.json()
}

export async function getPredictionMarkets(query) {
  const res = await fetch(`${JUP_API}/prediction/v1/markets?q=${encodeURIComponent(query || '')}`, {
    headers: { 'x-api-key': API_KEY }
  })
  if (!res.ok) throw new Error('Failed to fetch prediction markets')
  return await res.json()
}

export async function placePredictionBet(marketId, outcome, amount, userPublicKey) {
  const res = await fetch(`${JUP_API}/prediction/v1/place`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
    },
    body: JSON.stringify({
      marketId,
      outcome,
      amount: amount.toString(),
      maker: userPublicKey.toBase58(),
    }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Prediction bet failed: ${err}`)
  }
  return await res.json()
}