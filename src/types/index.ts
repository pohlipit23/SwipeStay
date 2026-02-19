// Place from Places API
export interface Place {
  id: string
  name: string
  long_name?: string
  type: string
  country_code?: string
  coordinates?: { latitude: number; longitude: number }
  // Legacy / normalised shape
  parent?: { id: string; name: string; type: string }
  // Actual easyGDS shape
  ancestors?: { id: string; type: string; code?: string | null }[]
  location?: { country_code?: string; point?: { coordinates: [number, number] } }
}

// Hotel from availability search
export interface Hotel {
  hotel_id: string
  name: string
  star_rating: number
  lead_price: {
    amount: number
    currency: string
    per_night: number
  }
  available_rooms: number
  address: {
    street?: string
    city: string
    country: string
  }
  coordinates?: { latitude: number; longitude: number }
  images?: string[]
  description?: string
  amenities?: string[]
  review_score?: number
  review_text?: string
}

// Room from rates API
export interface Room {
  room_id: string
  room_name: string
  description?: string
  max_occupancy?: { adults: number; children: number; total: number }
  bed_types?: { type: string; quantity: number }[]
  room_size?: { value: number; unit: string }
  amenities?: string[]
  images?: string[]
  rates: Rate[]
}

// Rate within a room
export interface Rate {
  rate_id: string
  rate_name: string
  board_type: string
  pricing: {
    total: number
    currency: string
    per_night: number
    taxes_included: boolean
    breakdown?: {
      base_rate: number
      taxes: number
      fees: number
      discounts: number
    }
    nightly_rates?: { date: string; rate: number }[]
  }
  cancellation_policy?: {
    refundable: boolean
    free_cancellation_until?: string
    penalties?: {
      from: string
      to: string
      amount: number
      percentage: number
      nights: number
    }[]
    description?: string
  }
  payment_options?: {
    pay_now: boolean
    pay_later: boolean
    deposit_required?: boolean
    deposit_amount?: number
  }
  inclusions?: string[]
  restrictions?: {
    min_stay?: number
    max_stay?: number
    non_refundable?: boolean
  }
  available_rooms?: number
}

// Hotel with full rates data (after rates API call)
export interface HotelWithRates {
  hotel: Hotel
  rooms: Room[]
}

// Search criteria
export interface SearchCriteria {
  destination: Place | null
  checkIn: string
  checkOut: string
  rooms: RoomOccupancy[]
  currency: string
  preferences: string[]
  notes: string
}

export interface RoomOccupancy {
  adults: number
  children: number[]
}

// Room selection for a hotel
export interface RoomSelection {
  hotel_id: string
  room_id: string
  rate_id: string
  room_name: string
  rate_name: string
  board_type: string
  pricing: Rate['pricing']
}

// API responses
export interface PlacesResponse {
  places?: Place[]
  properties?: Place[]
  pagination?: { current_page: number; per_page: number; total: number; total_pages: number }
}

export interface AvailabilityResponse {
  search_id: string
  hotels: Hotel[]
  search_criteria?: {
    check_in: string
    check_out: string
    nights: number
    currency: string
  }
  total_results?: number
}

export interface RatesResponse {
  search_id: string
  hotel: Hotel
  rooms: Room[]
}
