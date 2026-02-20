import { useLocation } from 'wouter-preact'

interface HeaderProps {
  showBack?: boolean
  title?: string
  right?: any
  left?: any
  variant?: 'light' | 'overlay'
}

export function Header({ showBack, title, right, left, variant = 'light' }: HeaderProps) {
  const [, navigate] = useLocation()
  const isOverlay = variant === 'overlay'

  return (
    <header
      class={`flex items-center justify-between px-6 shrink-0 z-30 ${
        isOverlay ? 'absolute top-0 left-0 right-0 py-4 pt-[max(1rem,env(safe-area-inset-top))]' : 'py-5'
      }`}
    >
      <div class="flex items-center">
        {showBack ? (
          <button
            onClick={() => history.back()}
            class={`flex items-center justify-center size-10 rounded-xl transition-all duration-300 active:scale-95 ${
              isOverlay
                ? 'glass-panel border-white/30 text-white hover:bg-white/20'
                : 'bg-white/60 hover:bg-white/90 backdrop-blur-md border border-azure-200 shadow-sm text-azure-600'
            }`}
            aria-label="Go back"
          >
            <span class="material-symbols-outlined text-xl">arrow_back</span>
          </button>
        ) : left ? left : (
          <div class="flex flex-col">
            <span class="text-azure-900 font-extrabold text-2xl leading-none tracking-tight">SwipeStay</span>
            <span class="text-cyan text-[10px] tracking-[0.25em] uppercase mt-1 font-medium">Future Stays</span>
          </div>
        )}
      </div>
      <div class="flex items-center">
        {title && (
          <h1 class={`text-lg font-bold tracking-tight ${isOverlay ? 'text-white text-glow' : 'text-azure-900'}`}>{title}</h1>
        )}
      </div>
      <div class="flex items-center">
        {right || (
          <button
            class={`flex items-center justify-center size-10 rounded-xl transition-all duration-300 active:scale-95 ${
              isOverlay
                ? 'glass-panel border-white/30 text-white hover:bg-white/20'
                : 'bg-white/60 hover:bg-white/90 backdrop-blur-md border border-azure-200 shadow-sm text-azure-600 hover:text-cyan'
            }`}
          >
            <span class="material-symbols-outlined text-xl">tune</span>
          </button>
        )}
      </div>
    </header>
  )
}
