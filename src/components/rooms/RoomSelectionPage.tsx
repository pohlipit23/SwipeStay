import { useEffect, useState } from 'preact/hooks'
import { useLocation, useRoute } from 'wouter-preact'
import { Header } from '../layout/Header'
import * as deckStore from '../../stores/deckStore'
import * as shortlistStore from '../../stores/shortlistStore'
import * as ratesStore from '../../stores/ratesStore'
import * as roomSelectionStore from '../../stores/roomSelectionStore'
import { getHotelRates } from '../../api/rates'
import { formatCurrency, formatDateRange, starArray } from '../../lib/formatters'
import { BOARD_TYPE_LABELS, BOARD_TYPE_ICONS } from '../../lib/constants'
import type { Room, Rate, Hotel } from '../../types'

export function RoomSelectionPage() {
  const [, navigate] = useLocation()
  const [, params] = useRoute('/compare/:hotelId/rooms')
  const hotelId = params?.hotelId || ''
  const hotel = shortlistStore.shortlist.value.find(h => h.hotel_id === hotelId)
  const rooms = ratesStore.getRates(hotelId)
  const isLoading = ratesStore.loadingRates.value.has(hotelId)
  const [expandedRoom, setExpandedRoom] = useState<string | null>(null)

  useEffect(() => {
    if (!rooms && !isLoading && hotelId) {
      ratesStore.setLoading(hotelId)
      getHotelRates(deckStore.searchId.value, hotelId)
        .then(data => ratesStore.setRates(hotelId, data.rooms))
        .catch(() => ratesStore.setRates(hotelId, []))
    }
  }, [hotelId])

  const handleSelectRate = (room: Room, rate: Rate) => {
    roomSelectionStore.selectRoom({
      hotel_id: hotelId,
      room_id: room.room_id,
      rate_id: rate.rate_id,
      room_name: room.room_name,
      rate_name: rate.rate_name,
      board_type: rate.board_type,
      pricing: rate.pricing,
    })
    navigate('/compare')
  }

  if (!hotel) {
    return (
      <>
        <Header showBack title="Rooms" />
        <main class="flex-1 flex items-center justify-center">
          <p class="text-slate-500">Hotel not found</p>
        </main>
      </>
    )
  }

  return (
    <>
      <Header showBack title="Select Room" />
      <main class="flex-1 overflow-y-auto pb-6">
        {/* Hotel summary */}
        <div class="px-5 py-4 bg-white border-b border-slate-100">
          <div class="flex items-center gap-3">
            <div class="size-14 rounded-xl bg-slate-200 overflow-hidden shrink-0">
              {hotel.images?.[0] ? (
                <img src={hotel.images[0]} class="w-full h-full object-cover" alt={hotel.name} />
              ) : (
                <div class="w-full h-full bg-primary/10 flex items-center justify-center text-primary font-bold">{hotel.name[0]}</div>
              )}
            </div>
            <div class="flex-1 min-w-0">
              <h2 class="font-bold text-slate-900 text-base leading-tight truncate">{hotel.name}</h2>
              <div class="flex items-center gap-1 mt-0.5">
                {starArray(hotel.star_rating || 0).map((filled, i) => (
                  <span key={i} class={`material-symbols-outlined text-[14px] text-amber-400 ${filled ? 'filled-icon' : ''}`}>star</span>
                ))}
              </div>
              <p class="text-xs text-slate-500 mt-0.5">
                {deckStore.searchId.value ? formatDateRange(
                  new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
                  new Date(Date.now() + 32 * 86400000).toISOString().split('T')[0]
                ) : ''}
              </p>
            </div>
          </div>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div class="flex items-center justify-center py-12">
            <span class="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span>
          </div>
        )}

        {/* Room list */}
        {rooms && rooms.length > 0 && (
          <div class="px-4 py-4 flex flex-col gap-4">
            {rooms.map(room => (
              <div key={room.room_id} class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                {/* Room header */}
                <button
                  onClick={() => setExpandedRoom(expandedRoom === room.room_id ? null : room.room_id)}
                  class="w-full px-4 py-4 flex items-center gap-3 text-left"
                >
                  <div class="size-12 rounded-xl bg-primary/5 flex items-center justify-center text-primary shrink-0">
                    <span class="material-symbols-outlined">king_bed</span>
                  </div>
                  <div class="flex-1 min-w-0">
                    <h3 class="font-bold text-sm text-slate-900">{room.room_name}</h3>
                    <div class="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                      {room.max_occupancy && <span>{room.max_occupancy.adults} adults</span>}
                      {room.room_size && <span>· {room.room_size.value}{room.room_size.unit}</span>}
                      {room.bed_types?.[0] && <span>· {room.bed_types[0].type}</span>}
                    </div>
                  </div>
                  <span class="material-symbols-outlined text-slate-400">
                    {expandedRoom === room.room_id ? 'expand_less' : 'expand_more'}
                  </span>
                </button>

                {/* Room amenities chips */}
                {room.amenities && room.amenities.length > 0 && (
                  <div class="px-4 pb-3 flex flex-wrap gap-1.5">
                    {room.amenities.slice(0, 5).map(a => (
                      <span key={a} class="px-2 py-0.5 bg-slate-50 text-[10px] font-semibold text-slate-500 rounded-full">{a}</span>
                    ))}
                  </div>
                )}

                {/* Expanded: rate options */}
                {expandedRoom === room.room_id && (
                  <div class="border-t border-slate-100 divide-y divide-slate-100">
                    {room.rates.map(rate => (
                      <RateOption key={rate.rate_id} rate={rate} onSelect={() => handleSelectRate(room, rate)} />
                    ))}
                  </div>
                )}

                {/* Collapsed: show lead rate price */}
                {expandedRoom !== room.room_id && room.rates[0] && (
                  <div class="px-4 pb-4 flex items-center justify-between">
                    <div>
                      <span class="text-lg font-bold text-primary">{formatCurrency(room.rates[0].pricing.per_night, room.rates[0].pricing.currency)}</span>
                      <span class="text-xs text-slate-500 ml-1">/ night</span>
                    </div>
                    <span class="text-xs text-slate-400">{room.rates.length} rate{room.rates.length !== 1 ? 's' : ''}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {rooms && rooms.length === 0 && !isLoading && (
          <div class="flex items-center justify-center py-12">
            <p class="text-sm text-slate-500">No rooms available</p>
          </div>
        )}

        {/* Legal */}
        <p class="text-[9px] text-slate-400 text-center px-6 mt-4">
          Rate subject to availability. Cancellation terms apply as stated.
        </p>
      </main>
    </>
  )
}

function RateOption({ rate, onSelect }: { rate: Rate; onSelect: () => void }) {
  const [showBreakdown, setShowBreakdown] = useState(false)

  return (
    <div class="px-4 py-4">
      <div class="flex items-start justify-between mb-2">
        <div>
          <h4 class="text-sm font-bold text-slate-900">{rate.rate_name}</h4>
          <div class="flex items-center gap-1.5 mt-1">
            <span class="material-symbols-outlined text-[14px] text-slate-400">
              {BOARD_TYPE_ICONS[rate.board_type] || 'bed'}
            </span>
            <span class="text-xs font-semibold text-slate-600">{BOARD_TYPE_LABELS[rate.board_type] || rate.board_type}</span>
          </div>
        </div>
        <div class="text-right">
          <div class="font-bold text-primary text-lg">{formatCurrency(rate.pricing.total, rate.pricing.currency)}</div>
          <div class="text-[10px] text-slate-500">{formatCurrency(rate.pricing.per_night, rate.pricing.currency)}/night</div>
        </div>
      </div>

      {/* Cancellation policy */}
      {rate.cancellation_policy && (
        <div class="mb-2">
          {rate.cancellation_policy.refundable ? (
            <span class="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-accent-emerald/10 text-accent-emerald text-[10px] font-bold">
              <span class="material-symbols-outlined text-[12px]">check_circle</span>
              Free cancellation{rate.cancellation_policy.free_cancellation_until ? ` until ${new Date(rate.cancellation_policy.free_cancellation_until).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : ''}
            </span>
          ) : (
            <span class="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-accent-rose/10 text-accent-rose text-[10px] font-bold">
              <span class="material-symbols-outlined text-[12px]">cancel</span>
              Non-refundable
            </span>
          )}
        </div>
      )}

      {/* Payment options */}
      {rate.payment_options && (
        <div class="flex gap-2 mb-2">
          {rate.payment_options.pay_now && (
            <span class="px-2 py-0.5 bg-slate-50 text-[10px] font-semibold text-slate-600 rounded-full">Pay now</span>
          )}
          {rate.payment_options.pay_later && (
            <span class="px-2 py-0.5 bg-slate-50 text-[10px] font-semibold text-slate-600 rounded-full">Pay at hotel</span>
          )}
        </div>
      )}

      {/* Inclusions */}
      {rate.inclusions && rate.inclusions.length > 0 && (
        <div class="flex flex-wrap gap-1.5 mb-2">
          {rate.inclusions.map(inc => (
            <span key={inc} class="px-2 py-0.5 bg-primary/5 text-[10px] font-semibold text-primary rounded-full">{inc}</span>
          ))}
        </div>
      )}

      {/* Availability warning */}
      {rate.available_rooms && rate.available_rooms <= 3 && (
        <p class="text-[10px] font-bold text-accent-orange mb-2">Only {rate.available_rooms} room{rate.available_rooms !== 1 ? 's' : ''} left!</p>
      )}

      {/* Price breakdown toggle */}
      {rate.pricing.breakdown && (
        <button
          onClick={() => setShowBreakdown(!showBreakdown)}
          class="text-[10px] text-primary font-bold mb-2"
        >
          {showBreakdown ? 'Hide' : 'Show'} price breakdown
        </button>
      )}
      {showBreakdown && rate.pricing.breakdown && (
        <div class="bg-slate-50 rounded-lg p-3 mb-2 text-xs text-slate-600 space-y-1">
          <div class="flex justify-between"><span>Base rate</span><span>{formatCurrency(rate.pricing.breakdown.base_rate, rate.pricing.currency)}</span></div>
          <div class="flex justify-between"><span>Taxes</span><span>{formatCurrency(rate.pricing.breakdown.taxes, rate.pricing.currency)}</span></div>
          {rate.pricing.breakdown.fees > 0 && (
            <div class="flex justify-between"><span>Fees</span><span>{formatCurrency(rate.pricing.breakdown.fees, rate.pricing.currency)}</span></div>
          )}
          {rate.pricing.breakdown.discounts > 0 && (
            <div class="flex justify-between text-accent-emerald"><span>Discounts</span><span>-{formatCurrency(rate.pricing.breakdown.discounts, rate.pricing.currency)}</span></div>
          )}
          <div class="flex justify-between font-bold border-t border-slate-200 pt-1">
            <span>Total</span><span>{formatCurrency(rate.pricing.total, rate.pricing.currency)}</span>
          </div>
        </div>
      )}

      {/* Taxes note */}
      <p class="text-[9px] text-slate-400 mb-3">{rate.pricing.taxes_included ? 'Taxes included' : 'Taxes not included'}</p>

      {/* Select button */}
      <button
        onClick={onSelect}
        class="w-full bg-primary text-white py-2.5 rounded-xl font-bold text-sm active:scale-[0.98] transition-all shadow-md shadow-primary/20"
      >
        Select This Room
      </button>
    </div>
  )
}
