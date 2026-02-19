import type { PlacesResponse } from '../types'

export async function searchPlaces(searchText: string): Promise<PlacesResponse> {
  const params = new URLSearchParams({
    search_text: searchText,
    types: 'country,airport,administrative_area_level_4,administrative_area_level_3,locality',
    language_code: 'en-US',
    property_included: 'false',
    per_page: '10',
    page: '1',
    with_properties: 'false',
  })
  const res = await fetch(`/api/places?${params}`)
  if (!res.ok) throw new Error(`Places search failed: ${res.status}`)
  return res.json()
}
