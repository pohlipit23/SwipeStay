import { signal, computed } from '@preact/signals'
import type { Hotel } from '../types'

export const hotels = signal<Hotel[]>([])
export const currentIndex = signal(0)
export const searchId = signal('')
export const isLoading = signal(false)
export const hasMore = signal(true)
export const error = signal<string | null>(null)
export const dismissedIds = signal<Set<string>>(new Set())

export const currentHotel = computed(() => {
  const validHotels = hotels.value.filter(h => !dismissedIds.value.has(h.hotel_id))
  const idx = currentIndex.value
  return validHotels[idx] ?? null
})

export const visibleHotels = computed(() => {
  return hotels.value.filter(h => !dismissedIds.value.has(h.hotel_id))
})

export const shouldPrefetch = computed(() => {
  const visible = visibleHotels.value
  return currentIndex.value >= visible.length - 5 && hasMore.value && !isLoading.value
})

export function dismissHotel(hotelId: string) {
  const newSet = new Set(dismissedIds.value)
  newSet.add(hotelId)
  dismissedIds.value = newSet
}

export function resetDeck() {
  hotels.value = []
  currentIndex.value = 0
  searchId.value = ''
  isLoading.value = false
  hasMore.value = true
  error.value = null
  dismissedIds.value = new Set()
}
