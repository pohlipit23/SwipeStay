import type { ComponentChildren } from 'preact'

export function AppShell({ children }: { children: ComponentChildren }) {
  return (
    <div class="mx-auto w-full max-w-[430px] h-[100dvh] overflow-hidden relative flex flex-col bg-gradient-to-b from-white to-azure-100 shadow-[0_0_60px_rgba(14,165,233,0.15)]">
      {children}
    </div>
  )
}
