import type { RatesResponse } from '../types'

export async function getHotelRates(searchId: string, hotelId: string): Promise<RatesResponse> {
  const res = await fetch('/api/hotels/rates', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ search_id: searchId, hotel_id: hotelId }),
  })
  if (!res.ok) throw new Error(`Rates fetch failed: ${res.status}`)
  return res.json()
}
