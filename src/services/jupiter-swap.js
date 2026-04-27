import { Buffer } from 'buffer';

export const MINTS = {
  SOL: 'So11111111111111111111111111111111111111112',
  USDC: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  JUP: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
}

export async function getSwapOrder(inputMint, outputMint, amount, taker, slippageBps = 50) {
  const params = new URLSearchParams({
    inputMint,
    outputMint,
    amount: amount.toString(),
    taker,
    slippageBps: slippageBps.toString(),
  })

  const res = await fetch(`/api/jup-swap/order?${params}`)
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Swap order failed: ${err}`)
  }
  const data = await res.json()

  if (!data.transaction) {
    throw new Error(data.errorMessage || 'No transaction returned')
  }

  return data
}

export async function signAndSendSwap(orderResponse, wallet, connection) {
  const { VersionedTransaction } = await import('@solana/web3.js')

  // Decode the transaction
  const txBuf = Buffer.from(orderResponse.transaction, 'base64')
  const transaction = VersionedTransaction.deserialize(txBuf)

  // Sign with wallet
  const signedTx = await wallet.signTransaction(transaction)

  // Submit via Jupiter execute endpoint
  const signedTxBase64 = Buffer.from(signedTx.serialize()).toString('base64')

  const executeRes = await fetch('/api/jup-swap/execute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      signedTransaction: signedTxBase64,
      requestId: orderResponse.requestId,
    }),
  })

  if (executeRes.ok) {
    const result = await executeRes.json()
    return result.txid || result.signature
  }

  // Fallback: send directly via RPC if execute fails
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