import type { RatesResponse, Room, Rate } from '../types'
import * as searchStore from '../stores/searchStore'

function normalizeRate(raw: any, nights: number): Rate {
  const price = raw.price_info || {}
  const currency = raw.currency_info?.conversion || raw.currency_info?.original || 'USD'
  const total = price.total_amount || price.base_amount || 0
  const perNight = nights > 0 ? total / nights : total

  return {
    rate_id: raw.id || '',
    rate_name: raw.board_basis || raw.name || 'Standard',
    board_type: raw.board_basis || 'room_only',
    pricing: {
      total,
      currency,
      per_night: perNight,
      taxes_included: (price.tax_amount || 0) > 0,
      breakdown: {
        base_rate: price.base_amount || 0,
        taxes: price.tax_amount || 0,
        fees: price.vat_amount || 0,
        discounts: 0,
      },
    },
    cancellation_policy: {
      refundable: raw.free_cancellation ?? false,
      free_cancellation_until: raw.cancellation_deadline || undefined,
      description: raw.free_cancellation ? 'Free cancellation available' : 'Non-refundable',
    },
    available_rooms: raw.available_rooms || undefined,
  }
}

function normalizeRoom(raw: any, nights: number): Room {
  return {
    room_id: raw.id || raw.room_type_id || '',
    room_name: raw.name || 'Room',
    rates: (raw.rates || []).map((r: any) => normalizeRate(r, nights)),
  }
}

export async function getHotelRates(searchId: string, hotelId: string): Promise<RatesResponse> {
  const res = await fetch('/api/hotels/rates', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ search_id: searchId, hotel_id: hotelId }),
  })
  if (!res.ok) throw new Error(`Rates fetch failed: ${res.status}`)
  const data = await res.json()

  // Calculate nights for per-night pricing
  const checkIn = searchStore.checkIn.value
  const checkOut = searchStore.checkOut.value
  const nights = checkIn && checkOut
    ? Math.max(1, Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000))
    : 1

  return {
    search_id: data.search_id || searchId,
    hotel: data.hotel || { hotel_id: hotelId, name: '', star_rating: 0, lead_price: { amount: 0, currency: 'USD', per_night: 0 }, available_rooms: 0, address: { city: '', country: '' } },
    rooms: (data.rooms || []).map((r: any) => normalizeRoom(r, nights)),
  }
}
