exports.handler = async (event) => {
  const query = event.queryStringParameters.query || ''
  const res = await fetch(`https://api.jup.ag/tokens/v2/search?query=${query}`, {
    headers: { 'x-api-key': process.env.VITE_JUPITER_API_KEY },
  })
  const data = await res.text()
  return {
    statusCode: res.status,
    headers: { 'Content-Type': 'application/json' },
    body: data,
  }
}