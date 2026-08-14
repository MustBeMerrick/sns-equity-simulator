export type LotId = string

export interface VestEvent {
  /** ISO date, first of month, e.g. "2026-09-01" */
  date: string
  shares: number
}

export interface Lot {
  id: LotId
  label: string
  strike: number
  totalShares: number
  /** Every vesting event (past and future) — vested-to-date is derived from this, not stored separately */
  vestingSchedule: VestEvent[]
}

export type TaxModel = 'simple' | 'detailed'

export interface TaxAssumptions {
  federalRate: number // percent, e.g. 37
  stateRate: number
  medicareRate: number
  additionalMedicareRate: number
  oasdiRate: number // Social Security
  caSdiRate: number
  otherRate: number
  model: TaxModel
}

export interface FeeAssumptions {
  percent: number // percent of gross proceeds
  flat: number // flat dollar fee
}

export interface AppState {
  salePrice: number
  lots: Lot[]
  sharesSold: Record<LotId, number>
  fees: FeeAssumptions
  taxes: TaxAssumptions
}
