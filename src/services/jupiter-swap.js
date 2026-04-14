const JUP_API = 'https://api.jup.ag'
const API_KEY = import.meta.env.VITE_JUPITER_API_KEY

// Known token mints
export const MINTS = {
  SOL: 'So11111111111111111111111111111111111111112',
  USDC: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  JUP: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
}

export async function getSwapQuote(inputMint, outputMint, amount, slippageBps = 50) {
  const res = await fetch(
    `${JUP_API}/quote/v1?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippageBps=${slippageBps}`,
    { headers: { 'x-api-key': API_KEY } }
  )
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Quote failed: ${err}`)
  }
  return await res.json()
}

export async function executeSwap(quoteResponse, userPublicKey) {
  const res = await fetch(`${JUP_API}/swap/v1/swap`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
    },
    body: JSON.stringify({
      quoteResponse,
      userPublicKey: userPublicKey.toBase58(),
      wrapAndUnwrapSol: true,
    }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Swap failed: ${err}`)
  }
  return await res.json()
}

export async function signAndSendSwap(swapResponse, wallet, connection) {
  const { VersionedTransaction } = await import('@solana/web3.js')

  // Decode the transaction
  const swapTransactionBuf = Buffer.from(swapResponse.swapTransaction, 'base64')
  const transaction = VersionedTransaction.deserialize(swapTransactionBuf)

  // Sign with wallet
  const signedTx = await wallet.signTransaction(transaction)

  // Send to network
  const rawTransaction = signedTx.serialize()
  const txid = await connection.sendRawTransaction(rawTransaction, {
    skipPreflight: true,
    maxRetries: 2,
  })

  // Confirm
  const latestBlockhash = await connection.getLatestBlockhash()
  await connection.confirmTransaction({
    blockhash: latestBlockhash.blockhash,
    lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
    signature: txid,
  })

  return txid
}