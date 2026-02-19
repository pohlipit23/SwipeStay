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

export function SearchPage() {
  const [, navigate] = useLocation()
  const [showAutocomplete, setShowAutocomplete] = useState(false)
  const [suggestions, setSuggestions] = useState<Place[]>([])
  const [searchText, setSearchText] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showGuestPicker, setShowGuestPicker] = useState(false)
  const debounceRef = useRef<any>(null)

  // Set default dates if empty
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
      <main class="flex-1 w-full px-6 flex flex-col overflow-y-auto pb-6">
        {/* Standard / AI toggle */}
        <div class="mt-4 mb-8">
          <div class="bg-white/60 backdrop-blur-sm p-1.5 rounded-2xl flex items-center shadow-sm border border-slate-200/50">
            <button class="flex-1 py-3 px-4 bg-primary text-white rounded-[1.25rem] text-sm font-bold shadow-md transition-all">
              Standard
            </button>
            <button
              onClick={() => navigate('/assistant')}
              class="flex-1 py-3 px-4 text-slate-500 text-sm font-semibold flex items-center justify-center gap-2"
            >
              <span class="material-symbols-outlined text-[18px]">auto_awesome</span>
              AI Assistant
            </button>
          </div>
        </div>

        <div class="flex flex-col gap-4">
          {/* Destination */}
          <div class="relative">
            <div
              onClick={() => setShowAutocomplete(true)}
              class="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4 cursor-pointer active:scale-[0.99] transition-transform"
            >
              <div class="size-12 rounded-2xl bg-slate-50 flex items-center justify-center text-primary">
                <span class="material-symbols-outlined filled-icon">location_on</span>
              </div>
              <div class="flex flex-col">
                <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Where to?</span>
                <span class="text-base font-bold text-slate-900">
                  {searchStore.destination.value?.name || 'Destination or hotel'}
                </span>
              </div>
            </div>
            {showAutocomplete && (
              <div class="absolute top-0 left-0 right-0 z-50 bg-white rounded-3xl shadow-xl border border-slate-200 p-4">
                <div class="flex items-center gap-3 mb-3">
                  <button onClick={() => { setShowAutocomplete(false); setSuggestions([]) }} class="text-slate-400">
                    <span class="material-symbols-outlined">close</span>
                  </button>
                  <input
                    type="text"
                    value={searchText}
                    onInput={(e) => handleDestinationSearch((e.target as HTMLInputElement).value)}
                    placeholder="Search city or hotel..."
                    class="flex-1 text-base font-semibold text-slate-900 outline-none bg-transparent placeholder:text-slate-400"
                    autoFocus
                  />
                </div>
                {suggestions.length > 0 && (
                  <div class="flex flex-col divide-y divide-slate-100 max-h-60 overflow-y-auto">
                    {suggestions.map(place => (
                      <button
                        key={place.id}
                        onClick={() => selectDestination(place)}
                        class="flex items-center gap-3 py-3 text-left hover:bg-slate-50 rounded-lg px-2 transition-colors"
                      >
                        <span class="material-symbols-outlined text-primary text-xl">
                          {place.type === 'property' ? 'hotel' : 'location_on'}
                        </span>
                        <div>
                          <div class="text-sm font-bold text-slate-900">{place.name}</div>
                          {place.long_name && place.long_name !== place.name && (
                            <div class="text-xs text-slate-500">{place.long_name}</div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Dates */}
          <div class="relative">
            <div
              onClick={() => setShowDatePicker(!showDatePicker)}
              class="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4 cursor-pointer active:scale-[0.99] transition-transform"
            >
              <div class="size-12 rounded-2xl bg-slate-50 flex items-center justify-center text-primary">
                <span class="material-symbols-outlined filled-icon">calendar_month</span>
              </div>
              <div class="flex flex-col">
                <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Check-in & Check-out</span>
                <span class="text-base font-bold text-slate-900">
                  {searchStore.checkIn.value
                    ? `${formatDate(searchStore.checkIn.value)} – ${formatDate(searchStore.checkOut.value)}`
                    : 'Select dates'}
                </span>
              </div>
            </div>
            {showDatePicker && (
              <div class="mt-2 bg-white rounded-2xl shadow-lg border border-slate-100 p-4 flex flex-col gap-3">
                <label class="flex flex-col gap-1">
                  <span class="text-xs font-bold text-slate-500 uppercase">Check-in</span>
                  <input
                    type="date"
                    value={searchStore.checkIn.value}
                    onInput={(e) => { searchStore.checkIn.value = (e.target as HTMLInputElement).value }}
                    class="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold"
                  />
                </label>
                <label class="flex flex-col gap-1">
                  <span class="text-xs font-bold text-slate-500 uppercase">Check-out</span>
                  <input
                    type="date"
                    value={searchStore.checkOut.value}
                    onInput={(e) => { searchStore.checkOut.value = (e.target as HTMLInputElement).value }}
                    class="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold"
                  />
                </label>
                <button onClick={() => setShowDatePicker(false)} class="text-sm font-bold text-primary mt-1">Done</button>
              </div>
            )}
          </div>

          {/* Guests & Rooms */}
          <div class="relative">
            <div
              onClick={() => setShowGuestPicker(!showGuestPicker)}
              class="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4 cursor-pointer active:scale-[0.99] transition-transform"
            >
              <div class="size-12 rounded-2xl bg-slate-50 flex items-center justify-center text-primary">
                <span class="material-symbols-outlined filled-icon">group</span>
              </div>
              <div class="flex flex-col">
                <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Guests & Rooms</span>
                <span class="text-base font-bold text-slate-900">
                  {adultsCount} guest{adultsCount !== 1 ? 's' : ''}, {roomCount} room{roomCount !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
            {showGuestPicker && (
              <div class="mt-2 bg-white rounded-2xl shadow-lg border border-slate-100 p-4">
                <div class="flex items-center justify-between mb-3">
                  <span class="text-sm font-bold text-slate-700">Adults</span>
                  <div class="flex items-center gap-3">
                    <button
                      onClick={() => {
                        const r = [...searchStore.rooms.value]
                        if (r[0].adults > 1) { r[0] = { ...r[0], adults: r[0].adults - 1 }; searchStore.rooms.value = r }
                      }}
                      class="size-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 active:bg-slate-100"
                    >−</button>
                    <span class="text-sm font-bold w-6 text-center">{searchStore.rooms.value[0].adults}</span>
                    <button
                      onClick={() => {
                        const r = [...searchStore.rooms.value]
                        r[0] = { ...r[0], adults: r[0].adults + 1 }; searchStore.rooms.value = r
                      }}
                      class="size-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 active:bg-slate-100"
                    >+</button>
                  </div>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-sm font-bold text-slate-700">Rooms</span>
                  <div class="flex items-center gap-3">
                    <button
                      onClick={() => {
                        if (searchStore.rooms.value.length > 1) searchStore.rooms.value = searchStore.rooms.value.slice(0, -1)
                      }}
                      class="size-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 active:bg-slate-100"
                    >−</button>
                    <span class="text-sm font-bold w-6 text-center">{searchStore.rooms.value.length}</span>
                    <button
                      onClick={() => {
                        searchStore.rooms.value = [...searchStore.rooms.value, { adults: 2, children: [] }]
                      }}
                      class="size-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 active:bg-slate-100"
                    >+</button>
                  </div>
                </div>
                <button onClick={() => setShowGuestPicker(false)} class="text-sm font-bold text-primary mt-3">Done</button>
              </div>
            )}
          </div>

          {/* Preferences */}
          <div class="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col gap-4">
            <div class="flex items-center gap-4">
              <div class="size-12 rounded-2xl bg-slate-50 flex items-center justify-center text-primary shrink-0">
                <span class="material-symbols-outlined filled-icon">tune</span>
              </div>
              <div class="flex flex-col">
                <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Your Preferences</span>
                <span class="text-base font-bold text-slate-900">Tailor your experience</span>
              </div>
            </div>
            <div class="flex flex-wrap gap-2.5">
              {PREFERENCE_OPTIONS.map(pref => {
                const active = searchStore.preferences.value.includes(pref)
                return (
                  <button
                    key={pref}
                    onClick={() => togglePreference(pref)}
                    class={`px-3.5 py-2 rounded-full text-xs font-bold border transition-all active:scale-95 ${
                      active
                        ? 'bg-primary text-white shadow-md shadow-primary/20 border-primary'
                        : 'bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100'
                    }`}
                  >
                    {pref}
                  </button>
                )
              })}
            </div>
            <textarea
              value={searchStore.notes.value}
              onInput={(e) => { searchStore.notes.value = (e.target as HTMLTextAreaElement).value }}
              class="w-full bg-slate-50 rounded-2xl border-0 p-4 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-primary/10 resize-none leading-relaxed"
              placeholder="Anything else? (e.g. Quiet room, high floor...)"
              rows={3}
            />
          </div>
        </div>

        {/* Search Button */}
        <div class="mt-8">
          <button
            onClick={handleSearch}
            disabled={!searchStore.destination.value || isSearching}
            class="w-full bg-primary py-5 rounded-[2rem] text-white font-bold text-lg shadow-xl shadow-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSearching ? (
              <span class="material-symbols-outlined animate-spin">progress_activity</span>
            ) : (
              <span class="material-symbols-outlined">search</span>
            )}
            {isSearching ? 'Searching...' : 'Search Hotels'}
          </button>
        </div>

        {/* Discover Nearby */}
        <div class="mt-auto mb-10 text-center pt-8">
          <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Or Discover Nearby</p>
          <div class="relative h-20 w-full rounded-2xl overflow-hidden grayscale opacity-40 border-2 border-dashed border-slate-300">
            <div class="absolute inset-0 flex items-center justify-center">
              <span class="material-symbols-outlined text-slate-400">explore</span>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
