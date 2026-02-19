import { signal } from '@preact/signals'
import type { Room } from '../types'

// Maps hotel_id -> rooms[] (cached rates data)
export const ratesCache = signal<Record<string, Room[]>>({})
export const loadingRates = signal<Set<string>>(new Set())

export function setRates(hotelId: string, rooms: Room[]) {
  ratesCache.value = { ...ratesCache.value, [hotelId]: rooms }
  const next = new Set(loadingRates.value)
  next.delete(hotelId)
  loadingRates.value = next
}

export function setLoading(hotelId: string) {
  const next = new Set(loadingRates.value)
  next.add(hotelId)
  loadingRates.value = next
}

export function getRates(hotelId: string): Room[] | undefined {
  return ratesCache.value[hotelId]
}
