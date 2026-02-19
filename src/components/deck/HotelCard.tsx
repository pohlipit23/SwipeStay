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

export function HotelCard({ hotel, onNext, onPrev }: HotelCardProps) {
  const [flipped, setFlipped] = useState(false)
  const [gestureHint, setGestureHint] = useState(true)

  const [{ x, rotateZ }, swipeApi] = useSpring(() => ({
    x: 0,
    rotateZ: 0,
    config: { tension: 300, friction: 30 },
  }))

  const [{ rotateX }, flipApi] = useSpring(() => ({
    rotateX: 0,
    config: { tension: 300, friction: 30 },
  }))

  const bind = useDrag(
    ({ down, movement: [mx, my], direction: [dx, dy], velocity: [vx, vy], first, cancel, memo }) => {
      // Determine axis lock on first movement
      if (first) {
        const axis = Math.abs(mx) > Math.abs(my) ? 'x' : 'y'
        return axis
      }
      const axis = memo || 'x'

      if (axis === 'x') {
        // Horizontal: browse cards
        if (down) {
          swipeApi.start({ x: mx, rotateZ: mx * 0.05 })
        } else {
          if (Math.abs(mx) > 120 || vx > 0.5) {
            if (mx < 0) onNext()
            else onPrev()
          }
          swipeApi.start({ x: 0, rotateZ: 0 })
        }
      } else {
        // Vertical: flip card
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

  const imageUrl = hotel.images?.[0] || `https://placehold.co/400x500/203C94/white?text=${encodeURIComponent(hotel.name.slice(0, 10))}`
  const stars = starArray(hotel.star_rating || 0)

  return (
    <animated.div
      {...bind()}
      style={{
        x,
        rotateZ,
        touchAction: 'none',
      }}
      class="relative w-full max-w-[360px] h-full max-h-[540px] cursor-grab active:cursor-grabbing select-none"
    >
      <animated.div
        style={{
          rotateX,
          transformStyle: 'preserve-3d',
        }}
        class="w-full h-full relative"
      >
        {/* Image Face (Front) */}
        <div
          class="absolute inset-0 bg-white rounded-[2.5rem] shadow-card overflow-hidden ring-1 ring-primary/5"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div class="h-[88%] w-full relative">
            <img
              src={imageUrl}
              alt={hotel.name}
              class="w-full h-full object-cover"
              loading="lazy"
            />
            <div class="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
            {/* Badges */}
            <div class="absolute top-5 left-5 flex gap-2">
              {hotel.available_rooms && hotel.available_rooms <= 5 && (
                <span class="px-3 py-1.5 bg-white/90 backdrop-blur-md rounded-full text-xs font-bold text-primary shadow-sm border border-white/20">
                  Rare Find
                </span>
              )}
              {hotel.star_rating && (
                <span class="px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-full text-xs font-medium text-white flex items-center gap-1 border border-white/10">
                  <span class="material-symbols-outlined text-[14px] filled-icon text-yellow-400">star</span>
                  {hotel.star_rating}
                </span>
              )}
            </div>
            {/* Bottom overlay */}
            <div class="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-24">
              <div class="flex justify-between items-end">
                <div class="flex-1 pr-4">
                  <h2 class="text-2xl font-bold text-white leading-tight mb-2 drop-shadow-md">{hotel.name}</h2>
                  <div class="flex items-center gap-1.5 text-white/90 text-sm font-medium">
                    <span class="material-symbols-outlined text-[16px] text-white/80">location_on</span>
                    <span>{hotel.address?.city}, {hotel.address?.country}</span>
                  </div>
                </div>
                <div class="bg-primary text-white px-4 py-2 rounded-full font-bold text-base shadow-lg shrink-0">
                  {formatCurrency(hotel.lead_price?.per_night || hotel.lead_price?.amount || 0, hotel.lead_price?.currency)}
                </div>
              </div>
            </div>
          </div>
          {/* Map peek strip */}
          <div class="h-[12%] w-full relative bg-slate-50 overflow-hidden border-t border-white/10">
            <div class="absolute inset-0 bg-slate-200/50" />
            <div class="absolute inset-0 flex flex-col items-center justify-center gap-1">
              <div class="w-10 h-1 bg-slate-400/50 rounded-full absolute top-3" />
              {gestureHint && (
                <div class="flex flex-col items-center mt-2 animate-pulse">
                  <span class="material-symbols-outlined text-primary text-[20px]">keyboard_arrow_up</span>
                  <span class="text-[10px] font-bold uppercase tracking-widest text-primary">Swipe for Map</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Map Face (Back) */}
        <div
          class="absolute inset-0 bg-white rounded-[2.5rem] shadow-card overflow-hidden ring-1 ring-primary/5"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateX(180deg)' }}
        >
          <div class="w-full h-full relative bg-[#E5E3DF] flex items-center justify-center">
            <div class="text-center">
              <span class="material-symbols-outlined text-6xl text-primary filled-icon drop-shadow-xl">location_on</span>
              <div class="bg-white rounded-xl px-4 py-2.5 shadow-lg mt-2 border border-primary/10">
                <h3 class="font-bold text-sm text-slate-900">{hotel.name}</h3>
                <div class="flex items-center justify-center gap-1.5 mt-1">
                  <div class="flex text-yellow-400">
                    {stars.map((filled, i) => (
                      <span key={i} class={`material-symbols-outlined text-[12px] ${filled ? 'filled-icon' : ''}`}>star</span>
                    ))}
                  </div>
                </div>
              </div>
              <p class="text-xs text-slate-500 mt-3">{hotel.address?.city}, {hotel.address?.country}</p>
            </div>
            {/* Bottom info bar */}
            <div class="absolute bottom-0 left-0 right-0 z-20 flex flex-col">
              <div class="h-16 w-full bg-gradient-to-t from-white/95 via-white/60 to-transparent flex flex-col items-center justify-end pb-3">
                <div class="w-12 h-1 bg-slate-400/50 rounded-full mb-1.5" />
                <div class="flex items-center gap-1 text-primary animate-pulse">
                  <span class="text-[10px] font-bold uppercase tracking-wider">Swipe Down for Photo</span>
                  <span class="material-symbols-outlined text-sm">keyboard_arrow_down</span>
                </div>
              </div>
              <div class="bg-white px-5 py-4 flex items-center gap-4 shadow-upward border-t border-slate-100">
                <div class="flex-1 min-w-0">
                  <h3 class="font-bold text-slate-900 text-[15px] leading-tight truncate">{hotel.name}</h3>
                  <div class="flex items-center gap-1.5 text-xs text-slate-500">
                    <span class="material-symbols-outlined text-sm text-yellow-400 filled-icon">star</span>
                    <span class="font-bold text-slate-700">{hotel.star_rating}</span>
                  </div>
                </div>
                <div class="text-right">
                  <div class="font-bold text-primary text-lg leading-none">
                    {formatCurrency(hotel.lead_price?.per_night || hotel.lead_price?.amount || 0, hotel.lead_price?.currency)}
                  </div>
                  <div class="text-[10px] text-slate-400 font-bold uppercase mt-0.5">/ night</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </animated.div>
    </animated.div>
  )
}
