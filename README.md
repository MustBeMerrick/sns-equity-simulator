# SambaNova Equity Simulator

A single-page dashboard for simulating equity sales, exercises, vesting, and taxes across
different share prices. Everything on the page is driven by one global "sale price" input —
change it and every section (position value, sale simulator, taxes, vesting projections)
recalculates live.

Ships as a normal web app (`npm run dev`) or as a standalone macOS app via
[Tauri](https://tauri.app).

## Features

- **Position / Lot Overview** — total vs. vested shares, cost basis, proceeds, and P/L per
  lot and in aggregate, with a weighted-average strike price.
- **Sale / Exercise Simulator** — enter shares to sell per lot, with configurable
  percentage + flat transaction fees, and see exercise cost, proceeds, and profit.
- **Post-Tax Estimate** — Federal, CA State, Medicare, Additional Medicare, OASDI
  (Social Security), CA SDI, and a catch-all "Other" rate, rolled up into pre-tax profit,
  total tax, post-tax profit, and net cash proceeds.
- **Future Vesting Value Simulator** — a chart and table of upcoming vesting events, valued
  at the current sale price, with shares/gross/pre-tax/post-tax toggles.
- **Price Sensitivity Table** — vested value, P/L, and post-tax P/L at a handful of
  quick-scenario share prices.
- **Lot management** — add, edit, and delete lots (strike, quantity, vesting schedule)
  directly in the app. Vesting schedules can be built three ways:
  - **Standard generator** — cliff + even-monthly vesting from a start date, cliff length,
    and total duration.
  - **Paste from Carta** — paste rows straight out of Carta's vesting-schedule export
    (period, date, vested, cumulative, exercised) or a simple two-column date+shares list;
    the parser picks the right column automatically.
  - **Manual table** — hand-edit individual vesting events at day-level granularity.

All amounts are estimates for informational purposes only — not tax or investment advice.

## Tech stack

- [Vite](https://vite.dev) + [React](https://react.dev) + TypeScript
- [Tailwind CSS](https://tailwindcss.com) for styling
- [Tauri](https://tauri.app) for the standalone macOS app wrapper
- State persists to the browser/WebView's `localStorage` — local to each user's machine,
  never synced anywhere

## Getting started

```bash
npm install
npm run dev
```

Opens the app at `http://localhost:5183`.

## Building the macOS app

Requires Rust (`rustup.rs`) installed once on the build machine — end users just get a
plain `.app`/`.dmg`, no toolchain needed on their end.

```bash
npm run app:dev     # live native window, for quick testing
npm run app:build   # produces a release .app and .dmg
```

Build output lands in:

```
src-tauri/target/release/bundle/macos/SambaNova Equity Simulator.app
src-tauri/target/release/bundle/dmg/SambaNova Equity Simulator_<version>_aarch64.dmg
```

The `.dmg` is unsigned, so first launch will trigger a Gatekeeper warning — right-click →
Open (or System Settings → Privacy & Security → "Open Anyway") to bypass it. Signing and
notarization would require an Apple Developer Program enrollment, not currently set up.

## Project structure

```
src/
  components/     UI components, one per dashboard section
  lib/
    calculations.ts   position, sale, tax, and vesting math
    vesting.ts         vesting-schedule generation and Carta-paste parsing
    format.ts          number/currency formatting helpers
  hooks/useAppState.ts persistence to localStorage
  data/defaultState.ts initial (empty) app state
  types.ts             shared TypeScript types
src-tauri/         Tauri (Rust) shell for the macOS app build
```
