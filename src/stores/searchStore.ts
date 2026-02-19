import { signal } from '@preact/signals'
import type { Place, RoomOccupancy } from '../types'

export const destination = signal<Place | null>(null)
export const checkIn = signal('')
export const checkOut = signal('')
export const rooms = signal<RoomOccupancy[]>([{ adults: 2, children: [] }])
export const currency = signal('USD')
export const preferences = signal<string[]>([])
export const notes = signal('')

export function resetSearch() {
  destination.value = null
  checkIn.value = ''
  checkOut.value = ''
  rooms.value = [{ adults: 2, children: [] }]
  preferences.value = []
  notes.value = ''
}
