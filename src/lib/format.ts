export function fmtUSD(value: number, opts: { compact?: boolean } = {}): string {
  if (opts.compact) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value)
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

export function fmtNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(Math.round(value))
}

export function fmtPercent(value: number): string {
  return `${value.toFixed(1)}%`
}
