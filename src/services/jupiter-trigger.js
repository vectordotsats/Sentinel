import { Buffer } from 'buffer'

const TRIGGER_API = '/api/jup-trigger'

// Store JWT in memory
let jwtToken = null
let jwtExpiry = 0

export async function authenticateTrigger(wallet, publicKey) {
  // Step 1: Request challenge
  const challengeRes = await fetch(`${TRIGGER_API}/auth/challenge`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      walletPubkey: publicKey.toBase58(),
      type: 'message',
    }),
  })
  const challenge = await challengeRes.json()

  // Step 2: Sign challenge with wallet
  const encodedMessage = new TextEncoder().encode(challenge.challenge)
  const signature = await wallet.signMessage(encodedMessage)

  // Step 3: Verify and get JWT
  const bs58 = await import('bs58')
  const verifyRes = await fetch(`${TRIGGER_API}/auth/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'message',
      walletPubkey: publicKey.toBase58(),
      signature: bs58.default.encode(signature),
    }),
  })
  const { token } = await verifyRes.json()

  jwtToken = token
  jwtExpiry = Date.now() + 23 * 60 * 60 * 1000 // 23 hours
  return token
}

async function getToken(wallet, publicKey) {
  if (jwtToken && Date.now() < jwtExpiry) return jwtToken
  return await authenticateTrigger(wallet, publicKey)
}

export async function getVault(wallet, publicKey) {
  const token = await getToken(wallet, publicKey)

  let res = await fetch(`${TRIGGER_API}/vault`, {
    headers: { 'Authorization': `Bearer ${token}` },
  })

  // First time — register vault
  if (!res.ok) {
    res = await fetch(`${TRIGGER_API}/vault/register`, {
      headers: { 'Authorization': `Bearer ${token}` },
    })
  }

  return await res.json()
}

export async function createTriggerOrder(wallet, publicKey, connection, params) {
  const { VersionedTransaction } = await import('@solana/web3.js')
  const token = await getToken(wallet, publicKey)

  // Step 1: Get vault
  await getVault(wallet, publicKey)

  // Step 2: Craft deposit
  const depositRes = await fetch(`${TRIGGER_API}/deposit/craft`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      inputMint: params.inputMint,
      outputMint: params.outputMint,
      userAddress: publicKey.toBase58(),
      amount: params.amount.toString(),
    }),
  })

  if (!depositRes.ok) {
    const err = await depositRes.text()
    throw new Error(`Deposit craft failed: ${err}`)
  }

  const deposit = await depositRes.json()

  // Step 3: Sign deposit transaction
  const tx = VersionedTransaction.deserialize(
    Buffer.from(deposit.transaction, 'base64')
  )
  const signedTx = await wallet.signTransaction(tx)
  const depositSignedTx = Buffer.from(signedTx.serialize()).toString('base64')

  // Step 4: Create order
  const orderBody = {
    depositRequestId: deposit.requestId,
    depositSignedTx,
    userPubkey: publicKey.toBase58(),
    inputMint: params.inputMint,
    inputAmount: params.amount.toString(),
    outputMint: params.outputMint,
    triggerMint: params.triggerMint || params.inputMint,
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  }

  if (params.orderType === 'oco') {
    orderBody.orderType = 'oco'
    orderBody.tpPriceUsd = params.tpPrice
    orderBody.slPriceUsd = params.slPrice
    orderBody.tpSlippageBps = 100
    orderBody.slSlippageBps = 2000
  } else {
    orderBody.orderType = 'single'
    orderBody.triggerCondition = params.triggerCondition || 'above'
    orderBody.triggerPriceUsd = params.triggerPrice
    orderBody.slippageBps = 100
  }

  const orderRes = await fetch(`${TRIGGER_API}/orders/price`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(orderBody),
  })

  if (!orderRes.ok) {
    const err = await orderRes.text()
    throw new Error(`Order creation failed: ${err}`)
  }

  return await orderRes.json()
}