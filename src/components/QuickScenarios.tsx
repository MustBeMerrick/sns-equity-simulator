import { useRef } from 'react'
import { PRICE_SCENARIOS } from '../lib/calculations'
import { Fireworks, type FireworksHandle } from './Fireworks'

interface Props {
  salePrice: number
  onSelect: (price: number) => void
}

export function QuickScenarios({ salePrice, onSelect }: Props) {
  const fireworks = useRef<FireworksHandle>(null)
  return (
    <div>
      <Fireworks ref={fireworks} />
      <div className="text-xs uppercase tracking-wide text-slate-500 mb-1.5">Quick Scenarios</div>
      <div className="grid grid-cols-4 sm:grid-cols-[repeat(6,minmax(0,1fr))_auto] gap-1.5">
        {PRICE_SCENARIOS.map((s, i) => {
          const active = s.price === Math.round(salePrice)
          // On phones the last button spans two cells so 7 buttons fill a 4-column grid; on desktop it sizes to its label.
          const last = i === PRICE_SCENARIOS.length - 1
          return (
            <button
              key={s.label}
              onClick={() => {
                onSelect(s.price)
                if (last) fireworks.current?.launch()
              }}
              title={s.label}
              className={`flex flex-col items-center px-2 py-1.5 rounded-md border text-xs transition-colors ${last ? 'col-span-2 sm:col-span-1 !px-1.5' : ''} ${
                active
                  ? 'bg-accent-600 border-accent-600 text-white'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-accent-300'
              }`}
            >
              <span className="font-semibold">${s.price}</span>
              <span
                className={`uppercase whitespace-nowrap ${last ? 'text-[9px] tracking-tight' : 'text-[10px]'} ${
                  active ? 'text-accent-100' : 'text-slate-400'
                }`}
              >
                {s.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
