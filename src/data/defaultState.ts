import type { AppState } from '../types'

export const defaultState: AppState = {
  salePrice: 110,
  lots: [],
  sharesSold: {},
  fees: { percent: 2.5 },
  taxes: {
    federalRate: 37,
    stateRate: 13.3,
    medicareRate: 1.45,
    additionalMedicareRate: 0.9,
    oasdiRate: 0,
    caSdiRate: 1.3,
    otherRate: 0,
    model: 'simple',
  },
}
