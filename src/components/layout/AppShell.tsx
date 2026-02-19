import type { ComponentChildren } from 'preact'

export function AppShell({ children }: { children: ComponentChildren }) {
  return (
    <div class="mx-auto w-full max-w-[430px] h-[100dvh] overflow-hidden relative bg-background-light flex flex-col shadow-2xl">
      {children}
    </div>
  )
}
