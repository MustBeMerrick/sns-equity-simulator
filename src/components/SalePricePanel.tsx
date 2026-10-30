import { useEffect, useRef, useState, type CSSProperties, type MouseEvent, type PointerEvent } from 'react'
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
  // Value at focus time: restored on Escape or when the field is left empty.
  const original = useRef(salePrice)

  // Move to the next whole dollar in the given direction.
  const step = (dir: 1 | -1) => onChange(dir > 0 ? Math.floor(salePrice) + 1 : Math.ceil(salePrice) - 1)

  // Step on pointerdown, not click: iOS Safari synthesizes the click after touchend and, on rapid
  // alternating taps, can deliver it to the previously tapped arrow. Keyboard activation still
  // arrives as a click with detail === 0, so handle only that case there.
  const arrowProps = (dir: 1 | -1) => ({
    onPointerDown: (e: PointerEvent<HTMLButtonElement>) => {
      if (e.button !== 0) return
      e.preventDefault()
      step(dir)
    },
    onClick: (e: MouseEvent<HTMLButtonElement>) => {
      if (e.detail === 0) step(dir)
    },
  })

  return (
    // Phone: a compact bar pinned to the top of the page. sm+: floating card in the top-right corner.
    <div className="sticky top-0 z-40 card rounded-none border-x-0 border-t-0 px-3 py-2 sm:fixed sm:top-4 sm:right-4 sm:rounded-xl sm:border sm:px-5 sm:py-3 sm:w-[500px] shadow-lg">
      <div className="hidden sm:block text-xs uppercase tracking-wide text-slate-500 mb-1">Sale Price (per share)</div>
      {/* Price and slider share a row on phones, stack on sm+ */}
      <div className="flex items-center gap-3 sm:block">
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Phones: line up with the digits (input's py-1), not the taller digits + "/sh" stack */}
          <span className="self-start mt-[5px] sm:self-auto sm:mt-0 text-2xl font-bold text-accent-700">$</span>
          {/* Phones: a slot at least 3 digits wide (ch in the price's font), so the arrows and the slider
              don't shift across 99 ↔ 100 -- a slider resizing mid-drag flips its value back and forth.
              Inside it, the digits + "/sh" column hugs the "$". sm:contents makes both wrappers no-ops on sm+. */}
          <div className="flex min-w-[3ch] text-2xl font-bold sm:contents">
            <div className="flex flex-col items-center sm:contents">
              <input
                type="text"
                inputMode="decimal"
                value={draft}
                onChange={(e) => {
                  setDraft(e.target.value)
                  const next = Number(e.target.value)
                  if (e.target.value.trim() !== '' && Number.isFinite(next)) onChange(next)
                }}
                // Clear on focus so typing starts a fresh value; empty/invalid on blur falls back to the old one.
                onFocus={() => {
                  original.current = salePrice
                  setDraft('')
                }}
                onBlur={() => {
                  if (draft.trim() === '' || !Number.isFinite(Number(draft))) onChange(original.current)
                  setDraft(String(draft.trim() === '' ? original.current : salePrice))
                }}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                    e.preventDefault()
                    step(e.key === 'ArrowUp' ? 1 : -1)
                  } else if (e.key === 'Escape') {
                    onChange(original.current)
                    setDraft(String(original.current))
                    e.currentTarget.blur()
                  } else if (e.key === 'Enter') {
                    e.currentTarget.blur()
                  }
                }}
                // Phones size the field to its text so "/sh" centers under the digits, not the empty box.
                style={{ '--price-w': `${Math.max(draft.length, 1)}ch` } as CSSProperties}
                className="!text-2xl !font-bold !text-accent-700 !border-0 !px-0 w-[var(--price-w)] sm:w-32"
              />
              <span className="sm:hidden -mt-0.5 text-xs leading-none font-semibold text-slate-400">/sh</span>
            </div>
          </div>
          {/* Phones: each glyph centered in its own fixed tap box with a dead gap between, so a tap near
              the seam can't land on the other arrow; touch-manipulation stops quick taps reading as double-tap zoom.
              No press/hover color on phones (only sm:hover) and no iOS tap highlight: both lingered after rapid taps.
              select-none: the arrows are text glyphs, and rapid taps otherwise start an iOS text selection. */}
          <div className="flex flex-col gap-1 sm:gap-0 -ml-2 select-none [-webkit-touch-callout:none]">
            <button type="button" aria-label="Increase price" {...arrowProps(1)} className="flex items-center justify-center w-9 h-6 sm:w-auto sm:h-auto touch-manipulation [-webkit-tap-highlight-color:transparent] text-xl sm:text-xs leading-none text-slate-400 sm:hover:text-accent-700">▲</button>
            <button type="button" aria-label="Decrease price" {...arrowProps(-1)} className="flex items-center justify-center w-9 h-6 sm:w-auto sm:h-auto touch-manipulation [-webkit-tap-highlight-color:transparent] text-xl sm:text-xs leading-none text-slate-400 sm:hover:text-accent-700">▼</button>
          </div>
        </div>
        <input
          type="range"
          min={25}
          max={600}
          step={1}
          value={salePrice}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 min-w-0 sm:w-full sm:mt-2 accent-accent-600"
        />
      </div>
      <div className="hidden sm:flex justify-between text-xs text-slate-400 mb-3">
        <span>$25</span>
        <span>$300</span>
        <span>$600</span>
      </div>

      <div className="hidden sm:block pt-3 border-t border-slate-100">
        <QuickScenarios salePrice={salePrice} onSelect={onChange} />
      </div>
    </div>
  )
}
