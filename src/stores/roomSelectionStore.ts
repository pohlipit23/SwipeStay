import { signal } from '@preact/signals'
import type { RoomSelection } from '../types'

// Maps hotel_id -> selected room/rate
export const selections = signal<Record<string, RoomSelection>>({})

export function selectRoom(selection: RoomSelection) {
  selections.value = { ...selections.value, [selection.hotel_id]: selection }
}

export function clearSelection(hotelId: string) {
  const next = { ...selections.value }
  delete next[hotelId]
  selections.value = next
}

export function getSelection(hotelId: string): RoomSelection | undefined {
  return selections.value[hotelId]
}

export function hasAnySelection(): boolean {
  return Object.keys(selections.value).length > 0
}
