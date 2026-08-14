import { PRICE_SCENARIOS } from '../lib/calculations'

interface Props {
  salePrice: number
  onSelect: (price: number) => void
}

export function QuickScenarios({ salePrice, onSelect }: Props) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-slate-500 mb-1.5">Quick Scenarios</div>
      <div className="grid grid-cols-5 gap-1">
        {PRICE_SCENARIOS.map((s) => {
          const active = s.price === Math.round(salePrice)
          return (
            <button
              key={s.label}
              onClick={() => onSelect(s.price)}
              title={s.label}
              className={`flex flex-col items-center px-1 py-1.5 rounded-md border text-xs transition-colors ${
                active
                  ? 'bg-accent-600 border-accent-600 text-white'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-accent-300'
              }`}
            >
              <span className="font-semibold">${s.price}</span>
              <span className={`text-[9px] uppercase ${active ? 'text-accent-100' : 'text-slate-400'}`}>
                {s.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
