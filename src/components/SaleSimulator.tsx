import type { Lot, LotId, FeeAssumptions } from '../types'
import { vestedSharesAsOf, type SaleSummary } from '../lib/calculations'
import { fmtNumber, fmtUSD } from '../lib/format'
import { selectOnZero } from '../lib/inputHelpers'

interface Props {
  lots: Lot[]
  sharesSold: Record<LotId, number>
  onChangeSold: (id: LotId, value: number) => void
  onSellAllVested: () => void
  onClear: () => void
  fees: FeeAssumptions
  onChangeFees: (fees: FeeAssumptions) => void
  sale: SaleSummary
}

export function SaleSimulator({
  lots,
  sharesSold,
  onChangeSold,
  onSellAllVested,
  onClear,
  fees,
  onChangeFees,
  sale,
}: Props) {
  return (
    <section className="card">
      <div className="card-header">
        <span className="w-6 h-6 rounded-full bg-accent-100 text-accent-700 text-xs flex items-center justify-center">
          2
        </span>
        Sale / Exercise Simulator
      </div>

      {lots.length === 0 ? (
        <p className="px-5 py-6 text-sm text-slate-500">Add a lot above to start simulating a sale.</p>
      ) : (
      <div className="grid lg:grid-cols-2 gap-6 p-5">
        {/* Inputs */}
        <div>
          <table className="w-full">
            <thead>
              <tr>
                <th>Lot</th>
                <th>Available (Vested)</th>
                <th>Sell Shares</th>
              </tr>
            </thead>
            <tbody>
              {lots.map((lot) => {
                const vested = vestedSharesAsOf(lot)
                return (
                  <tr key={lot.id} className="border-t border-slate-100">
                    <td className="font-medium">{lot.label}</td>
                    <td>{fmtNumber(vested)}</td>
                    <td>
                      <input
                        type="number"
                        min={0}
                        max={vested}
                        value={sharesSold[lot.id] ?? 0}
                        onChange={(e) => onChangeSold(lot.id, Number(e.target.value))}
                        onFocus={selectOnZero}
                        className="w-28"
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          <div className="flex gap-2 mt-4">
            <button
              onClick={onSellAllVested}
              className="px-3 py-1.5 text-sm rounded-md border border-accent-300 text-accent-700 hover:bg-accent-50"
            >
              Sell All Vested
            </button>
            <button
              onClick={onClear}
              className="px-3 py-1.5 text-sm rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              Clear
            </button>
          </div>

          <div className="mt-5 flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm text-slate-600">
              Fee %
              <input
                type="number"
                step="0.1"
                value={fees.percent}
                onChange={(e) => onChangeFees({ ...fees, percent: Number(e.target.value) })}
                className="w-20"
              />
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={fees.deductBeforeTax}
                onChange={(e) => onChangeFees({ ...fees, deductBeforeTax: e.target.checked })}
              />
              Deduct fees before tax
            </label>
          </div>
        </div>

        {/* Transaction summary */}
        <div className="flex flex-col gap-2 text-sm">
          <Row label="Shares Sold" value={fmtNumber(sale.sharesSold)} />
          <Row label="Exercise Cost" value={fmtUSD(sale.exerciseCost)} />
          <Row label="Gross Proceeds" value={fmtUSD(sale.grossProceeds)} />
          <hr className="border-slate-200" />
          <Row label="Gross Profit" value={fmtUSD(sale.grossProfit)} bold />
          <hr className="border-slate-200" />
          <Row label={`Fee (${fees.percent}%)`} value={fmtUSD(sale.feePercentAmount)} bold />
          <hr className="border-slate-200" />
          <Row label="NET PRE-TAX PROFIT" value={fmtUSD(sale.netPreTaxProfit)} bold accent />
        </div>
      </div>
      )}

      {/* Per-lot breakdown */}
      {lots.length > 0 && (
      <div className="overflow-x-auto border-t border-slate-100">
        <table className="w-full">
          <thead>
            <tr>
              <th>Lot</th>
              <th>Sold</th>
              <th>Remaining Vested</th>
              <th>Remaining Total</th>
              <th>Exercise Cost</th>
              <th>Proceeds</th>
              <th>P/L</th>
            </tr>
          </thead>
          <tbody>
            {sale.perLot.map((r) => (
              <tr key={r.lot.id} className="border-t border-slate-100">
                <td className="font-medium">{r.lot.label}</td>
                <td>{fmtNumber(r.sold)}</td>
                <td>{fmtNumber(r.remainingVested)}</td>
                <td>{fmtNumber(r.remainingTotal)}</td>
                <td>{r.sold ? fmtUSD(r.exerciseCost) : '—'}</td>
                <td>{r.sold ? fmtUSD(r.proceeds) : '—'}</td>
                <td className={r.sold ? (r.pl >= 0 ? 'text-emerald-600' : 'text-red-600') : ''}>
                  {r.sold ? fmtUSD(r.pl) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}
    </section>
  )
}

function Row({
  label,
  value,
  bold,
  accent,
}: {
  label: string
  value: string
  bold?: boolean
  accent?: boolean
}) {
  return (
    <div className="flex justify-between">
      <span className={bold ? 'font-semibold' : 'text-slate-500'}>{label}</span>
      <span className={`${bold ? 'font-semibold' : ''} ${accent ? 'text-accent-700 text-base' : ''}`}>
        {value}
      </span>
    </div>
  )
}
