import { useEffect, useState } from 'preact/hooks'
import { useLocation } from 'wouter-preact'
import { Header } from '../layout/Header'
import * as shortlistStore from '../../stores/shortlistStore'
import * as roomSelectionStore from '../../stores/roomSelectionStore'
import * as ratesStore from '../../stores/ratesStore'
import * as deckStore from '../../stores/deckStore'
import { getHotelRates } from '../../api/rates'
import { formatCurrency, starArray } from '../../lib/formatters'
import { BOARD_TYPE_LABELS, BOARD_TYPE_ICONS } from '../../lib/constants'
import type { Hotel } from '../../types'

export function ComparePage() {
  const [, navigate] = useLocation()
  const hotels = shortlistStore.shortlist.value
  const selections = roomSelectionStore.selections.value
  const [selectedIdx, setSelectedIdx] = useState(0)

  // Fetch rates for all shortlisted hotels on mount
  useEffect(() => {
    hotels.forEach(hotel => {
      if (!ratesStore.getRates(hotel.hotel_id) && !ratesStore.loadingRates.value.has(hotel.hotel_id)) {
        ratesStore.setLoading(hotel.hotel_id)
        getHotelRates(deckStore.searchId.value, hotel.hotel_id)
          .then(data => ratesStore.setRates(hotel.hotel_id, data.rooms))
          .catch(() => ratesStore.setRates(hotel.hotel_id, []))
      }
    })
  }, [hotels])

  if (hotels.length === 0) {
    return (
      <>
        <Header showBack title="Compare" />
        <main class="flex-1 flex items-center justify-center p-6">
          <div class="text-center">
            <span class="material-symbols-outlined text-5xl text-slate-300 mb-4">compare_arrows</span>
            <h2 class="text-xl font-bold text-slate-900 mb-2">No Hotels to Compare</h2>
            <p class="text-sm text-slate-500 mb-6">Shortlist hotels from the deck to compare them</p>
            <button onClick={() => navigate('/results')} class="bg-primary text-white px-6 py-3 rounded-2xl font-bold text-sm">
              Back to Deck
            </button>
          </div>
        </main>
      </>
    )
  }

  const selectedHotel = hotels[selectedIdx]
  const selectedRoom = selectedHotel ? selections[selectedHotel.hotel_id] : undefined

  const handleBook = () => {
    if (selectedRoom) navigate('/checkout')
    else if (selectedHotel) navigate(`/compare/${selectedHotel.hotel_id}/rooms`)
  }

  const removeHotel = (hotelId: string) => {
    shortlistStore.removeFromShortlist(hotelId)
    if (selectedIdx >= hotels.length - 1) setSelectedIdx(Math.max(0, selectedIdx - 1))
  }

  const colWidth = 160
  const labelWidth = 90
  const gridCols = `${labelWidth}px ${hotels.map(() => `${colWidth}px`).join(' ')}`

  return (
    <>
      <Header
        showBack
        right={
          <button onClick={() => navigate('/results')} class="flex items-center justify-center size-10 text-slate-900 rounded-full hover:bg-slate-100">
            <span class="material-symbols-outlined text-2xl">more_vert</span>
          </button>
        }
      />
      <main class="flex-1 w-full flex flex-col overflow-hidden relative">
        {/* Subheader */}
        <div class="px-5 py-3 shrink-0 bg-white border-b border-slate-100">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-lg font-bold text-slate-900 leading-tight">Comparison</h1>
              <p class="text-[10px] font-bold text-primary uppercase tracking-wider mt-0.5">{hotels.length} of 10 hotels</p>
            </div>
            <div class="flex -space-x-2">
              {hotels.slice(0, 3).map(h => (
                <div key={h.hotel_id} class="size-7 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                  {h.images?.[0] ? (
                    <img src={h.images[0]} class="w-full h-full object-cover" alt={h.name} />
                  ) : (
                    <div class="w-full h-full bg-primary/20 flex items-center justify-center text-[8px] font-bold text-primary">
                      {h.name[0]}
                    </div>
                  )}
                </div>
              ))}
              {hotels.length > 3 && (
                <div class="size-7 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                  +{hotels.length - 3}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mini map placeholder */}
        <div class="relative w-full h-28 bg-slate-200 overflow-hidden shrink-0 border-b border-slate-300/30">
          <div class="absolute inset-0 bg-[#eef2f6]" />
          {hotels.map((h, i) => (
            <div
              key={h.hotel_id}
              class={`absolute flex flex-col items-center z-10 ${i === selectedIdx ? 'scale-100 opacity-100 z-20' : 'scale-50 opacity-60'}`}
              style={{ top: `${20 + (i * 20) % 60}%`, left: `${15 + (i * 25) % 75}%`, transform: 'translate(-50%, -100%)' }}
            >
              <div class={`text-[10px] font-bold px-1.5 py-0.5 rounded shadow-md mb-0.5 whitespace-nowrap ${
                i === selectedIdx ? 'bg-primary text-white' : 'bg-white text-slate-600 border border-slate-200'
              }`}>
                {formatCurrency(h.lead_price?.per_night || 0, h.lead_price?.currency)}
              </div>
              <span class={`material-symbols-outlined text-4xl filled-icon leading-none drop-shadow-lg ${
                i === selectedIdx ? 'text-primary' : 'text-slate-400'
              }`}>location_on</span>
            </div>
          ))}
        </div>

        {/* Scrollable comparison grid */}
        <div class="flex-1 overflow-auto w-full no-scrollbar relative bg-background-light">
          <div class="min-w-max pb-24" style={{ display: 'grid', gridTemplateColumns: gridCols }}>
            {/* Header row: images */}
            <div class="sticky left-0 bg-background-light z-20" />
            {hotels.map((h, i) => {
              const sel = selections[h.hotel_id]
              return (
                <div key={h.hotel_id} class="px-2 pb-3 flex flex-col gap-2 pt-3" onClick={() => setSelectedIdx(i)}>
                  <div class={`relative aspect-[4/3] rounded-xl overflow-hidden shadow-sm ${i === selectedIdx ? 'ring-2 ring-primary ring-offset-2' : 'opacity-80'}`}>
                    {h.images?.[0] ? (
                      <img src={h.images[0]} class="w-full h-full object-cover" alt={h.name} />
                    ) : (
                      <div class="w-full h-full bg-primary/10 flex items-center justify-center text-primary font-bold">{h.name[0]}</div>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); removeHotel(h.hotel_id) }}
                      class="absolute top-1.5 right-1.5 size-6 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-slate-400 shadow-sm hover:text-rose-500"
                    >
                      <span class="material-symbols-outlined text-[14px]">close</span>
                    </button>
                  </div>
                  <h3 class={`font-bold text-xs leading-tight ${i === selectedIdx ? 'text-primary' : 'text-slate-600'}`}>{h.name}</h3>
                  {sel && <span class="text-[9px] font-bold text-accent-emerald">{sel.room_name}</span>}
                </div>
              )
            })}

            {/* Rate row */}
            <RowLabel>Rate</RowLabel>
            {hotels.map((h, i) => {
              const sel = selections[h.hotel_id]
              const price = sel ? sel.pricing.per_night : (h.lead_price?.per_night || 0)
              const currency = sel ? sel.pricing.currency : (h.lead_price?.currency || 'USD')
              return (
                <Cell key={h.hotel_id} even={i % 2 === 0}>
                  <span class={`text-base font-bold ${i === selectedIdx ? 'text-primary' : 'text-slate-700'}`}>
                    {formatCurrency(price, currency)}
                  </span>
                  <span class="text-[9px] text-slate-500 font-medium">per night</span>
                </Cell>
              )
            })}

            {/* Stars row */}
            <RowLabel>Stars</RowLabel>
            {hotels.map((h, i) => (
              <Cell key={h.hotel_id} even={i % 2 === 0}>
                <div class="flex text-amber-400">
                  {starArray(h.star_rating || 0).map((filled, j) => (
                    <span key={j} class={`material-symbols-outlined text-[16px] ${filled ? 'filled-icon' : 'text-slate-200'}`}>star</span>
                  ))}
                </div>
              </Cell>
            ))}

            {/* Reviews row */}
            <RowLabel>Reviews</RowLabel>
            {hotels.map((h, i) => (
              <Cell key={h.hotel_id} even={i % 2 === 0}>
                {h.review_score ? (
                  <>
                    <div class="bg-primary text-white text-[10px] font-bold px-2 py-1 rounded shadow-md shadow-primary/10">{h.review_score}</div>
                    <span class="text-[10px] font-bold text-slate-600 ml-1.5">{h.review_text || 'Good'}</span>
                  </>
                ) : (
                  <span class="text-[10px] text-slate-400">N/A</span>
                )}
              </Cell>
            ))}

            {/* Board row */}
            <RowLabel>Board</RowLabel>
            {hotels.map((h, i) => {
              const sel = selections[h.hotel_id]
              const board = sel?.board_type || 'room_only'
              return (
                <Cell key={h.hotel_id} even={i % 2 === 0}>
                  <span class="material-symbols-outlined text-[14px] mr-1.5 text-slate-400">{BOARD_TYPE_ICONS[board] || 'bed'}</span>
                  <span class="text-xs font-semibold text-slate-700">{BOARD_TYPE_LABELS[board] || board}</span>
                </Cell>
              )
            })}

            {/* Room Type row */}
            <RowLabel>Room</RowLabel>
            {hotels.map((h, i) => {
              const sel = selections[h.hotel_id]
              return (
                <Cell key={h.hotel_id} even={i % 2 === 0}>
                  <span class="material-symbols-outlined text-[14px] mr-1.5 text-slate-400">king_bed</span>
                  <span class="text-xs font-semibold text-slate-700">{sel?.room_name || '—'}</span>
                </Cell>
              )
            })}

            {/* Refund row */}
            <RowLabel>Refund</RowLabel>
            {hotels.map((h, i) => {
              const sel = selections[h.hotel_id]
              return (
                <Cell key={h.hotel_id} even={i % 2 === 0}>
                  {sel ? (
                    <span class="text-xs font-semibold text-accent-emerald flex items-center">
                      <span class="material-symbols-outlined text-[14px] mr-1.5">check_circle</span>
                      Free Cancel
                    </span>
                  ) : (
                    <span class="text-xs text-slate-400">Select room</span>
                  )}
                </Cell>
              )
            })}

            {/* Distance row */}
            <RowLabel>Center</RowLabel>
            {hotels.map((h, i) => (
              <Cell key={h.hotel_id} even={i % 2 === 0}>
                <span class="text-xs text-slate-600">—</span>
              </Cell>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div class="px-4 py-2 text-[9px] text-slate-400 text-center bg-background-light">
          Prices shown are indicative and subject to availability. Final pricing confirmed at checkout.
        </div>
      </main>

      {/* Bottom CTA */}
      <div class="bg-white border-t border-slate-100 px-4 py-3 shrink-0 z-40 shadow-upward">
        <button
          onClick={handleBook}
          class="w-full bg-primary hover:bg-primary-light text-white font-bold py-3 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <span>
            {selectedRoom
              ? `Book ${selectedHotel?.name?.slice(0, 15)} · ${formatCurrency(selectedRoom.pricing.total, selectedRoom.pricing.currency)}`
              : 'Select Room'}
          </span>
          <span class="material-symbols-outlined text-lg">arrow_forward</span>
        </button>
      </div>
    </>
  )
}

function RowLabel({ children }: { children: any }) {
  return (
    <div class="sticky left-0 bg-background-light z-10 flex items-center px-4 py-2 border-b border-slate-200/60 font-bold text-[10px] text-slate-400 uppercase tracking-widest shadow-[4px_0_12px_-4px_rgba(0,0,0,0.05)]">
      {children}
    </div>
  )
}

function Cell({ children, even }: { children: any; even: boolean }) {
  return (
    <div class={`flex items-center px-2 py-2 border-b border-slate-200/60 ${even ? 'bg-white' : 'bg-slate-50'}`}>
      {children}
    </div>
  )
}
