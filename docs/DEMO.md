# DEMO
## Before the screening (with real data)
1. `python scripts/fetch_mola.py` then `python run.py --rebuild` → badge must read **NASA PDS · MOLA**.
2. Turn on *Terrain*; check the **Western delta front** marker sits on the delta fan in the hillshade. If not, correct its lat/lon in `data/targets/jezero_targets.json` (status stays APPROXIMATE) and rebuild.
3. Run DEMO MISSION once; confirm three routes differ and the WHY numbers look physically sensible (slopes of a few degrees on the floor, higher on the rim). Re-run `pytest`.
4. Keep `frontend/dist/demo` (rebuilt by `--rebuild`) as the offline fallback.
## Demo Mission steps (NEXT ›) — same order as the prescreening film
1 Region + layers → 2 three computed routes → 3 ROUTE B science-first + "why do the routes differ?" → 4 WHY? on the highest cost/m segment of ROUTE C (cost layer on) → 5 SCIENCE STOP 01 → 6 Data Sources → 7 Crew Route Brief (Print / Save as PDF) → 8 SYSTEM pipeline. Esc closes documents. Header tabs EXPLORE · PLAN · WHY · BRIEF navigate at any time.
## Manual extras
Click any cell → elevation/slope/relief/T/MOLA shots · SET START / SET DESTINATION then GENERATE ROUTES · hover/click the profile · click a science marker → WHY HERE? / WHAT DATA SUPPORTS THIS? / WHAT COULD AN EXPLORER INVESTIGATE?
