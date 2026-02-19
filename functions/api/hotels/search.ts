import { easygdsPost } from '../../../lib/easygds/client'

export const onRequestPost: PagesFunction = async (context) => {
  const body = await context.request.json()
  const data = await easygdsPost('/api/v2/products/hotels/availabilities', body, context.env)
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=300' },
  })
}
