# DEMO
## In this offline build
The header shows **OFFLINE BUILD** and **SYNTHETIC TEST TERRAIN**. Every terrain number is from the synthetic fixture.
Present it as a working pipeline demonstration, not as Mars results.

## Before a screening with real data (needs a machine with internet, done by hand)
1. `python scripts/fetch_mola.py` then `python run.py --rebuild` → badge must read **NASA PDS · MOLA**.
2. Turn on *Terrain* and *Shaded relief*; check the **Western delta front** marker sits on the delta fan (QGIS steps in
   docs/DATA.md). If not, correct its lat/lon in `data/targets/jezero_targets.json` (status stays APPROXIMATE) and rebuild.
3. Run DEMO MISSION once; confirm three routes differ and the WHY numbers look physically sensible. Re-run `pytest`.
4. `python scripts/build_snapshot.py` refreshes the offline fallback in `frontend/public/demo` (copy to `dist/demo` or rebuild the UI).

## Demo Mission steps (NEXT ›) — same order as the prescreening film
1 Region + layers → 2 three computed routes (1/512° grid) → 3 ROUTE B science-first + "why do the routes differ?" →
4 WHY? on the highest cost/m segment of ROUTE C (cost layer on) → 5 SCIENCE STOP 01 → 6 Data Sources → 7 Crew Route
Brief (Print / Save as PDF) → 8 SYSTEM pipeline. Esc closes documents. Header tabs EXPLORE · PLAN · WHY · BRIEF navigate.

## Manual extras
Click any cell → elevation/slope/relief/T/shot count (+ routing-grid slope) · PLAN → Routing grid: switch 1/512° ↔ 1/128°
and GENERATE · SET START / SET DESTINATION · SURFACE → Shaded relief · CONTEXT → Perseverance path slot (synthetic
illustration) · SCALE → GLOBAL (schematic globe) · CREDITS.
