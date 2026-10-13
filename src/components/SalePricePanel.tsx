import { QuickScenarios } from './QuickScenarios'

interface Props {
  salePrice: number
  onChange: (price: number) => void
}

export function SalePricePanel({ salePrice, onChange }: Props) {
  return (
    <div className="fixed top-4 right-4 z-40 card px-5 py-3 w-[272px] shadow-lg">
      <div className="text-xs uppercase tracking-wide text-slate-500 mb-1">Sale Price (per share)</div>
      <div className="flex items-center gap-3">
        <span className="text-2xl font-bold text-accent-700">$</span>
        <input
          type="number"
          step="1"
          value={salePrice}
          onChange={(e) => {
            const next = Number(e.target.value)
            // A spinner/arrow step moves a fractional price by exactly 1; snap it to a whole dollar.
            const isStep = !Number.isInteger(salePrice) && Math.abs(next - salePrice - Math.sign(next - salePrice)) < 1e-9
            if (!isStep) onChange(next)
            else onChange(next > salePrice ? Math.floor(salePrice) + 1 : Math.ceil(salePrice) - 1)
          }}
          className="!text-2xl !font-bold !text-accent-700 !border-0 !px-0 w-32"
        />
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
