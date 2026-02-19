import { useLocation } from 'wouter-preact'

interface HeaderProps {
  showBack?: boolean
  title?: string
  right?: any
  left?: any
}

export function Header({ showBack, title, right, left }: HeaderProps) {
  const [, navigate] = useLocation()
  return (
    <header class="flex items-center justify-between px-4 py-3 shrink-0 z-30">
      <div class="w-10 flex justify-start">
        {showBack ? (
          <button
            onClick={() => history.back()}
            class="flex items-center justify-center size-10 rounded-full bg-white/80 backdrop-blur-md text-primary shadow-sm hover:bg-white active:scale-95 transition-all"
            aria-label="Go back"
          >
            <span class="material-symbols-outlined">arrow_back</span>
          </button>
        ) : left ? left : (
          <button class="flex items-center justify-center size-10 text-slate-900" aria-label="Menu">
            <span class="material-symbols-outlined text-2xl">menu</span>
          </button>
        )}
      </div>
      <div class="flex items-center gap-2">
        {title ? (
          <h1 class="text-lg font-bold tracking-tight text-slate-900">{title}</h1>
        ) : (
          <div class="flex items-center gap-2 font-bold text-xl tracking-tight text-primary">
            <div class="size-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold italic tracking-tighter text-sm">eG</div>
          </div>
        )}
      </div>
      <div class="w-10 flex justify-end">
        {right || (
          <button class="flex items-center justify-center size-10 text-slate-900" aria-label="Profile">
            <span class="material-symbols-outlined text-2xl">person_outline</span>
          </button>
        )}
      </div>
    </header>
  )
}
