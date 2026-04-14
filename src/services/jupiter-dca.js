const JUP_API = 'https://api.jup.ag'
const API_KEY = import.meta.env.VITE_JUPITER_API_KEY

export async function createDCAOrder(inputMint, outputMint, totalAmount, frequency, numberOfOrders, userPublicKey) {
  const amountPerCycle = Math.floor(totalAmount / numberOfOrders)

  const res = await fetch(`${JUP_API}/recurring/v1/createOrder`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
    },
    body: JSON.stringify({
      inputMint,
      outputMint,
      payer: userPublicKey.toBase58(),
      maker: userPublicKey.toBase58(),
      inAmount: totalAmount.toString(),
      inAmountPerCycle: amountPerCycle.toString(),
      cycleFrequency: frequency,
      minOutAmountPerCycle: '0',
      maxOutAmountPerCycle: '0',
      startAt: null,
    }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`DCA order failed: ${err}`)
  }
  return await res.json()
}

export async function getDCAOrders(userPublicKey) {
  const res = await fetch(
    `${JUP_API}/recurring/v1/getOrders?maker=${userPublicKey.toBase58()}`,
    { headers: { 'x-api-key': API_KEY } }
  )
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Get DCA orders failed: ${err}`)
  }
  return await res.json()
}

// Frequency helpers (in seconds)
export const DCA_FREQUENCY = {
  DAILY: 86400,
  WEEKLY: 604800,
  BIWEEKLY: 1209600,
  MONTHLY: 2592000,
}