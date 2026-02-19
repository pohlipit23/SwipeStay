import { easygdsGet } from '../../lib/easygds/client'

export const onRequestGet: PagesFunction = async (context) => {
  const url = new URL(context.request.url)
  const searchText = url.searchParams.get('search_text')
  if (!searchText) {
    return new Response(JSON.stringify({ error: { message: 'search_text is required' } }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const params = new URLSearchParams()
  for (const [key, value] of url.searchParams) {
    params.set(key, value)
  }

  const data = await easygdsGet(`/api/places?${params.toString()}`, context.env)
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=86400' },
  })
}
