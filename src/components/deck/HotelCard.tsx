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
      if (first) {
        const axis = Math.abs(mx) > Math.abs(my) ? 'x' : 'y'
        return axis
      }
      const axis = memo || 'x'

      if (axis === 'x') {
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

  const imageUrl = hotel.images?.[0] || `https://placehold.co/400x600/0c4a6e/22d3ee?text=${encodeURIComponent(hotel.name.slice(0, 10))}`
  const stars = starArray(hotel.star_rating || 0)

  return (
    <animated.div
      {...bind()}
      style={{
        x,
        rotateZ,
        touchAction: 'none',
      }}
      class="relative w-full h-full cursor-grab active:cursor-grabbing select-none animate-card-enter"
    >
      <animated.div
        style={{
          rotateX,
          transformStyle: 'preserve-3d',
        }}
        class="w-full h-full relative"
      >
        {/* ===== IMAGE FACE (Front) ===== */}
        <div
          class="absolute inset-0 rounded-[2rem] neon-border bg-slate-900 overflow-hidden shadow-float"
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* Full image */}
          <div class="absolute inset-0">
            <img
              src={imageUrl}
              alt={hotel.name}
              class="w-full h-full object-cover opacity-90"
              loading="lazy"
            />
            {/* Gradient overlays for depth */}
            <div class="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-azure-900/90 z-10" />
            <div class="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent z-10" />
          </div>

          {/* Top badges */}
          <div class="absolute top-6 left-6 right-6 flex justify-between z-20">
            <div class="flex gap-3">
              {hotel.available_rooms && hotel.available_rooms <= 5 && (
                <div class="glass-panel px-4 py-2 rounded-xl border-cyan/30">
                  <span class="text-white font-bold text-xs uppercase tracking-widest drop-shadow-sm text-glow">Rare Find</span>
                </div>
              )}
              {hotel.star_rating && (
                <div class="bg-azure-500/80 backdrop-blur-md px-3 py-2 rounded-xl flex items-center gap-1.5 border border-white/20 shadow-lg">
                  <span class="material-symbols-outlined text-white text-sm filled-icon">star</span>
                  <span class="text-white text-xs font-bold tracking-wide">{hotel.star_rating}.0</span>
                </div>
              )}
            </div>
            {hotel.review_score && (
              <div class="glass-panel px-3 py-2 rounded-xl border-white/30">
                <span class="text-white text-xs font-bold">{hotel.review_score}/10</span>
              </div>
            )}
          </div>

          {/* Bottom content */}
          <div class="absolute bottom-0 left-0 right-0 z-20 flex flex-col">
            <div class="px-6 pb-5 space-y-3">
              {/* Hotel name — hero sized */}
              <div>
                <h1 class="text-white font-extrabold text-4xl tracking-tight leading-none mb-2 drop-shadow-lg">
                  {hotel.name}
                </h1>
                <div class="flex items-center gap-2 text-cyan/80">
                  <span class="material-symbols-outlined text-lg text-cyan">location_on</span>
                  <span class="font-light text-sm tracking-wide">{hotel.address?.city}, {hotel.address?.country}</span>
                </div>
              </div>

              {/* Amenity chips + price */}
              <div class="flex items-end justify-between gap-4">
                <div class="flex gap-2">
                  <div class="glass-panel px-3 py-2 rounded-lg flex flex-col items-center justify-center min-w-[56px]">
                    <span class="material-symbols-outlined text-cyan text-lg mb-0.5">wifi</span>
                    <span class="text-[9px] text-white uppercase tracking-wider font-light">WiFi</span>
                  </div>
                  <div class="glass-panel px-3 py-2 rounded-lg flex flex-col items-center justify-center min-w-[56px]">
                    <span class="material-symbols-outlined text-cyan text-lg mb-0.5">pool</span>
                    <span class="text-[9px] text-white uppercase tracking-wider font-light">Pool</span>
                  </div>
                </div>
                <div class="glass-panel px-5 py-3 rounded-xl flex flex-col items-end shadow-xl border-cyan/20 bg-azure-900/40">
                  <span class="text-[10px] text-cyan uppercase tracking-widest mb-0.5 font-bold">Per Night</span>
                  <span class="font-bold text-2xl text-white tracking-tighter">
                    {formatCurrency(hotel.lead_price?.per_night || hotel.lead_price?.amount || 0, hotel.lead_price?.currency)}
                  </span>
                </div>
              </div>
            </div>

            {/* Map peek strip */}
            <div class="relative w-full h-[76px] bg-slate-900 rounded-t-[2rem] overflow-hidden flex flex-col items-center pt-3 border-t border-cyan/30 map-3d">
              <div class="absolute inset-0 bg-gradient-to-b from-azure-900/20 to-slate-900/90 pointer-events-none" />
              <div class="w-14 h-1 bg-cyan/40 rounded-full mb-2 z-10 shadow-neon" />
              {gestureHint ? (
                <div class="flex items-center gap-2 z-10">
                  <span class="material-symbols-outlined text-cyan text-sm animate-pulse">explore</span>
                  <span class="text-[10px] font-bold tracking-[0.2em] text-cyan uppercase" style={{ textShadow: '0 0 5px rgba(34,211,238,0.8)' }}>View Map</span>
                </div>
              ) : (
                <div class="flex items-center gap-2 z-10">
                  <span class="material-symbols-outlined text-cyan/60 text-sm">map</span>
                  <span class="text-[10px] font-bold tracking-wider text-cyan/60 uppercase">Map View</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ===== MAP FACE (Back) ===== */}
        <div
          class="absolute inset-0 rounded-[2rem] neon-border bg-slate-900 overflow-hidden shadow-float"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateX(180deg)' }}
        >
          {/* Map placeholder */}
          <div class="h-full w-full relative bg-slate-900 map-3d flex items-center justify-center">
            <div class="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-transparent to-slate-900/80" />

            <div class="text-center z-10 px-6">
              <div class="size-24 rounded-full border-2 border-cyan flex items-center justify-center mx-auto mb-6 relative">
                <div class="absolute inset-0 border border-azure-500 rounded-full animate-ping opacity-20" />
                <span class="material-symbols-outlined text-4xl text-cyan">location_on</span>
              </div>
              <h3 class="font-extrabold text-2xl text-white mb-2 uppercase tracking-tight">{hotel.name}</h3>
              <p class="text-cyan/70 text-sm mb-6">{hotel.address?.city}, {hotel.address?.country}</p>

              <div class="flex items-center justify-center gap-1 mb-6">
                <div class="flex text-yellow-400">
                  {stars.map((filled, i) => (
                    <span key={i} class={`material-symbols-outlined text-sm ${filled ? 'filled-icon' : ''}`}>star</span>
                  ))}
                </div>
              </div>

              <div class="glass-panel rounded-xl px-6 py-4 inline-block">
                <span class="text-[10px] text-cyan uppercase tracking-widest block mb-1 font-bold">Nightly Rate</span>
                <span class="font-bold text-3xl text-white tracking-tighter">
                  {formatCurrency(hotel.lead_price?.per_night || hotel.lead_price?.amount || 0, hotel.lead_price?.currency)}
                </span>
              </div>
            </div>

            {/* Image peek strip at bottom */}
            <div class="absolute bottom-0 left-0 right-0 h-[76px] overflow-hidden rounded-t-[2rem] border-t border-cyan/30">
              <img
                src={imageUrl}
                alt=""
                class="w-full h-full object-cover object-center opacity-50"
              />
              <div class="absolute inset-0 bg-slate-900/60 flex flex-col items-center justify-center">
                <div class="w-14 h-1 bg-cyan/40 rounded-full mb-2 shadow-neon" />
                <div class="flex items-center gap-2">
                  <span class="text-[10px] font-bold tracking-[0.2em] text-cyan uppercase" style={{ textShadow: '0 0 5px rgba(34,211,238,0.8)' }}>View Photo</span>
                  <span class="material-symbols-outlined text-cyan text-sm">photo_camera</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </animated.div>
    </animated.div>
  )
}
