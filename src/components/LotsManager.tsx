import { useState } from 'react'
import type { Lot } from '../types'
import { vestedSharesAsOf } from '../lib/calculations'
import { fmtNumber } from '../lib/format'
import { LotForm } from './LotForm'

interface Props {
  lots: Lot[]
  onAdd: (lot: Lot) => void
  onUpdate: (lot: Lot) => void
  onDelete: (id: string) => void
}

function nextLabel(lots: Lot[]): string {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  for (const letter of letters) {
    const label = `Lot ${letter}`
    if (!lots.some((l) => l.label === label)) return label
  }
  return `Lot ${lots.length + 1}`
}

export function LotsManager({ lots, onAdd, onUpdate, onDelete }: Props) {
  const [mode, setMode] = useState<'closed' | 'add' | string>('closed')

  return (
    <section className="card">
      <div className="card-header justify-between">
        <span>Your Lots</span>
        {mode === 'closed' && (
          <button
            onClick={() => setMode('add')}
            className="px-3 py-1.5 text-sm rounded-md bg-accent-600 text-white hover:bg-accent-700"
          >
            + Add Lot
          </button>
        )}
      </div>

      <div className="p-5 flex flex-col gap-3">
        {lots.length === 0 && mode === 'closed' && (
          <p className="text-sm text-slate-500">
            No lots yet. Add your first grant — strike price, share quantity, and vesting schedule — to get
            started.
          </p>
        )}

        {lots.map((lot) =>
          mode === lot.id ? (
            <LotForm
              key={lot.id}
              initial={lot}
              nextLabel={lot.label}
              onSave={(updated) => {
                onUpdate(updated)
                setMode('closed')
              }}
              onCancel={() => setMode('closed')}
            />
          ) : (
            <div
              key={lot.id}
              className="flex items-center justify-between border border-slate-200 rounded-lg px-4 py-2.5"
            >
              <div className="flex items-center gap-6 text-sm">
                <span className="font-medium w-20">{lot.label}</span>
                <span className="text-slate-500">Strike ${lot.strike.toFixed(2)}</span>
                <span className="text-slate-500">{fmtNumber(lot.totalShares)} shares</span>
                <span className="text-slate-500">{fmtNumber(vestedSharesAsOf(lot))} vested</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setMode(lot.id)}
                  className="text-xs text-accent-700 hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(lot.id)}
                  className="text-xs text-slate-400 hover:text-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ),
        )}

        {mode === 'add' && (
          <LotForm
            nextLabel={nextLabel(lots)}
            onSave={(lot) => {
              onAdd(lot)
              setMode('closed')
            }}
            onCancel={() => setMode('closed')}
          />
        )}
      </div>
    </section>
  )
}
