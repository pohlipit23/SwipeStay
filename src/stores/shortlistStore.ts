import { signal, effect } from '@preact/signals'
import type { Hotel } from '../types'

const MAX_SHORTLIST = 10

const stored = typeof window !== 'undefined' ? localStorage.getItem('swipestay_shortlist') : null
const initial: Hotel[] = stored ? JSON.parse(stored) : []

export const shortlist = signal<Hotel[]>(initial)
export const isFull = signal(initial.length >= MAX_SHORTLIST)

effect(() => {
  localStorage.setItem('swipestay_shortlist', JSON.stringify(shortlist.value))
  isFull.value = shortlist.value.length >= MAX_SHORTLIST
})

export function addToShortlist(hotel: Hotel): boolean {
  if (shortlist.value.length >= MAX_SHORTLIST) return false
  if (shortlist.value.some(h => h.hotel_id === hotel.hotel_id)) return false
  shortlist.value = [...shortlist.value, hotel]
  return true
}

export function removeFromShortlist(hotelId: string) {
  shortlist.value = shortlist.value.filter(h => h.hotel_id !== hotelId)
}

export function clearShortlist() {
  shortlist.value = []
}

export function isShortlisted(hotelId: string): boolean {
  return shortlist.value.some(h => h.hotel_id === hotelId)
}
