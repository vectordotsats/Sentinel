const JUP_API = 'https://api.jup.ag'
const API_KEY = import.meta.env.VITE_JUPITER_API_KEY

export async function createTriggerOrder(inputMint, outputMint, amount, triggerPrice, userPublicKey, orderType = 'limit') {
  const res = await fetch(`${JUP_API}/trigger/v1/createOrder`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
    },
    body: JSON.stringify({
      inputMint,
      outputMint,
      maker: userPublicKey.toBase58(),
      payer: userPublicKey.toBase58(),
      makingAmount: amount.toString(),
      takingAmount: triggerPrice.toString(),
      expiredAt: null,
    }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Trigger order failed: ${err}`)
  }
  return await res.json()
}

export async function cancelTriggerOrder(orderPubkey, userPublicKey) {
  const res = await fetch(`${JUP_API}/trigger/v1/cancelOrder`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
    },
    body: JSON.stringify({
      maker: userPublicKey.toBase58(),
      order: orderPubkey,
    }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Cancel order failed: ${err}`)
  }
  return await res.json()
}

export async function getOpenOrders(userPublicKey) {
  const res = await fetch(
    `${JUP_API}/trigger/v1/getOrders?maker=${userPublicKey.toBase58()}`,
    { headers: { 'x-api-key': API_KEY } }
  )
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Get orders failed: ${err}`)
  }
  return await res.json()
}