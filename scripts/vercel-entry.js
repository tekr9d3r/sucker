import server from '../dist/server/server.js'

export default async function handler(req, res) {
  const protocol = req.headers['x-forwarded-proto'] ?? 'https'
  const host = req.headers.host ?? req.headers['x-forwarded-host'] ?? 'localhost'
  const url = new URL(req.url, `${protocol}://${host}`)

  const headers = new Headers()
  for (const [key, value] of Object.entries(req.headers)) {
    if (value !== undefined) {
      headers.set(key, Array.isArray(value) ? value.join(', ') : value)
    }
  }

  const hasBody = !['GET', 'HEAD'].includes(req.method ?? 'GET')
  const body = hasBody
    ? await new Promise((resolve, reject) => {
        const chunks = []
        req.on('data', (c) => chunks.push(c))
        req.on('end', () => resolve(Buffer.concat(chunks)))
        req.on('error', reject)
      })
    : undefined

  const request = new Request(url, { method: req.method, headers, body })

  try {
    const response = await server.fetch(request)

    res.statusCode = response.status
    for (const [key, value] of response.headers.entries()) {
      res.setHeader(key, value)
    }

    if (response.body) {
      const reader = response.body.getReader()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        res.write(Buffer.from(value))
      }
    }
    res.end()
  } catch (err) {
    console.error('SSR error:', err)
    res.statusCode = 500
    res.end('Internal Server Error')
  }
}
