import { useMemo } from 'react'
import type { Lot, LotId } from './types'
import { useAppState, resetState } from './hooks/useAppState'
import {
  computePositions,
  computeSale,
  computeSensitivity,
  computeTax,
  computeMonthlyVesting,
  sumPositions,
  weightedAvgStrike,
  vestedSharesAsOf,
  applyTax,
  PRICE_SCENARIOS,
} from './lib/calculations'

import { Header } from './components/Header'
import { SalePricePanel } from './components/SalePricePanel'
import { SummaryCards } from './components/SummaryCards'
import { LotsManager } from './components/LotsManager'
import { PositionTable } from './components/PositionTable'
import { SaleSimulator } from './components/SaleSimulator'
import { TaxEstimate } from './components/TaxEstimate'
import { VestingSimulator } from './components/VestingSimulator'
import { SensitivityTable } from './components/SensitivityTable'

export default function App() {
  const [state, setState] = useAppState()

  const positions = useMemo(() => computePositions(state.lots, state.salePrice), [state.lots, state.salePrice])
  const totals = useMemo(() => sumPositions(positions), [positions])
  const avgStrike = useMemo(() => weightedAvgStrike(state.lots), [state.lots])

  const sale = useMemo(
    () => computeSale(state.lots, state.sharesSold, state.salePrice, state.fees),
    [state.lots, state.sharesSold, state.salePrice, state.fees],
  )
  const tax = useMemo(() => computeTax(sale, state.taxes, state.fees), [sale, state.taxes, state.fees])
  const months = useMemo(
    () => computeMonthlyVesting(state.lots, state.salePrice, state.taxes),
    [state.lots, state.salePrice, state.taxes],
  )
  const sensitivity = useMemo(
    () => computeSensitivity(state, PRICE_SCENARIOS.map((s) => s.price)),
    [state],
  )

  return (
    // sm:pr-[300px] reserves room for the fixed SalePricePanel so it never overlaps
    // the centered content column, regardless of window width.
    <div className="min-h-screen sm:pr-[300px]">
      <SalePricePanel salePrice={state.salePrice} onChange={(salePrice) => setState((s) => ({ ...s, salePrice }))} />

      <div className="px-4 py-6 sm:px-8 max-w-6xl mx-auto flex flex-col gap-6">
        <Header />

        <SummaryCards
          totalShares={totals.totalShares}
          vestedShares={totals.vestedShares}
          totalPL={totals.totalPL}
          vestedPL={totals.vestedPL}
          totalPostTaxPL={applyTax(totals.totalPL, state.taxes)}
          vestedPostTaxPL={applyTax(totals.vestedPL, state.taxes)}
          totalProceeds={totals.totalProceeds}
          vestedProceeds={totals.vestedProceeds}
          totalCostBasis={totals.totalCost}
          vestedCostBasis={totals.vestedCost}
        />

        <LotsManager
          lots={state.lots}
          onAdd={(lot: Lot) =>
            setState((s) => ({ ...s, lots: [...s.lots, lot], sharesSold: { ...s.sharesSold, [lot.id]: 0 } }))
          }
          onUpdate={(lot: Lot) =>
            setState((s) => ({ ...s, lots: s.lots.map((l) => (l.id === lot.id ? lot : l)) }))
          }
          onDelete={(id: string) =>
            setState((s) => {
              const { [id]: _removed, ...restSold } = s.sharesSold
              return { ...s, lots: s.lots.filter((l) => l.id !== id), sharesSold: restSold }
            })
          }
        />

        <PositionTable positions={positions} totals={totals} avgStrike={avgStrike} />

        <SaleSimulator
          lots={state.lots}
          sharesSold={state.sharesSold}
          onChangeSold={(id: LotId, value: number) =>
            setState((s) => ({ ...s, sharesSold: { ...s.sharesSold, [id]: value } }))
          }
          onSellAllVested={() =>
            setState((s) => ({
              ...s,
              sharesSold: Object.fromEntries(s.lots.map((l) => [l.id, vestedSharesAsOf(l)])) as Record<
                LotId,
                number
              >,
            }))
          }
          onClear={() =>
            setState((s) => ({
              ...s,
              sharesSold: Object.fromEntries(s.lots.map((l) => [l.id, 0])) as Record<LotId, number>,
            }))
          }
          fees={state.fees}
          onChangeFees={(fees) => setState((s) => ({ ...s, fees }))}
          sale={sale}
        />

        <TaxEstimate taxes={state.taxes} onChange={(taxes) => setState((s) => ({ ...s, taxes }))} tax={tax} />

        <VestingSimulator months={months} salePrice={state.salePrice} />

        <SensitivityTable rows={sensitivity} currentPrice={state.salePrice} />

        <footer className="text-center text-xs text-slate-400 py-4 flex flex-col items-center gap-2">
          <p>All amounts are estimates for informational purposes only. Consult your tax advisor.</p>
          {state.lots.length > 0 && (
            <button
              onClick={() => {
                if (confirm('Remove all lots and reset every input? This cannot be undone.')) {
                  resetState(setState)
                }
              }}
              className="underline hover:text-slate-600"
            >
              Clear all lots
            </button>
          )}
        </footer>
      </div>
    </div>
  )
}
