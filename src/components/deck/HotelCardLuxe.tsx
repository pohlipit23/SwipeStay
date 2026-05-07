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

export function HotelCardLuxe({ hotel, onNext, onPrev }: HotelCardProps) {
  const [flipped, setFlipped] = useState(false)
  const [gestureHint, setGestureHint] = useState(true)

  const [{ x, rotateZ }, swipeApi] = useSpring(() => ({
    x: 0,
    rotateZ: 0,
    config: { tension: 280, friction: 35 }, // Slightly slower, more elegant spring
  }))

  const [{ rotateX }, flipApi] = useSpring(() => ({
    rotateX: 0,
    config: { tension: 280, friction: 35 },
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
          swipeApi.start({ x: mx, rotateZ: mx * 0.03 }) // Subtle rotation
        } else {
          if (Math.abs(mx) > 120 || vx > 0.5) {
            if (mx < 0) onNext()
            else onPrev()
          }
          swipeApi.start({ x: 0, rotateZ: 0 })
        }
      } else {
        if (down) {
          flipApi.start({ rotateX: my * 0.3 })
        } else {
          if (Math.abs(my) > 60 || vy > 0.3) {
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

  const imageUrl = hotel.images?.[0] || `https://placehold.co/400x500/C5A059/white?text=${encodeURIComponent(hotel.name.slice(0, 10))}`
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
        {/* Front Face - Luxe Editorial Style */}
        <div
          class="absolute inset-0 bg-white rounded-none shadow-luxe overflow-hidden border-[12px] border-white ring-1 ring-slate-100"
          style={{ backfaceVisibility: 'hidden' }}
        >
            {/* Image Area */}
            <div class="h-[75%] w-full relative overflow-hidden">
                <img
                    src={imageUrl}
                    alt={hotel.name}
                    class="w-full h-full object-cover filter brightness-95 contrast-105"
                    loading="lazy"
                />
                
                {/* Minimal top badges */}
                <div class="absolute top-4 left-4 flex gap-2">
                    {hotel.available_rooms && hotel.available_rooms <= 5 && (
                        <span class="px-2 py-1 bg-white/95 backdrop-blur-sm text-[10px] uppercase tracking-widest font-luxe-sans font-bold text-luxe-text border border-slate-200">
                            Rare Find
                        </span>
                    )}
                </div>

                {/* Rating Badge - Minimal */}
                 {hotel.star_rating && (
                    <div class="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-2 py-1 border border-slate-200 flex items-center gap-1">
                        <span class="font-luxe-serif font-bold text-luxe-text">{hotel.star_rating}</span>
                        <span class="text-[10px] uppercase tracking-widest text-luxe-gold">Star</span>
                    </div>
                 )}
            </div>

            {/* Content Area - Editorial Style */}
            <div class="h-[25%] flex flex-col justify-between pt-4 px-2 bg-white relative">
                
                <div class="text-center">
                    <h2 class="font-luxe-serif text-2xl text-luxe-text mb-1 leading-none">{hotel.name}</h2>
                    <p class="font-luxe-sans text-xs text-slate-500 uppercase tracking-widest">
                        {hotel.address?.city} — {hotel.address?.country}
                    </p>
                </div>

                <div class="flex items-center justify-between border-t border-slate-100 pt-3 pb-1">
                     <div class="font-luxe-serif italic text-slate-400 text-sm">
                        From <span class="not-italic font-luxe-sans font-bold text-luxe-text ml-1 text-lg">
                            {formatCurrency(hotel.lead_price?.per_night || hotel.lead_price?.amount || 0, hotel.lead_price?.currency)}
                        </span>
                     </div>
                     
                     {gestureHint && (
                        <div class="flex items-center gap-1 opacity-40">
                             <span class="text-[9px] uppercase tracking-widest font-luxe-sans text-slate-900">Details</span>
                             <span class="material-symbols-outlined text-[14px]">arrow_upward</span>
                        </div>
                     )}
                </div>
            </div>
        </div>

        {/* Back Face - Minimal Info */}
        <div
          class="absolute inset-0 bg-[#FAF9F6] rounded-none shadow-luxe overflow-hidden border-[12px] border-white ring-1 ring-slate-100 flex flex-col items-center justify-center p-8 text-center"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateX(180deg)' }}
        >
            <span class="material-symbols-outlined text-4xl text-luxe-gold mb-6 font-thin">location_on</span>
            
            <h3 class="font-luxe-serif text-3xl text-luxe-text mb-2">{hotel.name}</h3>
            
            <div class="w-12 h-[1px] bg-luxe-gold my-4"></div>
            
            <p class="font-luxe-sans text-sm text-slate-600 leading-relaxed mb-6">
                Located in the heart of {hotel.address?.city}, offering a bespoke experience for the discerning traveler.
            </p>

            <div class="flex gap-1 text-luxe-gold mb-8">
                {stars.map((filled, i) => (
                    <span key={i} class={`material-symbols-outlined text-sm ${filled ? 'filled-icon' : ''}`}>star</span>
                ))}
            </div>

            <div class="mt-auto w-full border-t border-luxe-gold/20 pt-6">
                 <p class="font-luxe-sans text-xs text-slate-400 uppercase tracking-widest mb-1">Nightly Rate</p>
                 <p class="font-luxe-serif text-3xl text-luxe-text">
                    {formatCurrency(hotel.lead_price?.per_night || hotel.lead_price?.amount || 0, hotel.lead_price?.currency)}
                 </p>
                 
                 <div class="mt-8 flex items-center justify-center gap-2 text-slate-400 animate-bounce">
                    <span class="material-symbols-outlined text-sm">arrow_downward</span>
                    <span class="text-[9px] uppercase tracking-widest font-luxe-sans">Return to Photo</span>
                 </div>
            </div>
        </div>
      </animated.div>
    </animated.div>
  )
}
