import type { FocusEvent } from 'react'

/** Selects a number input's text when it's showing the default 0, so the first keystroke replaces it. */
export function selectOnZero(e: FocusEvent<HTMLInputElement>) {
  if (e.target.value === '0') e.target.select()
}
