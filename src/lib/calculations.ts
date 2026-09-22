import type { AppState, FeeAssumptions, Lot, TaxAssumptions } from '../types'

/** Shares vested as of a given date (defaults to today), derived from the vesting schedule. */
export function vestedSharesAsOf(lot: Lot, asOfISO: string = new Date().toISOString().slice(0, 10)): number {
  return lot.vestingSchedule.filter((e) => e.date <= asOfISO).reduce((s, e) => s + e.shares, 0)
}

export interface LotPosition {
  lot: Lot
  vestedShares: number
  totalCost: number
  vestedCost: number
  totalProceeds: number
  vestedProceeds: number
  totalPL: number
  vestedPL: number
}

export function computePositions(lots: Lot[], salePrice: number): LotPosition[] {
  return lots.map((lot) => {
    const vestedShares = vestedSharesAsOf(lot)
    const totalCost = lot.strike * lot.totalShares
    const vestedCost = lot.strike * vestedShares
    const totalProceeds = salePrice * lot.totalShares
    const vestedProceeds = salePrice * vestedShares
    return {
      lot,
      vestedShares,
      totalCost,
      vestedCost,
      totalProceeds,
      vestedProceeds,
      totalPL: totalProceeds - totalCost,
      vestedPL: vestedProceeds - vestedCost,
    }
  })
}

export function sumPositions(positions: LotPosition[]) {
  return positions.reduce(
    (acc, p) => ({
      totalShares: acc.totalShares + p.lot.totalShares,
      vestedShares: acc.vestedShares + p.vestedShares,
      totalCost: acc.totalCost + p.totalCost,
      vestedCost: acc.vestedCost + p.vestedCost,
      totalProceeds: acc.totalProceeds + p.totalProceeds,
      vestedProceeds: acc.vestedProceeds + p.vestedProceeds,
      totalPL: acc.totalPL + p.totalPL,
      vestedPL: acc.vestedPL + p.vestedPL,
    }),
    {
      totalShares: 0,
      vestedShares: 0,
      totalCost: 0,
      vestedCost: 0,
      totalProceeds: 0,
      vestedProceeds: 0,
      totalPL: 0,
      vestedPL: 0,
    },
  )
}

/** Weighted average strike price across all shares (not just vested). */
export function weightedAvgStrike(lots: Lot[]): number {
  const totalShares = lots.reduce((s, l) => s + l.totalShares, 0)
  if (totalShares === 0) return 0
  const weighted = lots.reduce((s, l) => s + l.strike * l.totalShares, 0)
  return weighted / totalShares
}

export interface SaleLotResult {
  lot: Lot
  sold: number
  remainingVested: number
  remainingTotal: number
  exerciseCost: number
  proceeds: number
  pl: number
}

export interface SaleSummary {
  perLot: SaleLotResult[]
  sharesSold: number
  exerciseCost: number
  grossProceeds: number
  grossProfit: number
  feePercentAmount: number
  totalFees: number
  netPreTaxProfit: number
}

export function computeSale(
  lots: Lot[],
  sharesSold: Record<string, number>,
  salePrice: number,
  fees: FeeAssumptions,
): SaleSummary {
  const perLot: SaleLotResult[] = lots.map((lot) => {
    const vestedShares = vestedSharesAsOf(lot)
    const sold = Math.min(Math.max(sharesSold[lot.id] ?? 0, 0), vestedShares)
    const exerciseCost = sold * lot.strike
    const proceeds = sold * salePrice
    return {
      lot,
      sold,
      remainingVested: vestedShares - sold,
      remainingTotal: lot.totalShares - sold,
      exerciseCost,
      proceeds,
      pl: proceeds - exerciseCost,
    }
  })

  const totalSold = perLot.reduce((s, r) => s + r.sold, 0)
  const exerciseCost = perLot.reduce((s, r) => s + r.exerciseCost, 0)
  const grossProceeds = perLot.reduce((s, r) => s + r.proceeds, 0)
  const grossProfit = grossProceeds - exerciseCost

  const feePercentAmount = grossProceeds * (fees.percent / 100)
  const totalFees = feePercentAmount

  return {
    perLot,
    sharesSold: totalSold,
    exerciseCost,
    grossProceeds,
    grossProfit,
    feePercentAmount,
    totalFees,
    netPreTaxProfit: grossProfit - totalFees,
  }
}

/** Combined effective tax rate (as a fraction, e.g. 0.35) across all configured tax components. */
export function totalTaxRate(taxes: TaxAssumptions): number {
  return (
    (taxes.federalRate +
      taxes.stateRate +
      taxes.medicareRate +
      taxes.additionalMedicareRate +
      taxes.oasdiRate +
      taxes.caSdiRate +
      taxes.otherRate) /
    100
  )
}

/** Applies the combined tax rate to a profit figure; losses are left untaxed, matching computeTax. */
export function applyTax(pl: number, taxes: TaxAssumptions): number {
  return pl - Math.max(pl, 0) * totalTaxRate(taxes)
}

export interface TaxSummary {
  grossProceeds: number
  exerciseCost: number
  fees: number
  preTaxProfit: number
  federalTax: number
  stateTax: number
  medicareTax: number
  additionalMedicareTax: number
  oasdiTax: number
  caSdiTax: number
  otherTax: number
  totalTax: number
  postTaxProfit: number
  netCashProceeds: number
}

export function computeTax(sale: SaleSummary, taxes: TaxAssumptions): TaxSummary {
  const preTaxProfit = sale.netPreTaxProfit
  const rate = (r: number) => Math.max(preTaxProfit, 0) * (r / 100)
  const federalTax = rate(taxes.federalRate)
  const stateTax = rate(taxes.stateRate)
  const medicareTax = rate(taxes.medicareRate)
  const additionalMedicareTax = rate(taxes.additionalMedicareRate)
  const oasdiTax = rate(taxes.oasdiRate)
  const caSdiTax = rate(taxes.caSdiRate)
  const otherTax = rate(taxes.otherRate)
  const totalTax = federalTax + stateTax + medicareTax + additionalMedicareTax + oasdiTax + caSdiTax + otherTax
  const postTaxProfit = preTaxProfit - totalTax
  const netCashProceeds = sale.grossProceeds - sale.exerciseCost - sale.totalFees - totalTax

  return {
    grossProceeds: sale.grossProceeds,
    exerciseCost: sale.exerciseCost,
    fees: sale.totalFees,
    preTaxProfit,
    federalTax,
    stateTax,
    medicareTax,
    additionalMedicareTax,
    oasdiTax,
    caSdiTax,
    otherTax,
    totalTax,
    postTaxProfit,
    netCashProceeds,
  }
}

export interface MonthlyVesting {
  month: string // "2026-08"
  label: string // "Aug 2026"
  shares: number
  exerciseCost: number
  saleValue: number
  grossProfit: number
  postTaxProfit: number
}

export function computeMonthlyVesting(
  lots: Lot[],
  salePrice: number,
  taxes: TaxAssumptions,
): MonthlyVesting[] {
  const byMonth = new Map<string, { shares: number; cost: number }>()

  for (const lot of lots) {
    for (const event of lot.vestingSchedule) {
      const month = event.date.slice(0, 7)
      const entry = byMonth.get(month) ?? { shares: 0, cost: 0 }
      entry.shares += event.shares
      entry.cost += event.shares * lot.strike
      byMonth.set(month, entry)
    }
  }

  const totalRate =
    (taxes.federalRate +
      taxes.stateRate +
      taxes.medicareRate +
      taxes.additionalMedicareRate +
      taxes.oasdiRate +
      taxes.caSdiRate +
      taxes.otherRate) /
    100
  const currentMonth = new Date().toISOString().slice(0, 7)

  return Array.from(byMonth.entries())
    .filter(([month]) => month >= currentMonth)
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([month, { shares, cost }]) => {
      const saleValue = shares * salePrice
      const grossProfit = saleValue - cost
      const postTaxProfit = grossProfit * (1 - totalRate)
      const [y, m] = month.split('-').map(Number)
      const label = new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      })
      return { month, label, shares, exerciseCost: cost, saleValue, grossProfit, postTaxProfit }
    })
}

export const PRICE_SCENARIOS = [
  { label: 'Bear', price: 75 },
  { label: 'Low', price: 90 },
  { label: 'Current', price: 110 },
  { label: 'High', price: 125 },
  { label: 'Bull', price: 150 },
]

export function computeSensitivity(state: AppState, prices: number[]) {
  return prices.map((price) => {
    const positions = computePositions(state.lots, price)
    const totals = sumPositions(positions)
    const sale = computeSale(
      state.lots,
      state.lots.reduce((acc, l) => ({ ...acc, [l.id]: vestedSharesAsOf(l) }), {} as Record<string, number>),
      price,
      state.fees,
    )
    const tax = computeTax(sale, state.taxes)
    return {
      price,
      vestedValue: totals.vestedProceeds,
      vestedPL: totals.vestedPL,
      postTaxPL: tax.postTaxProfit,
    }
  })
}
