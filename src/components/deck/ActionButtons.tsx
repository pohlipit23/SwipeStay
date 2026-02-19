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
    <footer class="h-32 shrink-0 flex items-center justify-center gap-8 pb-2 px-4">
      {/* Dismiss */}
      <div class="flex flex-col items-center gap-2">
        <button
          onClick={onDismiss}
          class="flex items-center justify-center size-16 rounded-full bg-white text-accent-rose shadow-card hover:bg-rose-50 transition-all active:scale-90 border border-slate-100"
          aria-label="Dismiss hotel"
        >
          <span class="material-symbols-outlined text-[32px]">close</span>
        </button>
        <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Dismiss</span>
      </div>

      {/* Compare */}
      <div class="flex flex-col items-center gap-2">
        <button
          onClick={onCompare}
          disabled={shortlistCount === 0}
          class="flex items-center justify-center size-16 rounded-full bg-white text-primary shadow-card hover:bg-primary hover:text-white transition-all active:scale-90 border border-slate-100 group disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Compare shortlisted hotels"
        >
          <span class="material-symbols-outlined text-[32px] group-hover:scale-110 transition-transform">compare_arrows</span>
        </button>
        <span class="text-xs font-bold text-primary uppercase tracking-wider">Compare</span>
      </div>

      {/* Shortlist */}
      <div class="flex flex-col items-center gap-2">
        <button
          onClick={onShortlist}
          disabled={isShortlisted || isFull}
          class={`flex items-center justify-center size-14 rounded-full shadow-sm transition-all active:scale-90 border border-slate-100 ${
            isShortlisted
              ? 'bg-accent-emerald text-white'
              : 'bg-white text-primary hover:bg-primary/10'
          } disabled:opacity-40 disabled:cursor-not-allowed`}
          aria-label="Add to shortlist"
        >
          <span class={`material-symbols-outlined text-[24px] ${isShortlisted ? 'filled-icon' : ''}`}>
            {isShortlisted ? 'check' : 'favorite'}
          </span>
        </button>
        <span class="text-[10px] font-bold text-primary uppercase tracking-wider">
          {shortlistCount}/10
        </span>
      </div>
    </footer>
  )
}
