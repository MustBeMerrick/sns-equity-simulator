import { useRef, useState, type InputHTMLAttributes } from 'react'

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'> & {
  value: number
  onChange: (value: number) => void
}

/**
 * Numeric field that clears on focus so the first keystroke starts a fresh value.
 * Escape (or leaving it empty) restores the value it had when focused; Enter commits.
 */
export function NumberInput({ value, onChange, onFocus, onBlur, onKeyDown, ...rest }: Props) {
  const [draft, setDraft] = useState<string | null>(null) // null while not editing
  const original = useRef(value)

  const restore = () => {
    if (value !== original.current) onChange(original.current)
    setDraft(null)
  }

  return (
    <input
      type="number"
      {...rest}
      value={draft ?? value}
      onFocus={(e) => {
        original.current = value
        setDraft('')
        onFocus?.(e)
      }}
      onChange={(e) => {
        setDraft(e.target.value)
        const next = Number(e.target.value)
        if (e.target.value.trim() !== '' && Number.isFinite(next)) onChange(next)
      }}
      onBlur={(e) => {
        if (draft === null || draft.trim() === '' || !Number.isFinite(Number(draft))) restore()
        else setDraft(null)
        onBlur?.(e)
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          restore()
          e.currentTarget.blur()
        } else if (e.key === 'Enter') {
          e.currentTarget.blur()
        }
        onKeyDown?.(e)
      }}
    />
  )
}
