import type { VestEvent } from '../types'

function toISODate(year: number, monthIndex0: number, day: number): string {
  return new Date(Date.UTC(year, monthIndex0, day)).toISOString().slice(0, 10)
}

/** Adds `months` to a "YYYY-MM-DD" date, clamping the day if the target month is shorter. */
export function addMonthsClamped(dateISO: string, months: number): string {
  const [y, m, d] = dateISO.split('-').map(Number)
  const targetMonthIndex0 = m - 1 + months
  const targetYear = y + Math.floor(targetMonthIndex0 / 12)
  const targetMonth0 = ((targetMonthIndex0 % 12) + 12) % 12
  const lastDayOfTargetMonth = new Date(Date.UTC(targetYear, targetMonth0 + 1, 0)).getUTCDate()
  return toISODate(targetYear, targetMonth0, Math.min(d, lastDayOfTargetMonth))
}

/**
 * Standard cliff + even-monthly vesting (e.g. 4yr total / 1yr cliff).
 * Every vest event lands on the same day-of-month as the vesting start date
 * (clamped for short months), matching how cap-table tools like Carta vest.
 * The cliff month gets the pro-rated lump sum; remaining shares are split
 * evenly across the remaining months, with any rounding remainder pushed
 * into the final month so the schedule always sums to totalShares exactly.
 */
export function generateStandardVesting(
  totalShares: number,
  startDate: string, // "YYYY-MM-DD"
  cliffMonths: number,
  totalMonths: number,
): VestEvent[] {
  if (totalShares <= 0 || totalMonths <= 0) return []
  const events: VestEvent[] = []

  // Cliff lands exactly `cliffMonths` after the vesting start (e.g. Aug 15 2022 start + 12mo cliff = Aug 15 2023).
  const cliffShares = cliffMonths > 0 ? Math.round((totalShares * cliffMonths) / totalMonths) : 0
  if (cliffMonths > 0) {
    events.push({ date: addMonthsClamped(startDate, cliffMonths), shares: cliffShares })
  }

  const remainingMonths = totalMonths - cliffMonths
  const remainingShares = totalShares - cliffShares
  if (remainingMonths > 0) {
    const base = Math.floor(remainingShares / remainingMonths)
    let allocated = 0
    for (let i = 1; i <= remainingMonths; i++) {
      const isLast = i === remainingMonths
      const shares = isLast ? remainingShares - allocated : base
      allocated += shares
      events.push({ date: addMonthsClamped(startDate, cliffMonths + i), shares })
    }
  }

  return events
}

function splitColumns(line: string): string[] {
  if (line.includes('\t')) {
    return line
      .split('\t')
      .map((c) => c.trim())
      .filter(Boolean)
  }
  const bySpaces = line
    .split(/\s{2,}/)
    .map((c) => c.trim())
    .filter(Boolean)
  if (bySpaces.length >= 2) return bySpaces
  // Single-spaced fallback, e.g. "2024-08-15, 208" — split right before the trailing value.
  return line
    .split(/,(?=\s*[A-Za-z0-9$])/)
    .map((c) => c.trim())
    .filter(Boolean)
}

/**
 * Parses vesting rows pasted from a cap-table tool like Carta. Handles both:
 *  - a simple two-column paste, e.g. "Aug 15, 2024   208"
 *  - Carta's full vesting-schedule export, e.g.
 *      "1   Oct 18, 2022   1,625   1,625   0"
 *      (period, vesting date, options vested, cumulative vested, exercised qty)
 * Column count decides which fields are the date and the per-period share
 * count; cumulative/exercised columns are ignored. Exact pasted days are
 * preserved (not snapped to the 1st of the month).
 */
export function parsePastedVesting(text: string): VestEvent[] {
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)

  const events: VestEvent[] = []

  for (const line of lines) {
    const cols = splitColumns(line)

    let dateStr: string
    let sharesStr: string
    if (cols.length >= 4) {
      // period, date, vested, cumulative, [exercised] — Carta's full schedule export.
      ;[, dateStr, sharesStr] = cols
    } else if (cols.length === 3) {
      // date, vested, cumulative (no period column)
      ;[dateStr, sharesStr] = cols
    } else if (cols.length === 2) {
      ;[dateStr, sharesStr] = cols
    } else {
      continue
    }

    const shares = Number(sharesStr.replace(/[,$]/g, ''))
    if (!shares || Number.isNaN(shares)) continue

    let d = new Date(dateStr)
    if (Number.isNaN(d.getTime())) {
      d = new Date(`${dateStr} 1`)
    }
    if (Number.isNaN(d.getTime())) continue

    events.push({ date: toISODate(d.getFullYear(), d.getMonth(), d.getDate()), shares: Math.round(shares) })
  }

  const merged = new Map<string, number>()
  for (const e of events) merged.set(e.date, (merged.get(e.date) ?? 0) + e.shares)

  return Array.from(merged.entries())
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([date, shares]) => ({ date, shares }))
}

export function sumVesting(events: VestEvent[]): number {
  return events.reduce((s, e) => s + e.shares, 0)
}
