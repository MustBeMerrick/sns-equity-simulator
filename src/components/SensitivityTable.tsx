import { fmtUSD } from '../lib/format'

interface Row {
  price: number
  vestedValue: number
  vestedPL: number
  postTaxPL: number
}

interface Props {
  rows: Row[]
  currentPrice: number
}

export function SensitivityTable({ rows, currentPrice }: Props) {
  return (
    <section className="card">
      <div className="card-header">Price Sensitivity (Vested Shares)</div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th>Sale Price</th>
              <th>Vested Value</th>
              <th>Vested P/L (Pre-Tax)</th>
              <th>Post-Tax P/L</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.price}
                className={`border-t border-slate-100 ${
                  Math.round(r.price) === Math.round(currentPrice) ? 'bg-accent-50 font-semibold' : ''
                }`}
              >
                <td>${r.price}</td>
                <td>{fmtUSD(r.vestedValue, { compact: true })}</td>
                <td>{fmtUSD(r.vestedPL, { compact: true })}</td>
                <td>{fmtUSD(r.postTaxPL, { compact: true })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
