interface ActionButtonsProps {
  onDismiss: () => void
  onShortlist: () => void
  onCompare: () => void
  shortlistCount: number
  isShortlisted: boolean
  isFull: boolean
}

export function ActionButtons({ onDismiss, onShortlist, onCompare, shortlistCount, isShortlisted, isFull }: ActionButtonsProps) {
  return (
    <nav class="px-8 py-5 pb-8 flex justify-center items-center gap-10 z-10">
      {/* Dismiss */}
      <button
        onClick={onDismiss}
        class="size-14 rounded-full border-2 border-slate-300 bg-white/50 backdrop-blur-sm flex items-center justify-center text-slate-400 hover:text-accent-rose hover:border-accent-rose hover:shadow-[0_0_10px_rgba(244,63,94,0.4)] hover:bg-white transition-all duration-300 active:scale-95"
        aria-label="Dismiss hotel"
      >
        <span class="material-symbols-outlined text-3xl">close</span>
      </button>

      {/* Shortlist — hero button, slightly larger */}
      <button
        onClick={onShortlist}
        disabled={isShortlisted || isFull}
        class={`size-16 rounded-full border-2 backdrop-blur-md flex items-center justify-center transition-all duration-300 active:scale-95 relative overflow-hidden disabled:opacity-40 disabled:cursor-not-allowed ${
          isShortlisted
            ? 'border-accent-emerald bg-accent-emerald/20 text-accent-emerald shadow-[0_0_15px_rgba(16,185,129,0.4)]'
            : 'border-azure-500 bg-azure-50/50 text-azure-600 hover:text-cyan hover:border-cyan hover:shadow-neon-hover hover:bg-white'
        }`}
        aria-label="Add to shortlist"
      >
        <div class="absolute inset-0 bg-gradient-to-tr from-cyan/20 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
        <span class={`material-symbols-outlined text-3xl relative z-10 ${isShortlisted ? 'filled-icon' : ''}`}>
          {isShortlisted ? 'check' : 'rocket_launch'}
        </span>
      </button>

      {/* Compare */}
      <button
        onClick={onCompare}
        disabled={shortlistCount === 0}
        class="relative size-14 rounded-full border-2 border-slate-300 bg-white/50 backdrop-blur-sm flex items-center justify-center text-slate-400 hover:text-cyan hover:border-cyan hover:shadow-neon hover:bg-white transition-all duration-300 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
        aria-label="Compare shortlisted hotels"
      >
        <span class="material-symbols-outlined text-3xl">bookmark_border</span>
        {shortlistCount > 0 && (
          <span class="absolute -top-1 -right-1 size-5 rounded-full bg-azure-500 text-white text-[10px] font-bold flex items-center justify-center shadow-sm border border-white">
            {shortlistCount}
          </span>
        )}
      </button>
    </nav>
  )
}
