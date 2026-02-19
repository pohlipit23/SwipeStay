const EASYGDS_BASE = 'https://tripo.apps.easygds.com'
const TOKEN_KEY = 'easygds_jwt'

export async function getToken(env: any): Promise<string> {
  // Try KV cache first
  if (env.EASYGDS_AUTH) {
    const cached = await env.EASYGDS_AUTH.get(TOKEN_KEY)
    if (cached) return cached
  }

  // Authenticate
  const res = await fetch(`${EASYGDS_BASE}/api/v2/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: env.EASYGDS_EMAIL,
      password: env.EASYGDS_PASSWORD,
    }),
  })

  if (!res.ok) {
    throw new Error(`easyGDS auth failed: ${res.status}`)
  }

  const data: any = await res.json()
  const token = data.token || data.access_token || data.data?.token
  if (!token) throw new Error('No token in auth response')

  // Cache in KV for 55 minutes (tokens typically last 60 min)
  if (env.EASYGDS_AUTH) {
    await env.EASYGDS_AUTH.put(TOKEN_KEY, token, { expirationTtl: 3300 })
  }

  return token
}
