import { useState } from 'preact/hooks'
import { animated, useSpring } from '@react-spring/web'
import { useDrag } from '@use-gesture/react'
import type { Hotel } from '../../types'
import { formatCurrency, starArray } from '../../lib/formatters'

interface HotelCardProps {
    hotel: Hotel
    onNext: () => void
    onPrev: () => void
}

export function HotelCardNeo({ hotel, onNext, onPrev }: HotelCardProps) {
    const [flipped, setFlipped] = useState(false)
    const [gestureHint, setGestureHint] = useState(true)

    const [{ x, rotateZ }, swipeApi] = useSpring(() => ({
        x: 0,
        rotateZ: 0,
        config: { tension: 400, friction: 20 }, // Snappy, tech-like spring
    }))

    const [{ rotateX }, flipApi] = useSpring(() => ({
        rotateX: 0,
        config: { tension: 400, friction: 20 },
    }))

    const bind = useDrag(
        ({ down, movement: [mx, my], direction: [dx, dy], velocity: [vx, vy], first, cancel, memo }) => {
            if (first) {
                const axis = Math.abs(mx) > Math.abs(my) ? 'x' : 'y'
                return axis
            }
            const axis = memo || 'x'

            if (axis === 'x') {
                if (down) {
                    swipeApi.start({ x: mx, rotateZ: mx * 0.1 }) // Aggressive rotation
                } else {
                    if (Math.abs(mx) > 120 || vx > 0.6) {
                        if (mx < 0) onNext()
                        else onPrev()
                    }
                    swipeApi.start({ x: 0, rotateZ: 0 })
                }
            } else {
                if (down) {
                    flipApi.start({ rotateX: my * 0.4 })
                } else {
                    if (Math.abs(my) > 60 || vy > 0.4) {
                        const newFlipped = my < 0 ? true : false
                        setFlipped(newFlipped)
                        flipApi.start({ rotateX: newFlipped ? 180 : 0 })
                        setGestureHint(false)
                    } else {
                        flipApi.start({ rotateX: flipped ? 180 : 0 })
                    }
                }
            }
            return axis
        },
        { axis: undefined, filterTaps: true }
    )

    const imageUrl = hotel.images?.[0] || `https://placehold.co/400x500/000000/CCFF00?text=${encodeURIComponent(hotel.name.slice(0, 10))}`
    const stars = starArray(hotel.star_rating || 0)

    return (
        <animated.div
            {...bind()}
            style={{
                x,
                rotateZ,
                touchAction: 'none',
            }}
            class="relative w-full max-w-[340px] h-[580px] cursor-grab active:cursor-grabbing select-none"
        >
            <animated.div
                style={{
                    rotateX,
                    transformStyle: 'preserve-3d',
                }}
                class="w-full h-full relative"
            >
                {/* Front Face - Neo Tokyo Style */}
                <div
                    class="absolute inset-0 bg-neo-bg rounded-xl shadow-neo-glow overflow-hidden border border-neo-lime/50 ring-1 ring-neo-cyan/20"
                    style={{ backfaceVisibility: 'hidden' }}
                >
                    {/* Image with overlay */}
                    <div class="h-full w-full relative">
                        <img
                            src={imageUrl}
                            alt={hotel.name}
                            class="w-full h-full object-cover filter contrast-125 saturate-150"
                            loading="lazy"
                        />

                        {/* Tech overlays */}
                        <div class="absolute inset-0 bg-gradient-to-t from-neo-bg via-transparent to-neo-bg/40 pointer-events-none" />

                        {/* Top HUD */}
                        <div class="absolute top-0 left-0 right-0 p-4 flex justify-between items-start font-neo-mono text-[10px] text-neo-cyan uppercase tracking-widest">
                            <span class="bg-black/60 backdrop-blur border border-neo-cyan px-2 py-1">
                                ID: {hotel.hotel_id}
                            </span>
                            {hotel.star_rating && (
                                <span class="bg-black/60 backdrop-blur border border-neo-pink text-neo-pink px-2 py-1 font-bold">
                                    LVL {hotel.star_rating}
                                </span>
                            )}
                        </div>

                        {/* Bottom HUD */}
                        <div class="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-md border-t border-neo-lime p-5">
                            <div class="flex justify-between items-end mb-2">
                                <h2 class="font-neo-sans text-2xl text-white leading-none uppercase tracking-tight drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]">
                                    {hotel.name}
                                </h2>
                                <div class="text-right">
                                    <div class="font-neo-mono text-xl text-neo-lime font-bold shadow-neo-glow">
                                        {formatCurrency(hotel.lead_price?.per_night || hotel.lead_price?.amount || 0, hotel.lead_price?.currency)}
                                    </div>
                                </div>
                            </div>

                            <div class="flex justify-between items-center text-xs font-neo-mono text-slate-400">
                                <div class="flex items-center gap-1">
                                    <span class="material-symbols-outlined text-sm text-neo-cyan">radar</span>
                                    <span>{hotel.address?.city}</span>
                                </div>
                                {gestureHint && (
                                    <div class="animate-pulse text-neo-pink flex items-center gap-1">
                                        <span>INITIALIZE MAP</span>
                                        <span class="material-symbols-outlined text-sm">arrow_upward</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Back Face - Data Terminal */}
                <div
                    class="absolute inset-0 bg-neo-bg rounded-xl shadow-neo-glow overflow-hidden border border-neo-cyan ring-1 ring-white/10 flex flex-col p-6"
                    style={{ backfaceVisibility: 'hidden', transform: 'rotateX(180deg)' }}
                >
                    <div class="font-neo-mono text-neo-lime text-xs mb-6 border-b border-neo-lime/30 pb-2 flex justify-between">
                        <span>// LOCATION_DATA</span>
                        <span>STATUS: ACTIVE</span>
                    </div>

                    <div class="flex-1 flex flex-col items-center justify-center text-center">
                        <div class="size-24 rounded-full border-2 border-neo-cyan flex items-center justify-center relative mb-6">
                            <div class="absolute inset-0 border border-neo-pink rounded-full animate-ping opacity-20"></div>
                            <span class="material-symbols-outlined text-4xl text-neo-cyan">mode_of_travel</span>
                        </div>

                        <h3 class="font-neo-sans text-2xl text-white mb-2 uppercase">{hotel.name}</h3>
                        <p class="font-neo-mono text-xs text-neo-cyan/80 mb-6">{hotel.address?.city}, {hotel.address?.country}</p>


                        <div class="w-full bg-slate-900 border border-slate-700 p-4 font-neo-mono text-[10px] text-slate-300 text-left mb-6">
                            <p>> FETCHING SPECS...</p>
                            <p>> RATING: {hotel.star_rating} STARS</p>
                            <p>> ROOMS_AVAILABLE: {hotel.available_rooms ? 'YES' : 'UNKNOWN'}</p>
                            <p class="text-neo-lime">> PRICE_INDEX: OPTIMAL</p>
                        </div>
                    </div>

                    <div class="mt-auto border-t border-neo-cyan/30 pt-4 flex justify-between items-center">
                        <div class="font-neo-mono text-xs text-white">
                            PRICE: <span class="text-neo-lime text-lg">{formatCurrency(hotel.lead_price?.per_night || hotel.lead_price?.amount || 0, hotel.lead_price?.currency)}</span>
                        </div>
                        <div class="flex items-center gap-2 text-neo-cyan animate-pulse cursor-pointer">
                            <span class="material-symbols-outlined">arrow_downward</span>
                            <span class="font-neo-mono text-[10px]">BACK</span>
                        </div>
                    </div>
                </div>
            </animated.div>
        </animated.div>
    )
}
