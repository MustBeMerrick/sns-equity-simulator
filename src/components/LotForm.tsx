import { useState } from 'react'
import type { Lot, VestEvent } from '../types'
import { addMonthsClamped, generateStandardVesting, parsePastedVesting, sumVesting } from '../lib/vesting'
import { fmtNumber } from '../lib/format'
import { selectOnZero } from '../lib/inputHelpers'

type Method = 'standard' | 'paste' | 'manual'

interface Props {
  initial?: Lot
  nextLabel: string
  onSave: (lot: Lot) => void
  onCancel: () => void
}

const todayISO = new Date().toISOString().slice(0, 10)

export function LotForm({ initial, nextLabel, onSave, onCancel }: Props) {
  const [label, setLabel] = useState(initial?.label ?? nextLabel)
  const [strike, setStrike] = useState(initial?.strike ?? 0)
  const [totalShares, setTotalShares] = useState(initial?.totalShares ?? 0)
  const [schedule, setSchedule] = useState<VestEvent[]>(initial?.vestingSchedule ?? [])

  const [method, setMethod] = useState<Method>('standard')
  const [vestStart, setVestStart] = useState(todayISO)
  const [cliffMonths, setCliffMonths] = useState(12)
  const [totalMonths, setTotalMonths] = useState(48)
  const [pasteText, setPasteText] = useState('')

  const scheduleTotal = sumVesting(schedule)
  const matchesTotal = totalShares > 0 && scheduleTotal === totalShares

  function handleGenerate() {
    setSchedule(generateStandardVesting(totalShares, vestStart, cliffMonths, totalMonths))
  }

  function handleParse() {
    setSchedule(parsePastedVesting(pasteText))
  }

  function updateRow(index: number, patch: Partial<VestEvent>) {
    setSchedule((rows) => rows.map((r, i) => (i === index ? { ...r, ...patch } : r)))
  }

  function removeRow(index: number) {
    setSchedule((rows) => rows.filter((_, i) => i !== index))
  }

  function addRow() {
    const last = schedule[schedule.length - 1]
    const nextDate = last ? addMonthsClamped(last.date, 1) : todayISO
    setSchedule((rows) => [...rows, { date: nextDate, shares: 0 }])
  }

  function handleSave() {
    if (!label.trim() || totalShares <= 0) return
    onSave({
      id: initial?.id ?? crypto.randomUUID(),
      label: label.trim(),
      strike,
      totalShares,
      vestingSchedule: [...schedule].sort((a, b) => (a.date < b.date ? -1 : 1)),
    })
  }

  return (
    <div className="border border-accent-200 rounded-lg p-4 bg-accent-50/40 flex flex-col gap-4">
      <div className="grid sm:grid-cols-3 gap-3">
        <label className="flex flex-col gap-1 text-sm text-slate-600">
          Lot Label
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="!text-left"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-slate-600">
          Strike Price ($)
          <input
            type="number"
            step="0.01"
            value={strike}
            onChange={(e) => setStrike(Number(e.target.value))}
            onFocus={selectOnZero}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-slate-600">
          Quantity (Total Shares)
          <input
            type="number"
            step="1"
            value={totalShares}
            onChange={(e) => setTotalShares(Number(e.target.value))}
            onFocus={selectOnZero}
          />
        </label>
      </div>

      <div>
        <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">Vesting Schedule</div>

        <div className="flex gap-1 mb-3 text-xs">
          {(
            [
              ['standard', 'Standard (Cliff + Monthly)'],
              ['paste', 'Paste from Carta'],
              ['manual', 'Manual Table'],
            ] as [Method, string][]
          ).map(([m, mLabel]) => (
            <button
              key={m}
              onClick={() => setMethod(m)}
              className={`px-2.5 py-1 rounded-md border ${
                method === m
                  ? 'bg-accent-600 border-accent-600 text-white'
                  : 'border-slate-200 text-slate-600 hover:border-accent-300'
              }`}
            >
              {mLabel}
            </button>
          ))}
        </div>

        {method === 'standard' && (
          <div className="flex flex-wrap items-end gap-3 mb-3 text-sm">
            <label className="flex flex-col gap-1 text-slate-600">
              Vesting Start
              <input type="date" value={vestStart} onChange={(e) => setVestStart(e.target.value)} />
            </label>
            <label className="flex flex-col gap-1 text-slate-600">
              Cliff (months)
              <input
                type="number"
                value={cliffMonths}
                onChange={(e) => setCliffMonths(Number(e.target.value))}
                className="w-24"
              />
            </label>
            <label className="flex flex-col gap-1 text-slate-600">
              Total Vesting (months)
              <input
                type="number"
                value={totalMonths}
                onChange={(e) => setTotalMonths(Number(e.target.value))}
                className="w-28"
              />
            </label>
            <button
              onClick={handleGenerate}
              className="px-3 py-1.5 text-sm rounded-md bg-accent-600 text-white hover:bg-accent-700"
            >
              Generate Schedule
            </button>
          </div>
        )}

        {method === 'paste' && (
          <div className="flex flex-col gap-2 mb-3">
            <p className="text-xs text-slate-500">
              Copy rows straight out of Carta and paste below — either the full vesting-schedule
              table (period, date, vested, cumulative, exercised) or just date + shares per line.
              Exact days are kept, and cumulative/exercised columns are ignored automatically.
            </p>
            <textarea
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              rows={5}
              className="border border-slate-300 rounded-md px-2 py-1.5 text-sm font-mono"
              placeholder={'1\tOct 18, 2022\t1,625\t1,625\t0\n2\tNov 18, 2022\t135\t1,760\t0\n3\tDec 18, 2022\t135\t1,895\t0'}
            />
            <button
              onClick={handleParse}
              className="self-start px-3 py-1.5 text-sm rounded-md bg-accent-600 text-white hover:bg-accent-700"
            >
              Parse Pasted Rows
            </button>
          </div>
        )}

        {schedule.length > 0 && (
          <div className="border border-slate-200 rounded-md overflow-hidden">
            <div className="max-h-56 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-slate-50">
                  <tr>
                    <th>Date</th>
                    <th>Shares</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {schedule.map((row, i) => (
                    <tr key={i} className="border-t border-slate-100">
                      <td>
                        <input
                          type="date"
                          value={row.date}
                          onChange={(e) => updateRow(i, { date: e.target.value })}
                          className="w-36"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={row.shares}
                          onChange={(e) => updateRow(i, { shares: Number(e.target.value) })}
                          onFocus={selectOnZero}
                          className="w-24"
                        />
                      </td>
                      <td className="text-left">
                        <button
                          onClick={() => removeRow(i)}
                          className="text-slate-400 hover:text-red-600 px-2"
                          aria-label="Remove row"
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-2">
          <button onClick={addRow} className="text-xs text-accent-700 hover:underline">
            + Add row manually
          </button>
          <span className={`text-xs ${matchesTotal ? 'text-emerald-600' : 'text-amber-600'}`}>
            Schedule total: {fmtNumber(scheduleTotal)} / {fmtNumber(totalShares)} shares
            {matchesTotal ? ' ✓' : ''}
          </span>
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <button
          onClick={onCancel}
          className="px-3 py-1.5 text-sm rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-3 py-1.5 text-sm rounded-md bg-accent-600 text-white hover:bg-accent-700"
        >
          Save Lot
        </button>
      </div>
    </div>
  )
}
