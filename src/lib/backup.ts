import { invoke, isTauri } from '@tauri-apps/api/core'
import { save } from '@tauri-apps/plugin-dialog'
import type { AppState } from '../types'
import { withDefaults } from '../hooks/useAppState'

const FORMAT = 'sns-equity-simulator'
const VERSION = 1

interface BackupFile {
  format: typeof FORMAT
  version: number
  exportedAt: string
  state: AppState
}

/**
 * Saves lots plus all other inputs (taxes, fees, sale price) to a `.sns` file — plain JSON.
 * In the macOS app this opens a native save panel; in a browser it's a regular download.
 * Returns false if the user cancelled the save panel.
 */
export async function exportState(state: AppState): Promise<boolean> {
  const file: BackupFile = { format: FORMAT, version: VERSION, exportedAt: new Date().toISOString(), state }
  const contents = JSON.stringify(file, null, 2)
  const filename = `equity-${file.exportedAt.slice(0, 10)}.sns`

  if (isTauri()) {
    const path = await save({ defaultPath: filename, filters: [{ name: 'SNS Equity Backup', extensions: ['sns'] }] })
    if (!path) return false
    await invoke('write_text_file', { path, contents })
    return true
  }

  const url = URL.createObjectURL(new Blob([contents], { type: 'application/json' }))
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
  return true
}

/** Parses a `.sns` file's text back into app state, throwing a user-readable error if it isn't one. */
export function parseBackup(text: string): AppState {
  let parsed: Partial<BackupFile>
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new Error("That file isn't a valid .sns backup.")
  }
  if (parsed.format !== FORMAT || !parsed.state || !Array.isArray(parsed.state.lots)) {
    throw new Error("That file isn't a valid .sns backup.")
  }
  if ((parsed.version ?? 0) > VERSION) {
    throw new Error('That backup was made by a newer version of the app.')
  }
  return withDefaults(parsed.state)
}
