import { useEffect, useState } from 'react'
import { QuickScenarios } from './QuickScenarios'

interface Props {
  salePrice: number
  onChange: (price: number) => void
}

export function SalePricePanel({ salePrice, onChange }: Props) {
  const [draft, setDraft] = useState(String(salePrice))
  // Follow external changes (slider, quick scenarios) without clobbering in-progress typing.
  useEffect(() => {
    setDraft((d) => (Number(d) === salePrice ? d : String(salePrice)))
  }, [salePrice])

  // Move to the next whole dollar in the given direction.
  const step = (dir: 1 | -1) => onChange(dir > 0 ? Math.floor(salePrice) + 1 : Math.ceil(salePrice) - 1)

  return (
    <div className="fixed top-4 right-4 z-40 card px-5 py-3 w-[272px] shadow-lg">
      <div className="text-xs uppercase tracking-wide text-slate-500 mb-1">Sale Price (per share)</div>
      <div className="flex items-center gap-3">
        <span className="text-2xl font-bold text-accent-700">$</span>
        <input
          type="text"
          inputMode="decimal"
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value)
            const next = Number(e.target.value)
            if (e.target.value.trim() !== '' && Number.isFinite(next)) onChange(next)
          }}
          onBlur={() => setDraft(String(salePrice))}
          onKeyDown={(e) => {
            if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
              e.preventDefault()
              step(e.key === 'ArrowUp' ? 1 : -1)
            }
          }}
          className="!text-2xl !font-bold !text-accent-700 !border-0 !px-0 w-32"
        />
        <div className="flex flex-col -ml-2">
          <button type="button" aria-label="Increase price" onClick={() => step(1)} className="text-xs leading-none text-slate-400 hover:text-accent-700">▲</button>
          <button type="button" aria-label="Decrease price" onClick={() => step(-1)} className="text-xs leading-none text-slate-400 hover:text-accent-700">▼</button>
        </div>
      </div>
      <input
        type="range"
        min={25}
        max={600}
        step={1}
        value={salePrice}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full mt-2 accent-accent-600"
      />
      <div className="flex justify-between text-xs text-slate-400 mb-3">
        <span>$25</span>
        <span>$300</span>
        <span>$600</span>
      </div>

      <div className="pt-3 border-t border-slate-100">
        <QuickScenarios salePrice={salePrice} onSelect={onChange} />
      </div>
    </div>
  )
}
