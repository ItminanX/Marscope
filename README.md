# MARSCOPE — Mission-Aware Route Intelligence for Mars
**ONE ROUTE. EVERY LAYER. ONE CREW BRIEF.**
NASA Space Apps Challenge 2026 · *Interplanetary Survival Guide: Martian Map* · Team DeltaX
**Status: PRE-EVENT SCREENING / CONCEPT PROTOTYPE** — not work produced during the official hackathon (Nov 14–15, 2026).

MARSCOPE turns NASA Mars topography into an **explainable exploration route**: three priority modes (traversability / science / balanced) computed by A*, a **WHY?** evidence panel for every route segment, visible provenance and limitations, and a printable **Crew Route Brief**.

## Run (needs Python 3.10+; the UI is pre-built)
```bash
pip install -r requirements.txt
python run.py                 # opens http://localhost:8000
```
Click **▶ DEMO MISSION**, then **NEXT ›** to walk the 8-step demo (≈2–3 min). It follows the scene order of the prescreening film — see `docs/PRESCREENING_ALIGNMENT.md`.

### Load the real NASA data (one time, ~260 MB, needs internet)
```bash
python scripts/fetch_mola.py      # MOLA MEGDR 128 px/deg tiles megt44n045hb + megc44n045hb from the PDS Geosciences Node
python run.py --rebuild           # reprocess Jezero from the real tile; the red SYNTHETIC banner disappears
```
Until you do this, MARSCOPE runs on a **synthetic test fixture** in the exact MEGDR binary format. The UI marks this everywhere (red **SYNTHETIC TEST TERRAIN** badge, banner, chips, brief header). **Do not present synthetic numbers as Mars data.**

### Offline / no-backend fallback
`frontend/dist` contains a frozen snapshot of the Demo Mission (real API responses). If the backend is down, the UI switches to it automatically and shows **OFFLINE SNAPSHOT**. You can even serve it statically: `cd frontend/dist && python -m http.server 8090`.

### Tests
```bash
python -m pytest backend/tests -q
```

### Develop the UI (optional, Node 18+)
`cd frontend && npm install && npm run dev` (proxies /api to :8000) · `npm run build` to rebuild `dist`.

## Repository
```
backend/app/        config (all assumptions) · ingestion/pds3.py · geospatial/terrain.py · routing/engine.py
                    provenance/registry.py · briefing/brief.py · store.py · main.py (FastAPI)
backend/tests/      17 deterministic tests (incl. parser check against a real PDS MEGDR label)
scripts/            fetch_mola.py · make_fixture.py · build_region.py · build_snapshot.py
data/               raw/ (official tiles) · fixtures/ (synthetic) · processed/jezero/ · targets/jezero_targets.json
frontend/           React + TypeScript + Vite + Leaflet; dist/ is the built app
docs/               DATA · ARCHITECTURE · ROUTING · SCIENTIFIC_METHOD · DEMO · SCREENING_DEMO · PRESCREENING_ALIGNMENT
```
