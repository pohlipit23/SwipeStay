import { useEffect } from 'preact/hooks'
import { useLocation } from 'wouter-preact'
import { Header } from '../layout/Header'
import { HotelCard } from './HotelCard'
import { ActionButtons } from './ActionButtons'
import * as deckStore from '../../stores/deckStore'
import * as shortlistStore from '../../stores/shortlistStore'

export function DeckPage() {
  const [, navigate] = useLocation()
  const hotels = deckStore.visibleHotels.value
  const idx = deckStore.currentIndex.value
  const loading = deckStore.isLoading.value
  const error = deckStore.error.value
  const shortlistCount = shortlistStore.shortlist.value.length

  useEffect(() => {
    if (hotels.length === 0 && !loading && !error) {
      navigate('/')
    }
  }, [hotels.length, loading, error])

  const handleDismiss = () => {
    const hotel = hotels[idx]
    if (!hotel) return
    deckStore.dismissHotel(hotel.hotel_id)
  }

  const handleShortlist = () => {
    const hotel = hotels[idx]
    if (!hotel) return
    shortlistStore.addToShortlist(hotel)
    deckStore.currentIndex.value = Math.min(idx + 1, hotels.length - 1)
  }

  const handleNext = () => {
    if (idx < hotels.length - 1) {
      deckStore.currentIndex.value = idx + 1
    }
  }

  const handlePrev = () => {
    if (idx > 0) {
      deckStore.currentIndex.value = idx - 1
    }
  }

  if (loading) {
    return (
      <div class="relative w-full h-full bg-gradient-to-b from-white to-azure-100 grid-bg flex items-center justify-center">
        <div class="flex flex-col items-center gap-4">
          <span class="material-symbols-outlined text-5xl text-azure-500 animate-spin">progress_activity</span>
          <p class="text-sm font-bold text-azure-700">Finding hotels...</p>
        </div>
      </div>
    )
  }

  if (error || hotels.length === 0) {
    return (
      <div class="relative w-full h-full bg-gradient-to-b from-white to-azure-100 grid-bg flex items-center justify-center p-6">
        <div class="glass-card rounded-3xl p-8 text-center max-w-sm">
          <span class="material-symbols-outlined text-5xl text-azure-300 mb-4">hotel</span>
          <h2 class="text-xl font-bold text-azure-900 mb-2">No Hotels Found</h2>
          <p class="text-sm text-slate-500 mb-6">Try adjusting your destination or dates</p>
          <button onClick={() => navigate('/')} class="pill-active px-6 py-3 rounded-2xl font-bold text-sm">
            New Search
          </button>
        </div>
      </div>
    )
  }

  const hotel = hotels[idx]

  return (
    <div class="relative w-full h-full bg-gradient-to-b from-white to-azure-100 grid-bg flex flex-col overflow-hidden">
      {/* Header */}
      <Header
        showBack
        right={
          <button
            onClick={() => navigate('/')}
            class="flex items-center justify-center size-10 rounded-xl bg-white/60 hover:bg-white/90 backdrop-blur-md border border-azure-200 shadow-sm text-azure-600 hover:text-cyan transition-all duration-300 active:scale-95"
          >
            <span class="material-symbols-outlined text-xl">tune</span>
          </button>
        }
      />

      {/* Card area */}
      <main class="flex-1 px-4 pb-0 flex flex-col relative overflow-hidden">
        {hotel && <HotelCard key={hotel.hotel_id} hotel={hotel} onNext={handleNext} onPrev={handlePrev} />}
      </main>

      {/* Action buttons */}
      <ActionButtons
        onDismiss={handleDismiss}
        onShortlist={handleShortlist}
        onCompare={() => navigate('/compare')}
        shortlistCount={shortlistCount}
        isShortlisted={hotel ? shortlistStore.isShortlisted(hotel.hotel_id) : false}
        isFull={shortlistStore.isFull.value}
      />
    </div>
  )
}
