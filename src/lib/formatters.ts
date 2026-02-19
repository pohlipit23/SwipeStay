export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function formatDateRange(checkIn: string, checkOut: string): string {
  return `${formatDate(checkIn)} – ${formatDate(checkOut)}`
}

export function getNights(checkIn: string, checkOut: string): number {
  const start = new Date(checkIn)
  const end = new Date(checkOut)
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
}

export function getDefaultDates(): { checkIn: string; checkOut: string } {
  const today = new Date()
  const checkIn = new Date(today)
  checkIn.setDate(today.getDate() + 30)
  const checkOut = new Date(checkIn)
  checkOut.setDate(checkIn.getDate() + 2)
  return {
    checkIn: checkIn.toISOString().split('T')[0],
    checkOut: checkOut.toISOString().split('T')[0],
  }
}

export function starArray(rating: number): boolean[] {
  return Array.from({ length: 5 }, (_, i) => i < Math.round(rating))
}
