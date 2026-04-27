exports.handler = async (event) => {
  const ids = event.queryStringParameters.ids || ''
  const res = await fetch(`https://api.jup.ag/price/v3?ids=${ids}`, {
    headers: { 'x-api-key': process.env.VITE_JUPITER_API_KEY },
  })
  const data = await res.text()
  return {
    statusCode: res.status,
    headers: { 'Content-Type': 'application/json' },
    body: data,
  }
}