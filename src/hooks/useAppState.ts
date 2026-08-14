import { useEffect, useState } from 'react'
import type { AppState } from '../types'
import { defaultState } from '../data/defaultState'

const STORAGE_KEY = 'sns-equity-simulator/state/v1'

function load(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultState
    const parsed = JSON.parse(raw) as AppState
    // Shallow-merge so new fields added later fall back to defaults. `taxes` and `fees`
    // are merged one level deeper since they're nested objects that also gain new fields over time.
    return {
      ...defaultState,
      ...parsed,
      fees: { ...defaultState.fees, ...parsed.fees },
      taxes: { ...defaultState.taxes, ...parsed.taxes },
    }
  } catch {
    return defaultState
  }
}

/**
 * Persists app state to localStorage, which is per-browser-profile-local
 * (never synced to a shared/global store). This is the storage layer to
 * swap out later if we wrap the app in Tauri/Electron with an on-disk file.
 */
export function useAppState() {
  const [state, setState] = useState<AppState>(load)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  return [state, setState] as const
}

export function resetState(setState: (s: AppState) => void) {
  setState(defaultState)
}
