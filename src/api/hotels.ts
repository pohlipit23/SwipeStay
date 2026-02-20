import type { AvailabilityResponse, Hotel, RoomOccupancy } from '../types'

function normalizeHotel(raw: any, nights: number): Hotel {
  const price = raw.price_info || {}
  const total = price.total_amount || price.base_amount || 0
  const perNight = nights > 0 ? total / nights : total
  const currency = raw.currency_info?.conversion || raw.currency_info?.original || 'USD'

  // Parse address from street_address: "50 Campbell Ln, Singapore, 209922, SG"
  const parts = (raw.street_address || '').split(',').map((s: string) => s.trim())
  const countryCode = raw.location?.country_code || parts[parts.length - 1] || ''
  const city = parts.length >= 3 ? parts[parts.length - 3] : parts[1] || ''

  const avatar = raw.avatar || {}
  const images = [avatar.lg || avatar.md || avatar.sm].filter(Boolean)

  const ratings = raw.ratings || {}
  const expedia = ratings.expedia || {}

  return {
    hotel_id: raw.id || raw.hotel_id || '',
    name: raw.name || '',
    star_rating: raw.star || raw.star_rating || 0,
    lead_price: {
      amount: total,
      currency,
      per_night: perNight,
    },
    available_rooms: raw.available_rooms ?? 0,
    address: {
      street: parts[0] || '',
      city,
      country: countryCode,
    },
    coordinates: raw.location?.point?.coordinates
      ? { latitude: raw.location.point.coordinates[1], longitude: raw.location.point.coordinates[0] }
      : undefined,
    images,
    description: raw.description || undefined,
    amenities: raw.amenities || undefined,
    review_score: expedia.overall || ratings.liteapi?.overall || undefined,
    review_text: expedia.count ? `${expedia.count} reviews` : undefined,
  }
}

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
    place_id: params.placeId,
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
  const data = await res.json()

  // Calculate nights for per-night pricing
  const checkInDate = new Date(params.checkIn)
  const checkOutDate = new Date(params.checkOut)
  const nights = Math.max(1, Math.round((checkOutDate.getTime() - checkInDate.getTime()) / 86400000))

  return {
    search_id: data.search_id || '',
    hotels: (data.hotels || []).map((h: any) => normalizeHotel(h, nights)),
    total_results: data.total || data.hotels?.length || 0,
  }
}
