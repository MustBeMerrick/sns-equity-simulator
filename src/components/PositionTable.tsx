import { sumPositions, type LotPosition } from '../lib/calculations'
import { fmtNumber, fmtUSD } from '../lib/format'

interface Props {
  positions: LotPosition[]
  totals: ReturnType<typeof sumPositions>
  avgStrike: number
}

function PL({ value }: { value: number }) {
  return (
    <span className={value >= 0 ? 'text-emerald-600' : 'text-red-600'}>{fmtUSD(value)}</span>
  )
}

const groupDivider = 'border-l border-slate-200'

export function PositionTable({ positions, totals, avgStrike }: Props) {
  return (
    <section className="card">
      <div className="card-header">
        <span className="w-6 h-6 rounded-full bg-accent-100 text-accent-700 text-xs flex items-center justify-center">
          1
        </span>
        Position / Lot Overview
      </div>
      {positions.length === 0 ? (
        <p className="px-5 py-6 text-sm text-slate-500">Add a lot above to see your position summary.</p>
      ) : (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th rowSpan={2} className="align-bottom">Lot</th>
              <th rowSpan={2} className="align-bottom">Strike</th>
              <th colSpan={4} className={`text-center ${groupDivider}`}>Total</th>
              <th colSpan={4} className={`text-center ${groupDivider}`}>Vested</th>
            </tr>
            <tr>
              <th>Shares</th>
              <th>Cost</th>
              <th>Proceeds</th>
              <th>P/L</th>
              <th className={groupDivider}>Shares</th>
              <th>Cost</th>
              <th>Proceeds</th>
              <th>P/L</th>
            </tr>
          </thead>
          <tbody>
            {positions.map(({ lot, vestedShares, totalCost, vestedCost, totalProceeds, vestedProceeds, totalPL, vestedPL }) => (
              <tr key={lot.id} className="border-t border-slate-100">
                <td className="font-medium">{lot.label}</td>
                <td>${lot.strike.toFixed(2)}</td>
                <td>{fmtNumber(lot.totalShares)}</td>
                <td>{fmtUSD(totalCost)}</td>
                <td>{fmtUSD(totalProceeds)}</td>
                <td>
                  <PL value={totalPL} />
                </td>
                <td className={groupDivider}>{fmtNumber(vestedShares)}</td>
                <td>{fmtUSD(vestedCost)}</td>
                <td>{fmtUSD(vestedProceeds)}</td>
                <td>
                  <PL value={vestedPL} />
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-slate-200 font-semibold bg-slate-50">
              <td>TOTAL</td>
              <td>${avgStrike.toFixed(2)} avg</td>
              <td>{fmtNumber(totals.totalShares)}</td>
              <td>{fmtUSD(totals.totalCost)}</td>
              <td>{fmtUSD(totals.totalProceeds)}</td>
              <td>
                <PL value={totals.totalPL} />
              </td>
              <td className={groupDivider}>{fmtNumber(totals.vestedShares)}</td>
              <td>{fmtUSD(totals.vestedCost)}</td>
              <td>{fmtUSD(totals.vestedProceeds)}</td>
              <td>
                <PL value={totals.vestedPL} />
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
      )}
    </section>
  )
}
