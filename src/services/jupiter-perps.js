import { Buffer } from 'buffer'

// ===== PREDICTION MARKETS =====

export async function getPredictionEvents(category) {
  const url = category 
    ? `/api/jup-prediction/events?category=${category}`
    : `/api/jup-prediction/events`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch events: ${res.status}`)
  return await res.json()
}

export async function placePredictionBet(wallet, publicKey, connection, params) {
  const { VersionedTransaction } = await import('@solana/web3.js')

  // Step 1: Create buy order
  const res = await fetch('/api/jup-prediction/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ownerPubkey: publicKey.toBase58(),
      marketId: params.marketId,
      isYes: params.isYes,
      isBuy: true,
      depositAmount: params.amount.toString(),
      depositMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Prediction order failed: ${err}`)
  }

  const orderData = await res.json()

  // Step 2: Sign transaction
  const tx = VersionedTransaction.deserialize(
    Buffer.from(orderData.transaction, 'base64')
  )
  const signedTx = await wallet.signTransaction(tx)

  // Step 3: Send to network
  const rawTransaction = signedTx.serialize()
  const txid = await connection.sendRawTransaction(rawTransaction, {
    skipPreflight: true,
    maxRetries: 2,
  })

  const latestBlockhash = await connection.getLatestBlockhash()
  await connection.confirmTransaction({
    blockhash: latestBlockhash.blockhash,
    lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
    signature: txid,
  })

  return {
    txid,
    orderPubkey: orderData.order?.orderPubkey,
    positionPubkey: orderData.order?.positionPubkey,
  }
}

// ===== PERPS =====

export async function openPerpPosition(wallet, publicKey, connection, params) {
  // Perps API is CORS-blocked from browser
  // Documented as feedback in DX report
  throw new Error('Perps REST API is CORS-blocked from browser. Requires server-side proxy or program-level integration.')
}