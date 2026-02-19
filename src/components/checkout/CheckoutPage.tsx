import { useState } from 'preact/hooks'
import { useLocation } from 'wouter-preact'
import { Header } from '../layout/Header'
import * as roomSelectionStore from '../../stores/roomSelectionStore'
import * as shortlistStore from '../../stores/shortlistStore'
import { formatCurrency, starArray } from '../../lib/formatters'
import { BOARD_TYPE_LABELS } from '../../lib/constants'

export function CheckoutPage() {
  const [, navigate] = useLocation()
  const [showToast, setShowToast] = useState(false)
  const selections = roomSelectionStore.selections.value
  const hotels = shortlistStore.shortlist.value

  // Find the first hotel that has a room selected
  const entry = Object.entries(selections)[0]
  if (!entry) {
    return (
      <>
        <Header showBack title="Checkout" />
        <main class="flex-1 flex items-center justify-center p-6">
          <div class="text-center">
            <span class="material-symbols-outlined text-5xl text-slate-300 mb-4">shopping_cart</span>
            <h2 class="text-xl font-bold text-slate-900 mb-2">Nothing to Book</h2>
            <p class="text-sm text-slate-500 mb-6">Select a room from the compare view first</p>
            <button onClick={() => navigate('/compare')} class="bg-primary text-white px-6 py-3 rounded-2xl font-bold text-sm">
              Back to Compare
            </button>
          </div>
        </main>
      </>
    )
  }

  const [hotelId, selection] = entry
  const hotel = hotels.find(h => h.hotel_id === hotelId)

  const handleBook = () => {
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  return (
    <>
      <Header showBack title="Checkout" />
      <main class="flex-1 overflow-y-auto pb-6">
        {/* Hotel summary */}
        <div class="px-5 py-5 bg-white border-b border-slate-100">
          <div class="flex gap-4">
            <div class="size-20 rounded-2xl bg-slate-200 overflow-hidden shrink-0">
              {hotel?.images?.[0] ? (
                <img src={hotel.images[0]} class="w-full h-full object-cover" alt={hotel.name} />
              ) : (
                <div class="w-full h-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">{hotel?.name?.[0]}</div>
              )}
            </div>
            <div class="flex-1">
              <h2 class="font-bold text-lg text-slate-900 leading-tight">{hotel?.name}</h2>
              <div class="flex items-center gap-1 mt-1">
                {starArray(hotel?.star_rating || 0).map((filled, i) => (
                  <span key={i} class={`material-symbols-outlined text-[14px] text-amber-400 ${filled ? 'filled-icon' : ''}`}>star</span>
                ))}
              </div>
              <p class="text-xs text-slate-500 mt-1">{hotel?.address?.city}, {hotel?.address?.country}</p>
            </div>
          </div>
        </div>

        {/* Room & Rate summary */}
        <div class="px-5 py-4 bg-white border-b border-slate-100 mt-2">
          <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Selected Room</h3>
          <div class="flex justify-between items-start">
            <div>
              <p class="font-bold text-sm text-slate-900">{selection.room_name}</p>
              <p class="text-xs text-slate-500 mt-0.5">{selection.rate_name}</p>
              <div class="flex items-center gap-1.5 mt-1">
                <span class="material-symbols-outlined text-[14px] text-slate-400">restaurant</span>
                <span class="text-xs font-semibold text-slate-600">{BOARD_TYPE_LABELS[selection.board_type] || selection.board_type}</span>
              </div>
            </div>
            <div class="text-right">
              <div class="font-bold text-primary text-xl">{formatCurrency(selection.pricing.total, selection.pricing.currency)}</div>
              <div class="text-[10px] text-slate-500">{formatCurrency(selection.pricing.per_night, selection.pricing.currency)}/night</div>
            </div>
          </div>
        </div>

        {/* Cancellation policy */}
        <div class="px-5 py-4 bg-accent-emerald/5 border-b border-slate-100 mt-2">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-accent-emerald">verified</span>
            <div>
              <p class="text-sm font-bold text-slate-900">Cancellation Policy</p>
              <p class="text-xs text-slate-500 mt-0.5">Free cancellation available — check rate terms for details</p>
            </div>
          </div>
        </div>

        {/* Guest details form (non-functional) */}
        <div class="px-5 py-4 mt-2">
          <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Guest Details</h3>
          <div class="flex flex-col gap-3">
            <input type="text" placeholder="Full Name" class="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
            <input type="email" placeholder="Email Address" class="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
            <input type="tel" placeholder="Phone Number" class="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
            <textarea placeholder="Special Requests (optional)" rows={2} class="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none" />
          </div>
        </div>

        {/* Price breakdown */}
        <div class="px-5 py-4 bg-white border-y border-slate-100 mt-2">
          <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Price Breakdown</h3>
          <div class="space-y-2 text-sm">
            {selection.pricing.breakdown ? (
              <>
                <div class="flex justify-between"><span class="text-slate-600">Base rate</span><span class="font-semibold">{formatCurrency(selection.pricing.breakdown.base_rate, selection.pricing.currency)}</span></div>
                <div class="flex justify-between"><span class="text-slate-600">Taxes</span><span class="font-semibold">{formatCurrency(selection.pricing.breakdown.taxes, selection.pricing.currency)}</span></div>
                {selection.pricing.breakdown.fees > 0 && (
                  <div class="flex justify-between"><span class="text-slate-600">Fees</span><span class="font-semibold">{formatCurrency(selection.pricing.breakdown.fees, selection.pricing.currency)}</span></div>
                )}
              </>
            ) : (
              <div class="flex justify-between"><span class="text-slate-600">Room total</span><span class="font-semibold">{formatCurrency(selection.pricing.total, selection.pricing.currency)}</span></div>
            )}
            <div class="flex justify-between font-bold text-base border-t border-slate-200 pt-2 mt-2">
              <span>Total</span>
              <span class="text-primary">{formatCurrency(selection.pricing.total, selection.pricing.currency)}</span>
            </div>
          </div>
          <p class="text-[9px] text-slate-400 mt-2">{selection.pricing.taxes_included ? 'All taxes included' : 'Taxes may apply at checkout'}</p>
        </div>

        {/* Payment section (non-functional) */}
        <div class="px-5 py-4 mt-2">
          <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Payment Method</h3>
          <div class="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3 opacity-60">
            <span class="material-symbols-outlined text-2xl text-slate-400">credit_card</span>
            <span class="text-sm text-slate-500">Card payment details</span>
          </div>
        </div>

        {/* T&Cs */}
        <div class="px-5 py-4">
          <label class="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" class="mt-1 rounded border-slate-300 text-primary focus:ring-primary/20" />
            <span class="text-xs text-slate-500 leading-relaxed">
              I agree to the <span class="text-primary font-semibold">Terms & Conditions</span> and <span class="text-primary font-semibold">Privacy Policy</span>
            </span>
          </label>
        </div>

        {/* Footer disclaimer */}
        <div class="px-5 py-3">
          <p class="text-[9px] text-slate-400 leading-relaxed">
            By proceeding you agree to the booking terms. Prices are in {selection.pricing.currency}. Cancellation policy applies as stated above.
          </p>
        </div>
      </main>

      {/* Book CTA */}
      <div class="bg-white border-t border-slate-100 px-5 py-4 shrink-0 shadow-upward">
        <button
          onClick={handleBook}
          class="w-full bg-primary text-white py-4 rounded-2xl font-bold text-base shadow-xl shadow-primary/20 active:scale-[0.98] transition-all"
        >
          Complete Booking
        </button>
      </div>

      {/* Toast */}
      {showToast && (
        <div class="fixed bottom-24 left-1/2 -translate-x-1/2 bg-overlay-dark text-white px-6 py-3 rounded-2xl shadow-xl text-sm font-bold z-50 animate-bounce">
          Coming Soon!
        </div>
      )}
    </>
  )
}
