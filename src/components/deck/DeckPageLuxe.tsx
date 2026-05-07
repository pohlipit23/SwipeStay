import { useEffect, useState } from 'preact/hooks'
import { useLocation } from 'wouter-preact'
import { HotelCardLuxe } from './HotelCardLuxe'
import * as deckStore from '../../stores/deckStore'
import * as shortlistStore from '../../stores/shortlistStore'
import { formatCurrency } from '../../lib/formatters'

export function DeckPageLuxe() {
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
            <main class="h-full w-full flex items-center justify-center bg-[#FAF9F6]">
                <div class="flex flex-col items-center gap-4">
                    <span class="font-luxe-serif text-2xl text-luxe-text animate-pulse">Curating...</span>
                </div>
            </main>
        )
    }

    if (error || hotels.length === 0) {
        return (
            <main class="h-full w-full flex items-center justify-center bg-[#FAF9F6] p-8">
                <div class="text-center max-w-sm border border-luxe-gold/20 p-12 bg-white shadow-luxe">
                    <h2 class="font-luxe-serif text-3xl text-luxe-text mb-4">No Collection Found</h2>
                    <p class="font-luxe-sans text-sm text-slate-500 mb-8 uppercase tracking-widest leading-relaxed">Please refine your criteria to view our exclusive selection.</p>
                    <button onClick={() => navigate('/')} class="bg-luxe-text text-white px-8 py-4 font-luxe-sans text-xs uppercase tracking-[0.2em] hover:bg-luxe-gold transition-colors duration-500">
                        Return Home
                    </button>
                </div>
            </main>
        )
    }

    const hotel = hotels[idx]
    const isShortlisted = hotel ? shortlistStore.isShortlisted(hotel.hotel_id) : false
    const isFull = shortlistStore.isFull.value

    return (
        <div class="h-full w-full flex flex-col bg-[#FAF9F6] text-luxe-text font-luxe-sans">
            {/* Header - Minimal & Elegant */}
            <header class="h-20 shrink-0 flex items-center justify-between px-8 pt-4">
                <div class="flex flex-col">
                    <h1 class="font-luxe-serif text-2xl tracking-tight">SwipeStay</h1>
                    <span class="text-[10px] uppercase tracking-[0.25em] text-luxe-gold">Collection</span>
                </div>

                <button
                    onClick={() => navigate('/')}
                    class="size-10 flex items-center justify-center rounded-full border border-slate-200 hover:border-luxe-gold transition-colors text-slate-400 hover:text-luxe-gold"
                >
                    <span class="material-symbols-outlined font-thin">close</span>
                </button>
            </header>

            {/* Main Content Area */}
            <main class="flex-1 w-full flex flex-col items-center justify-center p-4 relative overflow-hidden">
                {hotel && <HotelCardLuxe hotel={hotel} onNext={handleNext} onPrev={handlePrev} />}
            </main>

            {/* Action Footer - Editorial Style */}
            <footer class="h-32 shrink-0 flex items-center justify-center gap-12 pb-6 px-8">

                {/* Pass / Dismiss */}
                <button
                    onClick={handleDismiss}
                    class="group flex flex-col items-center gap-3 opacity-60 hover:opacity-100 transition-opacity"
                    aria-label="Dismiss"
                >
                    <div class="size-14 rounded-full border border-slate-300 flex items-center justify-center group-hover:border-slate-800 transition-colors">
                        <span class="material-symbols-outlined text-2xl font-light">close</span>
                    </div>
                    <span class="text-[10px] uppercase tracking-[0.2em]">Pass</span>
                </button>

                {/* Shortlist / Keep */}
                <button
                    onClick={handleShortlist}
                    disabled={isShortlisted || isFull}
                    class="group flex flex-col items-center gap-3 transition-opacity disabled:opacity-30"
                    aria-label="Shortlist"
                >
                    <div class={`size-16 rounded-full border border-luxe-gold flex items-center justify-center transition-all duration-500 ${isShortlisted ? 'bg-luxe-gold text-white' : 'bg-transparent text-luxe-gold hover:bg-luxe-gold/10'}`}>
                        <span class={`material-symbols-outlined text-3xl font-light ${isShortlisted ? 'filled-icon' : ''}`}>
                            {isShortlisted ? 'check' : 'favorite'}
                        </span>
                    </div>
                    <span class="text-[10px] uppercase tracking-[0.2em] text-luxe-gold font-bold">Keep</span>
                </button>

                {/* Compare count (subtle) */}
                <button
                    onClick={() => navigate('/compare')}
                    disabled={shortlistCount === 0}
                    class="group flex flex-col items-center gap-3 opacity-60 hover:opacity-100 transition-opacity disabled:opacity-20"
                >
                    <div class="size-14 rounded-full border border-slate-300 flex items-center justify-center group-hover:border-slate-800 transition-colors relative">
                        <span class="material-symbols-outlined text-2xl font-light">view_list</span>
                        {shortlistCount > 0 && (
                            <span class="absolute -top-1 -right-1 size-5 bg-luxe-gold text-white text-[10px] flex items-center justify-center rounded-full font-serif">
                                {shortlistCount}
                            </span>
                        )}
                    </div>
                    <span class="text-[10px] uppercase tracking-[0.2em]">List</span>
                </button>

            </footer>
        </div>
    )
}
