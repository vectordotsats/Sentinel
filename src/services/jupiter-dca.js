import { Buffer } from 'buffer'

export const DCA_INTERVALS = {
  HOURLY: 3600,
  DAILY: 86400,
  WEEKLY: 604800,
}

export async function createDCAOrder(wallet, publicKey, connection, params) {
  const { VersionedTransaction } = await import('@solana/web3.js')

  // Step 1: Create order
  const res = await fetch('/api/jup-recurring/createOrder', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user: publicKey.toBase58(),
      inputMint: params.inputMint,
      outputMint: params.outputMint,
      params: {
        time: {
          inAmount: parseInt(params.amount),
          numberOfOrders: params.numberOfOrders || 4,
          interval: params.interval || DCA_INTERVALS.WEEKLY,
          minPrice: null,
          maxPrice: null,
          startAt: null,
        },
      },
    }),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || `DCA order failed: ${res.status}`)
  }

  const data = await res.json()

  // Step 2: Sign transaction
  const tx = VersionedTransaction.deserialize(
    Buffer.from(data.transaction, 'base64')
  )
  const signedTx = await wallet.signTransaction(tx)

  // Step 3: Send via RPC
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

  return txid
}