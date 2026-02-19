import { useLocation } from 'wouter-preact'
import { Header } from '../layout/Header'

export function AiAssistantPage() {
  const [, navigate] = useLocation()

  return (
    <>
      <header class="flex flex-col items-center p-4 pt-6 z-10 shrink-0 gap-6">
        <div class="flex items-center justify-between w-full">
          <button
            onClick={() => navigate('/')}
            class="flex items-center justify-center size-10 rounded-full bg-white text-slate-900 shadow-sm border border-slate-100"
            aria-label="Go back"
          >
            <span class="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 class="text-lg font-bold tracking-tight text-slate-900">Find Your Stay</h1>
          <button class="flex items-center justify-center size-10 rounded-full bg-white text-slate-900 shadow-sm border border-slate-100">
            <span class="material-symbols-outlined">account_circle</span>
          </button>
        </div>
        {/* Tab toggle */}
        <div class="bg-slate-200/50 p-1 rounded-full flex w-full max-w-[280px] relative">
          <button
            onClick={() => navigate('/')}
            class="flex-1 py-2 text-xs font-bold text-slate-500 z-10"
          >
            Standard
          </button>
          <button class="flex-1 py-2 text-xs font-bold text-white z-10 bg-primary rounded-full shadow-md">
            AI Assistant
          </button>
        </div>
      </header>

      <main class="flex-1 w-full flex flex-col p-6 overflow-y-auto no-scrollbar">
        <div class="flex flex-col gap-6">
          {/* AI message bubble */}
          <div class="flex gap-3 max-w-[85%]">
            <div class="size-8 rounded-full bg-primary flex items-center justify-center shrink-0 shadow-lg">
              <span class="material-symbols-outlined text-white text-[18px]">auto_awesome</span>
            </div>
            <div class="flex flex-col gap-1">
              <div class="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-slate-100">
                <p class="text-[15px] leading-relaxed text-slate-700">
                  Where are we heading? Just tell me what you're looking for...
                </p>
              </div>
              <span class="text-[10px] font-medium text-slate-400 ml-1">AI Assistant · Just now</span>
            </div>
          </div>

          {/* Suggestion chips */}
          <div class="flex flex-wrap gap-2 mt-2">
            <div class="px-4 py-2 bg-white/50 border border-slate-200 rounded-full text-[13px] text-slate-500">
              Pet-friendly boutique
            </div>
            <div class="px-4 py-2 bg-white/50 border border-slate-200 rounded-full text-[13px] text-slate-500">
              Quiet work-ation
            </div>
            <div class="px-4 py-2 bg-white/50 border border-slate-200 rounded-full text-[13px] text-slate-500">
              Romantic getaway
            </div>
          </div>

          {/* Coming soon banner */}
          <div class="bg-accent-violet/10 border border-accent-violet/20 rounded-2xl p-4 text-center mt-4">
            <span class="material-symbols-outlined text-3xl text-accent-violet mb-2">auto_awesome</span>
            <p class="text-sm font-bold text-accent-violet">AI-powered search coming soon</p>
            <p class="text-xs text-slate-500 mt-1">Natural language hotel search with personalized recommendations</p>
          </div>
        </div>
      </main>

      {/* Input area */}
      <footer class="p-6 pb-10 bg-gradient-to-t from-background-light via-background-light to-transparent">
        <div class="relative">
          <div class="absolute inset-0 bg-primary/10 blur-xl rounded-full opacity-50" />
          <div class="relative flex items-center gap-3 bg-white p-2 pl-5 rounded-full shadow-xl border border-slate-100">
            <input
              class="flex-1 bg-transparent border-none focus:ring-0 text-[14px] text-slate-900 placeholder:text-slate-400 py-3 outline-none"
              placeholder="e.g., A luxury hotel in Paris..."
              type="text"
              disabled
            />
            <button class="flex items-center justify-center size-10 rounded-full bg-primary text-white shadow-lg opacity-50">
              <span class="material-symbols-outlined text-[20px]">mic</span>
            </button>
          </div>
        </div>
      </footer>
    </>
  )
}
