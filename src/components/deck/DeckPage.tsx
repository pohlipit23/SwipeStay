import { useEffect, useState } from 'preact/hooks'
import { useLocation } from 'wouter-preact'
import { Header } from '../layout/Header'
import { HotelCard } from './HotelCard'
import { ActionButtons } from './ActionButtons'
import * as deckStore from '../../stores/deckStore'
import * as shortlistStore from '../../stores/shortlistStore'
import { formatCurrency } from '../../lib/formatters'

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
      <>
        <Header showBack />
        <main class="flex-1 flex items-center justify-center">
          <div class="flex flex-col items-center gap-4">
            <span class="material-symbols-outlined text-5xl text-primary animate-spin">progress_activity</span>
            <p class="text-sm font-bold text-slate-500">Finding hotels...</p>
          </div>
        </main>
      </>
    )
  }

  if (error || hotels.length === 0) {
    return (
      <>
        <Header showBack />
        <main class="flex-1 flex items-center justify-center p-6">
          <div class="bg-white rounded-3xl p-8 shadow-sm text-center max-w-sm">
            <span class="material-symbols-outlined text-5xl text-slate-300 mb-4">hotel</span>
            <h2 class="text-xl font-bold text-slate-900 mb-2">No Hotels Found</h2>
            <p class="text-sm text-slate-500 mb-6">Try adjusting your destination or dates</p>
            <button onClick={() => navigate('/')} class="bg-primary text-white px-6 py-3 rounded-2xl font-bold text-sm">
              New Search
            </button>
          </div>
        </main>
      </>
    )
  }

  const hotel = hotels[idx]

  return (
    <>
      <Header
        showBack
        left={
          <span class="text-primary font-bold text-sm leading-tight w-24">
            {hotels.length} Hotel{hotels.length !== 1 ? 's' : ''} Found
          </span>
        }
        right={
          <button
            onClick={() => navigate('/')}
            class="flex items-center justify-center size-10 rounded-full bg-white/80 backdrop-blur-md text-primary shadow-sm"
          >
            <span class="material-symbols-outlined">tune</span>
          </button>
        }
      />
      <main class="flex-1 w-full flex flex-col items-center justify-center p-4 pb-0 relative overflow-hidden">
        {hotel && <HotelCard hotel={hotel} onNext={handleNext} onPrev={handlePrev} />}
      </main>
      <ActionButtons
        onDismiss={handleDismiss}
        onShortlist={handleShortlist}
        onCompare={() => navigate('/compare')}
        shortlistCount={shortlistCount}
        isShortlisted={hotel ? shortlistStore.isShortlisted(hotel.hotel_id) : false}
        isFull={shortlistStore.isFull.value}
      />
    </>
  )
}
