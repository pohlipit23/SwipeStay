import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import tailwindcss from '@tailwindcss/vite'
import fs from 'node:fs'
import path from 'node:path'

const EASYGDS_BASE = 'https://tripo.apps.easygds.com'

// Load .dev.vars for local dev credentials
function loadDevVars(): Record<string, string> {
  const vars: Record<string, string> = {}
  const devVarsPath = path.resolve(process.cwd(), '.dev.vars')
  if (fs.existsSync(devVarsPath)) {
    for (const line of fs.readFileSync(devVarsPath, 'utf8').split('\n')) {
      const [key, ...rest] = line.split('=')
      if (key?.trim() && rest.length) vars[key.trim()] = rest.join('=').trim()
    }
  }
  return vars
}

let cachedToken: string | null = null
let tokenExpiry = 0

async function getToken(env: Record<string, string>): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken
  const res = await fetch(`${EASYGDS_BASE}/api/v2/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: env.EASYGDS_EMAIL, password: env.EASYGDS_PASSWORD }),
  })
  if (!res.ok) throw new Error(`easyGDS auth failed: ${res.status} ${await res.text()}`)
  const data: any = await res.json()
  const token = data.token || data.access_token || data.data?.token
  if (!token) throw new Error('No token in auth response')
  cachedToken = token
  tokenExpiry = Date.now() + 55 * 60 * 1000 // 55 min
  return token
}

function devApiPlugin() {
  return {
    name: 'dev-api',
    configureServer(server: any) {
      const env = loadDevVars()
      server.middlewares.use(async (req: any, res: any, next: any) => {
        if (!req.url?.startsWith('/api/')) return next()

        const ts = new Date().toLocaleTimeString()
        res.setHeader('Content-Type', 'application/json')
        res.setHeader('Access-Control-Allow-Origin', '*')

        try {
          const token = await getToken(env)
          const url = new URL(req.url, 'http://localhost')
          const headers: Record<string, string> = {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json;charset=UTF-8',
          }
          if (env.TERRITORY) headers['X-Territory'] = env.TERRITORY

          // Route: GET /api/places
          if (req.method === 'GET' && url.pathname === '/api/places') {
            console.log(`[${ts}] → GET /api/places search_text=${url.searchParams.get('search_text')}`)
            const upstream = await fetch(`${EASYGDS_BASE}/api/places?${url.searchParams}`, {
              headers: { Authorization: `Bearer ${token}` },
            })
            const body = await upstream.text()
            console.log(`[${ts}] ← GET /api/places ${upstream.status}`)
            if (!upstream.ok) console.error(`[${ts}]   body: ${body.slice(0, 500)}`)
            res.statusCode = upstream.status
            res.end(body)
            return
          }

          // Route: POST /api/hotels/search
          if (req.method === 'POST' && url.pathname === '/api/hotels/search') {
            const body = await readBody(req)
            console.log(`[${ts}] → POST /api/hotels/search`)
            console.log(`[${ts}]   req: ${body.slice(0, 500)}`)
            const upstream = await fetch(`${EASYGDS_BASE}/api/v2/products/hotels/availabilities`, {
              method: 'POST', headers, body,
            })
            const text = await upstream.text()
            console.log(`[${ts}] ← POST /api/hotels/search ${upstream.status}`)
            if (!upstream.ok) console.error(`[${ts}]   body: ${text.slice(0, 500)}`)
            res.statusCode = upstream.status
            res.end(text)
            return
          }

          // Route: POST /api/hotels/rates
          if (req.method === 'POST' && url.pathname === '/api/hotels/rates') {
            const body = await readBody(req)
            console.log(`[${ts}] → POST /api/hotels/rates`)
            console.log(`[${ts}]   req: ${body.slice(0, 500)}`)
            const upstream = await fetch(`${EASYGDS_BASE}/api/v2/products/hotels/availabilities/rates`, {
              method: 'POST', headers, body,
            })
            const text = await upstream.text()
            console.log(`[${ts}] ← POST /api/hotels/rates ${upstream.status}`)
            if (!upstream.ok) console.error(`[${ts}]   body: ${text.slice(0, 500)}`)
            res.statusCode = upstream.status
            res.end(text)
            return
          }

          next()
        } catch (err: any) {
          console.error(`[${ts}] ✗ ${req.method} ${req.url} → ${err.message}`)
          res.statusCode = 500
          res.end(JSON.stringify({ error: { message: err.message } }))
        }
      })
    },
  }
}

function readBody(req: any): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = ''
    req.on('data', (chunk: any) => (data += chunk))
    req.on('end', () => resolve(data))
    req.on('error', reject)
  })
}

export default defineConfig({
  plugins: [preact(), tailwindcss(), devApiPlugin()],
})
