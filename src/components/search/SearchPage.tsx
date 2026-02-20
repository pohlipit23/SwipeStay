import { useState, useRef, useCallback, useEffect } from 'preact/hooks'
import { useLocation } from 'wouter-preact'
import { Header } from '../layout/Header'
import * as searchStore from '../../stores/searchStore'
import * as deckStore from '../../stores/deckStore'
import { searchPlaces } from '../../api/places'
import { searchHotels } from '../../api/hotels'
import { PREFERENCE_OPTIONS } from '../../lib/constants'
import { getDefaultDates, formatDate } from '../../lib/formatters'
import type { Place } from '../../types'

const STAR_OPTIONS = [3, 4, 5] as const
const GUEST_RATING_OPTIONS = [
  { label: '7+', value: 7 },
  { label: '8+', value: 8 },
  { label: '9+', value: 9 },
] as const
const PRICE_OPTIONS = [
  { label: 'Budget', value: 100, icon: 'savings' },
  { label: 'Mid-Range', value: 250, icon: 'account_balance_wallet' },
  { label: 'Luxury', value: 500, icon: 'diamond' },
] as const
const SORT_OPTIONS = [
  { label: 'Recommended', value: 'recommended' as const },
  { label: 'Price: Low', value: 'price_low' as const },
  { label: 'Price: High', value: 'price_high' as const },
  { label: 'Rating', value: 'rating' as const },
] as const

export function SearchPage() {
  const [, navigate] = useLocation()
  const [showAutocomplete, setShowAutocomplete] = useState(false)
  const [suggestions, setSuggestions] = useState<Place[]>([])
  const [searchText, setSearchText] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showGuestPicker, setShowGuestPicker] = useState(false)
  const debounceRef = useRef<any>(null)

  useEffect(() => {
    if (!searchStore.checkIn.value || !searchStore.checkOut.value) {
      const defaults = getDefaultDates()
      searchStore.checkIn.value = defaults.checkIn
      searchStore.checkOut.value = defaults.checkOut
    }
  }, [])

  const handleDestinationSearch = useCallback((text: string) => {
    setSearchText(text)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (text.length < 2) { setSuggestions([]); return }
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await searchPlaces(text)
        const places = [...(data.places || []), ...(data.properties || [])]
        setSuggestions(places.slice(0, 8))
      } catch { setSuggestions([]) }
    }, 300)
  }, [])

  const selectDestination = (place: Place) => {
    searchStore.destination.value = place
    setSearchText(place.name)
    setShowAutocomplete(false)
    setSuggestions([])
  }

  const togglePreference = (pref: string) => {
    const current = searchStore.preferences.value
    searchStore.preferences.value = current.includes(pref)
      ? current.filter(p => p !== pref)
      : [...current, pref]
  }

  const handleSearch = async () => {
    const dest = searchStore.destination.value
    if (!dest) return
    setIsSearching(true)
    deckStore.resetDeck()
    try {
      const data = await searchHotels({
        placeId: dest.id,
        checkIn: searchStore.checkIn.value,
        checkOut: searchStore.checkOut.value,
        rooms: searchStore.rooms.value,
        currency: searchStore.currency.value,
      })
      deckStore.searchId.value = data.search_id
      deckStore.hotels.value = data.hotels || []
      deckStore.hasMore.value = (data.hotels?.length || 0) >= 15
      navigate('/results')
    } catch (err: any) {
      deckStore.error.value = err.message
    } finally {
      setIsSearching(false)
    }
  }

  const adultsCount = searchStore.rooms.value.reduce((sum, r) => sum + r.adults, 0)
  const roomCount = searchStore.rooms.value.length

  return (
    <>
      <Header />
      <main class="flex-1 w-full px-5 flex flex-col overflow-y-auto pb-6 grid-bg">
        {/* Standard / AI toggle */}
        <div class="mb-4">
          <div class="glass-card p-1 rounded-2xl flex items-center">
            <button class="flex-1 py-2.5 px-4 pill-active rounded-[1.25rem] text-sm font-bold">
              Standard
            </button>
            <button
              onClick={() => navigate('/assistant')}
              class="flex-1 py-2.5 px-4 text-azure-700 text-sm font-semibold flex items-center justify-center gap-2 hover:text-cyan transition-colors"
            >
              <span class="material-symbols-outlined text-[18px]">auto_awesome</span>
              AI Assistant
            </button>
          </div>
        </div>

        <div class="flex flex-col gap-3">
          {/* ===== Destination ===== */}
          <div class="relative">
            <div
              onClick={() => setShowAutocomplete(true)}
              class="glass-card p-4 rounded-2xl flex items-center gap-3 cursor-pointer active:scale-[0.99] transition-transform"
            >
              <div class="size-10 rounded-xl bg-azure-500/10 flex items-center justify-center text-azure-600 shrink-0">
                <span class="material-symbols-outlined filled-icon">location_on</span>
              </div>
              <div class="flex flex-col min-w-0">
                <span class="text-[10px] font-bold text-azure-400 uppercase tracking-wider">Where to?</span>
                <span class="text-sm font-bold text-azure-900 truncate">
                  {searchStore.destination.value?.name || 'Destination or hotel'}
                </span>
              </div>
            </div>
            {showAutocomplete && (
              <div class="absolute top-0 left-0 right-0 z-50 bg-white rounded-2xl shadow-float border border-azure-200 p-4">
                <div class="flex items-center gap-3 mb-3">
                  <button onClick={() => { setShowAutocomplete(false); setSuggestions([]) }} class="text-slate-400 hover:text-slate-600 transition-colors">
                    <span class="material-symbols-outlined">close</span>
                  </button>
                  <input
                    type="text"
                    value={searchText}
                    onInput={(e) => handleDestinationSearch((e.target as HTMLInputElement).value)}
                    placeholder="Search city or hotel..."
                    class="flex-1 text-sm font-semibold text-azure-900 outline-none bg-transparent placeholder:text-azure-300"
                    autoFocus
                  />
                </div>
                {suggestions.length > 0 && (
                  <div class="flex flex-col divide-y divide-azure-100 max-h-56 overflow-y-auto">
                    {suggestions.map(place => (
                      <button
                        key={place.id}
                        onClick={() => selectDestination(place)}
                        class="flex items-center gap-3 py-2.5 text-left hover:bg-azure-50 rounded-lg px-2 transition-colors"
                      >
                        <span class="material-symbols-outlined text-azure-500 text-lg">
                          {place.type === 'property' ? 'hotel' : 'location_on'}
                        </span>
                        <div>
                          <div class="text-sm font-bold text-azure-900">{place.name}</div>
                          {place.long_name && place.long_name !== place.name && (
                            <div class="text-xs text-azure-400">{place.long_name}</div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ===== Dates & Guests — side by side ===== */}
          <div class="flex gap-3">
            <div class="flex-1 relative">
              <div
                onClick={() => setShowDatePicker(!showDatePicker)}
                class="glass-card p-4 rounded-2xl flex items-center gap-2.5 cursor-pointer active:scale-[0.99] transition-transform"
              >
                <div class="size-9 rounded-lg bg-azure-500/10 flex items-center justify-center text-azure-600 shrink-0">
                  <span class="material-symbols-outlined filled-icon text-lg">calendar_month</span>
                </div>
                <div class="flex flex-col min-w-0">
                  <span class="text-[10px] font-bold text-azure-400 uppercase tracking-wider">Dates</span>
                  <span class="text-xs font-bold text-azure-900 truncate">
                    {searchStore.checkIn.value
                      ? `${formatDate(searchStore.checkIn.value)} – ${formatDate(searchStore.checkOut.value)}`
                      : 'Select'}
                  </span>
                </div>
              </div>
              {showDatePicker && (
                <div class="absolute top-full mt-1 left-0 right-0 z-40 bg-white rounded-2xl shadow-float border border-azure-200 p-3 flex flex-col gap-2">
                  <label class="flex flex-col gap-1">
                    <span class="text-[10px] font-bold text-azure-500 uppercase">Check-in</span>
                    <input type="date" value={searchStore.checkIn.value} onInput={(e) => { searchStore.checkIn.value = (e.target as HTMLInputElement).value }} class="rounded-xl border border-azure-200 px-3 py-2 text-sm font-semibold text-azure-900" />
                  </label>
                  <label class="flex flex-col gap-1">
                    <span class="text-[10px] font-bold text-azure-500 uppercase">Check-out</span>
                    <input type="date" value={searchStore.checkOut.value} onInput={(e) => { searchStore.checkOut.value = (e.target as HTMLInputElement).value }} class="rounded-xl border border-azure-200 px-3 py-2 text-sm font-semibold text-azure-900" />
                  </label>
                  <button onClick={() => setShowDatePicker(false)} class="text-sm font-bold text-azure-500 mt-1 hover:text-cyan transition-colors">Done</button>
                </div>
              )}
            </div>

            <div class="flex-1 relative">
              <div
                onClick={() => setShowGuestPicker(!showGuestPicker)}
                class="glass-card p-4 rounded-2xl flex items-center gap-2.5 cursor-pointer active:scale-[0.99] transition-transform"
              >
                <div class="size-9 rounded-lg bg-azure-500/10 flex items-center justify-center text-azure-600 shrink-0">
                  <span class="material-symbols-outlined filled-icon text-lg">group</span>
                </div>
                <div class="flex flex-col min-w-0">
                  <span class="text-[10px] font-bold text-azure-400 uppercase tracking-wider">Guests</span>
                  <span class="text-xs font-bold text-azure-900">
                    {adultsCount} guest{adultsCount !== 1 ? 's' : ''}, {roomCount} rm
                  </span>
                </div>
              </div>
              {showGuestPicker && (
                <div class="absolute top-full mt-1 left-0 right-0 z-40 bg-white rounded-2xl shadow-float border border-azure-200 p-3">
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-sm font-bold text-azure-800">Adults</span>
                    <div class="flex items-center gap-3">
                      <button onClick={() => { const r = [...searchStore.rooms.value]; if (r[0].adults > 1) { r[0] = { ...r[0], adults: r[0].adults - 1 }; searchStore.rooms.value = r } }} class="size-7 rounded-full pill-inactive flex items-center justify-center text-sm text-azure-700">−</button>
                      <span class="text-sm font-bold w-5 text-center text-azure-900">{searchStore.rooms.value[0].adults}</span>
                      <button onClick={() => { const r = [...searchStore.rooms.value]; r[0] = { ...r[0], adults: r[0].adults + 1 }; searchStore.rooms.value = r }} class="size-7 rounded-full pill-inactive flex items-center justify-center text-sm text-azure-700">+</button>
                    </div>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-sm font-bold text-azure-800">Rooms</span>
                    <div class="flex items-center gap-3">
                      <button onClick={() => { if (searchStore.rooms.value.length > 1) searchStore.rooms.value = searchStore.rooms.value.slice(0, -1) }} class="size-7 rounded-full pill-inactive flex items-center justify-center text-sm text-azure-700">−</button>
                      <span class="text-sm font-bold w-5 text-center text-azure-900">{searchStore.rooms.value.length}</span>
                      <button onClick={() => { searchStore.rooms.value = [...searchStore.rooms.value, { adults: 2, children: [] }] }} class="size-7 rounded-full pill-inactive flex items-center justify-center text-sm text-azure-700">+</button>
                    </div>
                  </div>
                  <button onClick={() => setShowGuestPicker(false)} class="text-sm font-bold text-azure-500 mt-2 hover:text-cyan transition-colors">Done</button>
                </div>
              )}
            </div>
          </div>

          {/* ===== Star Rating ===== */}
          <div class="glass-card p-4 rounded-2xl">
            <div class="flex items-center justify-between mb-2.5">
              <span class="text-[10px] font-bold text-azure-400 uppercase tracking-wider">Star Rating</span>
              {searchStore.minStars.value > 0 && (
                <button onClick={() => { searchStore.minStars.value = 0 }} class="text-[10px] font-bold text-cyan hover:text-azure-500 transition-colors">Clear</button>
              )}
            </div>
            <div class="flex gap-2">
              {STAR_OPTIONS.map(stars => {
                const active = searchStore.minStars.value === stars
                return (
                  <button key={stars} onClick={() => { searchStore.minStars.value = active ? 0 : stars }}
                    class={`flex-1 flex items-center justify-center gap-1 py-2.5 rounded-xl text-xs font-bold ${active ? 'pill-active' : 'pill-inactive text-azure-700'}`}
                  >
                    {stars}
                    <span class="material-symbols-outlined text-[14px] filled-icon text-yellow-400">star</span>
                    <span class="text-[10px] font-medium opacity-60">+</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* ===== Guest Rating & Price Range ===== */}
          <div class="flex gap-3">
            <div class="flex-1 glass-card p-4 rounded-2xl">
              <span class="text-[10px] font-bold text-azure-400 uppercase tracking-wider block mb-2.5">Guest Rating</span>
              <div class="flex gap-1.5">
                {GUEST_RATING_OPTIONS.map(opt => {
                  const active = searchStore.minGuestRating.value === opt.value
                  return (
                    <button key={opt.value} onClick={() => { searchStore.minGuestRating.value = active ? 0 : opt.value }}
                      class={`flex-1 py-2 rounded-lg text-xs font-bold ${active ? 'pill-active' : 'pill-inactive text-azure-700'}`}
                    >{opt.label}</button>
                  )
                })}
              </div>
            </div>
            <div class="flex-1 glass-card p-4 rounded-2xl">
              <span class="text-[10px] font-bold text-azure-400 uppercase tracking-wider block mb-2.5">Price Range</span>
              <div class="flex gap-1.5">
                {PRICE_OPTIONS.map(opt => {
                  const active = searchStore.maxPrice.value === opt.value
                  return (
                    <button key={opt.label} onClick={() => { searchStore.maxPrice.value = active ? 0 : opt.value }}
                      class={`flex-1 py-2 rounded-lg text-[10px] font-bold flex flex-col items-center gap-0.5 ${active ? 'pill-active' : 'pill-inactive text-azure-700'}`}
                    >
                      <span class="material-symbols-outlined text-[16px]">{opt.icon}</span>
                      {opt.label}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* ===== Sort ===== */}
          <div class="glass-card p-4 rounded-2xl">
            <span class="text-[10px] font-bold text-azure-400 uppercase tracking-wider block mb-2.5">Sort By</span>
            <div class="flex gap-2 overflow-x-auto no-scrollbar">
              {SORT_OPTIONS.map(opt => {
                const active = searchStore.sortBy.value === opt.value
                return (
                  <button key={opt.value} onClick={() => { searchStore.sortBy.value = opt.value }}
                    class={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 ${active ? 'pill-active' : 'pill-inactive text-azure-700'}`}
                  >{opt.label}</button>
                )
              })}
            </div>
          </div>

          {/* ===== Hotel Vibes ===== */}
          <div class="glass-card p-4 rounded-2xl">
            <span class="text-[10px] font-bold text-azure-400 uppercase tracking-wider block mb-2.5">Hotel Vibes</span>
            <div class="flex flex-wrap gap-2">
              {PREFERENCE_OPTIONS.map(pref => {
                const active = searchStore.preferences.value.includes(pref)
                return (
                  <button key={pref} onClick={() => togglePreference(pref)}
                    class={`px-3 py-2 rounded-xl text-xs font-bold active:scale-95 ${active ? 'pill-active' : 'pill-inactive text-azure-700'}`}
                  >{pref}</button>
                )
              })}
            </div>
          </div>

          {/* ===== Special Requests ===== */}
          <div class="glass-card p-4 rounded-2xl">
            <span class="text-[10px] font-bold text-azure-400 uppercase tracking-wider block mb-2">Special Requests</span>
            <input
              type="text"
              value={searchStore.notes.value}
              onInput={(e) => { searchStore.notes.value = (e.target as HTMLInputElement).value }}
              class="w-full bg-white/50 border border-azure-200 rounded-xl px-3 py-2.5 text-sm text-azure-900 placeholder:text-azure-300 outline-none focus:border-cyan focus:shadow-[0_0_8px_rgba(34,211,238,0.2)] transition-all"
              placeholder="Quiet room, high floor, late check-in..."
            />
          </div>
        </div>

        {/* ===== Search Button ===== */}
        <div class="mt-5 mb-2">
          <button
            onClick={handleSearch}
            disabled={!searchStore.destination.value || isSearching}
            class="w-full pill-active py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(14,165,233,0.3)] hover:shadow-[0_0_30px_rgba(14,165,233,0.5)] transition-shadow"
          >
            {isSearching ? (
              <span class="material-symbols-outlined animate-spin">progress_activity</span>
            ) : (
              <span class="material-symbols-outlined">search</span>
            )}
            {isSearching ? 'Searching...' : 'Search Hotels'}
          </button>
        </div>
      </main>
    </>
  )
}
