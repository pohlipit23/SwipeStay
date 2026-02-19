export const onRequest: PagesFunction[] = [
  async (context) => {
    try {
      const response = await context.next()
      response.headers.set('Access-Control-Allow-Origin', '*')
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type')
      if (context.request.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: response.headers })
      }
      return response
    } catch (err: any) {
      return new Response(JSON.stringify({ error: { message: err.message || 'Internal error' } }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  },
]
