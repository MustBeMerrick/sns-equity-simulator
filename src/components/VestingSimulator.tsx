import { useState } from 'react'
import type { MonthlyVesting } from '../lib/calculations'
import { fmtNumber, fmtUSD } from '../lib/format'

type Metric = 'shares' | 'gross' | 'preTax' | 'postTax'

const METRIC_LABEL: Record<Metric, string> = {
  shares: 'Shares',
  gross: 'Gross Value',
  preTax: 'Pre-Tax Profit',
  postTax: 'Post-Tax Profit',
}

function metricValue(m: MonthlyVesting, metric: Metric) {
  switch (metric) {
    case 'shares':
      return m.shares
    case 'gross':
      return m.saleValue
    case 'preTax':
      return m.grossProfit
    case 'postTax':
      return m.postTaxProfit
  }
}

interface Props {
  months: MonthlyVesting[]
  salePrice: number
}

export function VestingSimulator({ months, salePrice }: Props) {
  const [metric, setMetric] = useState<Metric>('postTax')
  const max = Math.max(1, ...months.map((m) => metricValue(m, metric)))

  const totals = months.reduce(
    (acc, m) => ({
      shares: acc.shares + m.shares,
      exerciseCost: acc.exerciseCost + m.exerciseCost,
      saleValue: acc.saleValue + m.saleValue,
      grossProfit: acc.grossProfit + m.grossProfit,
      postTaxProfit: acc.postTaxProfit + m.postTaxProfit,
    }),
    { shares: 0, exerciseCost: 0, saleValue: 0, grossProfit: 0, postTaxProfit: 0 },
  )

  return (
    <section className="card">
      <div className="card-header flex-wrap justify-between">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-accent-100 text-accent-700 text-xs flex items-center justify-center">
            4
          </span>
          Future Vesting Value Simulator
          <span className="text-xs font-normal text-slate-400">@ {fmtUSD(salePrice)}/share</span>
        </div>
        <div className="flex gap-1 text-xs">
          {(Object.keys(METRIC_LABEL) as Metric[]).map((m) => (
            <button
              key={m}
              onClick={() => setMetric(m)}
              className={`px-2.5 py-1 rounded-md border ${
                metric === m
                  ? 'bg-accent-600 border-accent-600 text-white'
                  : 'border-slate-200 text-slate-600 hover:border-accent-300'
              }`}
            >
              {METRIC_LABEL[m]}
            </button>
          ))}
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-end gap-2 overflow-x-auto pb-1">
          {months.map((m) => {
            const value = metricValue(m, metric)
            const BAR_MAX_PX = 140
            const heightPx = Math.max(4, (value / max) * BAR_MAX_PX)
            return (
              <div key={m.month} className="flex flex-col items-center gap-1 min-w-[48px]">
                <div className="text-[10px] text-slate-500 whitespace-nowrap">
                  {metric === 'shares' ? fmtNumber(value) : fmtUSD(value, { compact: true })}
                </div>
                <div
                  className="w-6 rounded-t-md bg-accent-500"
                  style={{ height: `${heightPx}px` }}
                  title={`${m.label}: ${fmtUSD(value)}`}
                />
                <div className="text-[10px] text-slate-400">{m.label.split(' ')[0]}</div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="overflow-x-auto border-t border-slate-100">
        <table className="w-full">
          <thead>
            <tr>
              <th>Month</th>
              <th>Shares Vesting</th>
              <th>Exercise Cost</th>
              <th>Sale Value</th>
              <th>Gross Profit</th>
              <th>Post-Tax Profit</th>
            </tr>
          </thead>
          <tbody>
            {months.map((m) => (
              <tr key={m.month} className="border-t border-slate-100">
                <td className="font-medium">{m.label}</td>
                <td>{fmtNumber(m.shares)}</td>
                <td>{fmtUSD(m.exerciseCost)}</td>
                <td>{fmtUSD(m.saleValue)}</td>
                <td>{fmtUSD(m.grossProfit)}</td>
                <td>{fmtUSD(m.postTaxProfit)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-slate-200 font-semibold bg-slate-50">
              <td>TOTAL</td>
              <td>{fmtNumber(totals.shares)}</td>
              <td>{fmtUSD(totals.exerciseCost)}</td>
              <td>{fmtUSD(totals.saleValue)}</td>
              <td>{fmtUSD(totals.grossProfit)}</td>
              <td>{fmtUSD(totals.postTaxProfit)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  )
}
