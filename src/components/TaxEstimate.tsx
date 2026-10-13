import type { TaxAssumptions } from '../types'
import type { TaxSummary } from '../lib/calculations'
import { fmtUSD } from '../lib/format'
import { selectOnZero } from '../lib/inputHelpers'

interface Props {
  taxes: TaxAssumptions
  onChange: (taxes: TaxAssumptions) => void
  tax: TaxSummary
}

export function TaxEstimate({ taxes, onChange, tax }: Props) {
  return (
    <section className="card">
      <div className="card-header">
        <span className="w-6 h-6 rounded-full bg-accent-100 text-accent-700 text-xs flex items-center justify-center">
          3
        </span>
        Post-Tax Estimate
      </div>

      <div className="grid lg:grid-cols-2 gap-6 p-5">
        <div>
          <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">Tax Assumptions</div>
          <div className="flex flex-col gap-3">
            <RateInput
              label="Federal Rate"
              value={taxes.federalRate}
              onChange={(v) => onChange({ ...taxes, federalRate: v })}
            />
            <RateInput
              label="CA State Rate"
              value={taxes.stateRate}
              onChange={(v) => onChange({ ...taxes, stateRate: v })}
            />
            <RateInput
              label="Medicare"
              value={taxes.medicareRate}
              onChange={(v) => onChange({ ...taxes, medicareRate: v })}
            />
            <RateInput
              label="Additional Medicare"
              value={taxes.additionalMedicareRate}
              onChange={(v) => onChange({ ...taxes, additionalMedicareRate: v })}
            />
            <RateInput
              label="OASDI (Social Security)"
              value={taxes.oasdiRate}
              onChange={(v) => onChange({ ...taxes, oasdiRate: v })}
            />
            <RateInput
              label="CA SDI"
              value={taxes.caSdiRate}
              onChange={(v) => onChange({ ...taxes, caSdiRate: v })}
            />
            <RateInput
              label="Other Rate"
              value={taxes.otherRate}
              onChange={(v) => onChange({ ...taxes, otherRate: v })}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2 text-sm">
          <Row label="Gross Proceeds" value={fmtUSD(tax.grossProceeds)} />
          <Row label="Exercise Cost" value={`-${fmtUSD(tax.exerciseCost)}`} />
          <Row label="Transaction Fees" value={`-${fmtUSD(tax.fees)}`} />
          <hr className="border-slate-200" />
          <Row label="Pre-Tax Profit" value={fmtUSD(tax.preTaxProfit)} bold />
          <hr className="border-slate-200" />
          <Row label="Taxable Amount (Gross - Exercise)" value={fmtUSD(tax.taxableProfit)} />
          <Row label="Federal Tax" value={`-${fmtUSD(tax.federalTax)}`} />
          <Row label="State Tax" value={`-${fmtUSD(tax.stateTax)}`} />
          {tax.medicareTax > 0 && <Row label="Medicare" value={`-${fmtUSD(tax.medicareTax)}`} />}
          {tax.additionalMedicareTax > 0 && (
            <Row label="Additional Medicare" value={`-${fmtUSD(tax.additionalMedicareTax)}`} />
          )}
          {tax.oasdiTax > 0 && <Row label="OASDI (Social Security)" value={`-${fmtUSD(tax.oasdiTax)}`} />}
          {tax.caSdiTax > 0 && <Row label="CA SDI" value={`-${fmtUSD(tax.caSdiTax)}`} />}
          {tax.otherTax > 0 && <Row label="Other Tax" value={`-${fmtUSD(tax.otherTax)}`} />}
          <hr className="border-slate-200" />
          <Row label="POST-TAX PROFIT" value={fmtUSD(tax.postTaxProfit)} bold />

          <div className="mt-3 card !border-accent-200 bg-accent-50 px-4 py-3">
            <div className="text-xs uppercase tracking-wide text-accent-700">
              Cash to You (Net Proceeds)
            </div>
            <div className="text-2xl font-bold text-accent-700">{fmtUSD(tax.netCashProceeds)}</div>
          </div>
        </div>
      </div>
    </section>
  )
}

function RateInput({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (v: number) => void
}) {
  return (
    <label className="flex items-center justify-between text-sm text-slate-600 gap-3">
      {label}
      <span className="flex items-center gap-1">
        <input
          type="number"
          step="0.1"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          onFocus={selectOnZero}
          className="w-20"
        />
        %
      </span>
    </label>
  )
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className={bold ? 'font-semibold' : 'text-slate-500'}>{label}</span>
      <span className={bold ? 'font-semibold' : ''}>{value}</span>
    </div>
  )
}
