import { useEffect } from 'preact/hooks'
import { useLocation } from 'wouter-preact'
import { HotelCardNeo } from './HotelCardNeo'
import * as deckStore from '../../stores/deckStore'
import * as shortlistStore from '../../stores/shortlistStore'
import { formatCurrency } from '../../lib/formatters'

export function DeckPageNeo() {
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

    const hotel = hotels[idx]
    const isShortlisted = hotel ? shortlistStore.isShortlisted(hotel.hotel_id) : false
    const isFull = shortlistStore.isFull.value

    if (loading) {
        return (
            <main class="h-full w-full flex items-center justify-center bg-neo-bg text-neo-lime font-neo-mono">
                <div class="animate-pulse">
                    [SYSTEM]: INITIATING SCAN...
                </div>
            </main>
        )
    }

    if (error || hotels.length === 0) {
        return (
            <main class="h-full w-full flex items-center justify-center bg-neo-bg text-neo-pink font-neo-mono p-8">
                <div class="border border-neo-pink/50 bg-black/50 p-6 backdrop-blur w-full max-w-sm">
                    <h2 class="text-xl mb-4 text-center">ERROR: NO_RESULTS</h2>
                    <button onClick={() => navigate('/')} class="w-full bg-neo-pink/20 border border-neo-pink text-neo-pink py-3 hover:bg-neo-pink hover:text-black transition-colors">
                        REBOOT SEARCH
                    </button>
                </div>
            </main>
        )
    }

    return (
        <div class="h-full w-full flex flex-col bg-neo-bg text-white font-neo-mono overflow-hidden">

            {/* Header - Tech/Cyber */}
            <header class="h-16 shrink-0 flex items-center justify-between px-6 border-b border-white/10 bg-black/40 backdrop-blur z-20">
                <div class="flex items-center gap-2">
                    <div class="size-3 bg-neo-lime rounded-full animate-pulse shadow-[0_0_10px_#CCFF00]"></div>
                    <h1 class="font-neo-sans text-xl tracking-wider text-white">NEO_SWIPE</h1>
                </div>

                <button
                    onClick={() => navigate('/')}
                    class="size-10 flex items-center justify-center border border-white/20 hover:border-neo-pink text-white/50 hover:text-neo-pink hover:bg-neo-pink/10 transition-colors skew-x-[-10deg]"
                >
                    <span class="material-symbols-outlined text-lg skew-x-[10deg]">settings_power</span>
                </button>
            </header>

            {/* Main Deck */}
            <main class="flex-1 w-full flex flex-col items-center justify-center p-4 relative z-10">

                {/* Background Details */}
                <div class="absolute inset-0 pointer-events-none opacity-20">
                    <div class="absolute top-1/4 left-0 w-full h-[1px] bg-neo-cyan"></div>
                    <div class="absolute bottom-1/4 left-0 w-full h-[1px] bg-neo-pink"></div>
                    <div class="absolute left-1/4 top-0 w-[1px] h-full bg-neo-lime"></div>
                    <div class="absolute right-1/4 top-0 w-[1px] h-full bg-white"></div>
                </div>

                {hotel && <HotelCardNeo hotel={hotel} onNext={handleNext} onPrev={handlePrev} />}
            </main>

            {/* Control Panel Footer */}
            <footer class="h-28 shrink-0 flex items-center justify-center gap-8 pb-4 relative z-20 bg-gradient-to-t from-black via-black/80 to-transparent">

                {/* Discard */}
                <button
                    onClick={handleDismiss}
                    class="group w-20 h-20 flex flex-col items-center justify-center relative clip-path-polygon-[20%_0%,_100%_0%,_80%_100%,_0%_100%]"
                >
                    <div class="absolute inset-0 bg-white/5 border border-white/20 skew-x-[-12deg] group-hover:bg-neo-pink/20 group-hover:border-neo-pink transition-all"></div>
                    <div class="relative z-10 flex flex-col items-center gap-1 group-hover:scale-110 transiiton-transform text-white/60 group-hover:text-neo-pink">
                        <span class="material-symbols-outlined text-3xl">close</span>
                        <span class="text-[8px] font-bold">DISCARD</span>
                    </div>
                </button>

                {/* Accept */}
                <button
                    onClick={handleShortlist}
                    disabled={isShortlisted || isFull}
                    class="group w-24 h-24 flex flex-col items-center justify-center relative disabled:opacity-30"
                >
                    <div class={`absolute inset-0 border skew-x-[-12deg] transition-all duration-300 ${isShortlisted ? 'bg-neo-lime/20 border-neo-lime shadow-[0_0_20px_#CCFF00]' : 'bg-white/5 border-white/20 group-hover:bg-neo-lime/20 group-hover:border-neo-lime'}`}></div>
                    <div class={`relative z-10 flex flex-col items-center gap-1 group-hover:scale-110 transiiton-transform ${isShortlisted ? 'text-neo-lime' : 'text-white/60 group-hover:text-neo-lime'}`}>
                        <span class={`material-symbols-outlined text-4xl ${isShortlisted ? 'filled-icon' : ''}`}>favorite</span>
                        <span class="text-[9px] font-bold">ACQUIRE</span>
                    </div>
                </button>

                {/* List */}
                <button
                    onClick={() => navigate('/compare')}
                    disabled={shortlistCount === 0}
                    class="group w-20 h-20 flex flex-col items-center justify-center relative disabled:opacity-30"
                >
                    <div class="absolute inset-0 bg-white/5 border border-white/20 skew-x-[-12deg] group-hover:bg-neo-cyan/20 group-hover:border-neo-cyan transition-all"></div>
                    <div class="relative z-10 flex flex-col items-center gap-1 group-hover:scale-110 transiiton-transform text-white/60 group-hover:text-neo-cyan">
                        <span class="material-symbols-outlined text-3xl">list</span>
                        <span class="text-[8px] font-bold">List: {shortlistCount}</span>
                    </div>
                </button>

            </footer>
        </div>
    )
}
