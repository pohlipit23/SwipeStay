const EASYGDS_BASE = 'https://tripo.apps.easygds.com'

import { getToken } from './auth'

export async function easygdsGet(path: string, env: any): Promise<any> {
  const token = await getToken(env)
  const res = await fetch(`${EASYGDS_BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (res.status === 401) {
    // Token expired, clear cache and retry once
    if (env.EASYGDS_AUTH) await env.EASYGDS_AUTH.delete('easygds_jwt')
    const newToken = await getToken(env)
    const retry = await fetch(`${EASYGDS_BASE}${path}`, {
      headers: { Authorization: `Bearer ${newToken}` },
    })
    if (!retry.ok) throw new Error(`easyGDS GET failed: ${retry.status}`)
    return retry.json()
  }
  if (!res.ok) throw new Error(`easyGDS GET failed: ${res.status}`)
  return res.json()
}

export async function easygdsPost(path: string, body: any, env: any, extraHeaders?: Record<string, string>): Promise<any> {
  const token = await getToken(env)
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json;charset=UTF-8',
    ...extraHeaders,
  }
  if (env.TERRITORY) headers['X-Territory'] = env.TERRITORY

  const res = await fetch(`${EASYGDS_BASE}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })
  if (res.status === 401) {
    if (env.EASYGDS_AUTH) await env.EASYGDS_AUTH.delete('easygds_jwt')
    const newToken = await getToken(env)
    headers.Authorization = `Bearer ${newToken}`
    const retry = await fetch(`${EASYGDS_BASE}${path}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    })
    if (!retry.ok) throw new Error(`easyGDS POST failed: ${retry.status}`)
    return retry.json()
  }
  if (!res.ok) throw new Error(`easyGDS POST failed: ${res.status}`)
  return res.json()
}
