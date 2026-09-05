import { fmtNumber, fmtUSD } from '../lib/format'

interface Props {
  totalShares: number
  vestedShares: number
  totalPL: number
  vestedPL: number
  totalPostTaxPL: number
  vestedPostTaxPL: number
  totalProceeds: number
  vestedProceeds: number
  totalCostBasis: number
  vestedCostBasis: number
}

export function SummaryCards({
  totalShares,
  vestedShares,
  totalPL,
  vestedPL,
  totalPostTaxPL,
  vestedPostTaxPL,
  totalProceeds,
  vestedProceeds,
  totalCostBasis,
  vestedCostBasis,
}: Props) {
  const plPositive = totalPL >= 0

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
      <div className="stat-tile">
        <span className="text-xs text-slate-500">Shares</span>
        <span className="text-xl font-bold">{fmtNumber(totalShares)}</span>
        <span className="text-xs text-slate-400">Vested {fmtNumber(vestedShares)}</span>
      </div>
      <div className="stat-tile">
        <span className="text-xs text-slate-500">P/L (Pre-Tax)</span>
        <span className={`text-xl font-bold ${plPositive ? 'text-emerald-600' : 'text-red-600'}`}>
          {fmtUSD(totalPL)}
        </span>
        <span className="text-xs text-slate-400">Vested {fmtUSD(vestedPL)}</span>
      </div>
      <div className="stat-tile">
        <span className="text-xs text-slate-500">P/L (Post-Tax)</span>
        <span className={`text-xl font-bold ${totalPostTaxPL >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
          {fmtUSD(totalPostTaxPL)}
        </span>
        <span className="text-xs text-slate-400">Vested {fmtUSD(vestedPostTaxPL)}</span>
      </div>
      <div className="stat-tile">
        <span className="text-xs text-slate-500">Proceeds</span>
        <span className="text-xl font-bold">{fmtUSD(totalProceeds)}</span>
        <span className="text-xs text-slate-400">Vested {fmtUSD(vestedProceeds)}</span>
      </div>
      <div className="stat-tile">
        <span className="text-xs text-slate-500">Cost Basis</span>
        <span className="text-xl font-bold">{fmtUSD(totalCostBasis)}</span>
        <span className="text-xs text-slate-400">Vested {fmtUSD(vestedCostBasis)}</span>
      </div>
    </div>
  )
}
