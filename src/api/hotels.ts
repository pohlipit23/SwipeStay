import type { AvailabilityResponse, RoomOccupancy } from '../types'

export async function searchHotels(params: {
  placeId: string
  checkIn: string
  checkOut: string
  rooms: RoomOccupancy[]
  currency: string
}): Promise<AvailabilityResponse> {
  const body = {
    checkin_date: params.checkIn,
    checkout_date: params.checkOut,
    place_id: [params.placeId],
    rooms: params.rooms.map((r, idx) => ({
      idx: idx + 1,
      adults: Array(r.adults).fill(18),
      children: r.children,
      infants: [],
    })),
    currency_code: params.currency,
    language_code: 'en-US',
    timeout: 25000,
  }
  const res = await fetch('/api/hotels/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`Hotel search failed: ${res.status}`)
  return res.json()
}
