# CHANGES — MARSCOPE v2 (offline build, 2026-10-10)

**OFFLINE MODE: no network requests were made.** The only terrain in the project is the synthetic test fixture, so
every terrain-based number below is **SYNTHETIC** — it shows how the method behaves, not what Mars is like.

## What changed, per phase
| Phase | Change |
|---|---|
| 0 Orient | Read all code/docs, ran tests (14 passed, 3 errors: FastAPI not installed), wrote PROGRESS.md, `git init` + baseline commit. Found: no real MOLA file is present; terrain = synthetic fixture (verified byte-identical rebuild from `make_fixture.py`). |
| 1 Terrain | New 1/512° routing grid and 1/1024° analysis grid (cubic interpolation, documented, built at start-up, not shipped). Routes on 1/512° with exact Dijkstra; native 1/128° + A* kept selectable. Slope read along routes on 1/1024°. Slope statistics per grid. New Starlette-only server (`app/lite.py`) sharing handlers with FastAPI; in-process ASGI test client. |
| 2 Surface | New SURFACE layer: shaded relief of the elevation grid (1288 × 1088 px, 0.54 MB, exact grid bounds). Labelled "not imagery". |
| 3 Delta front | Kept APPROXIMATE and unmoved; `offline_review` note; QGIS check steps in docs/DATA.md. |
| 4 Path | Perseverance path slot: local GeoJSON loader with Butler Landing convention check and in-region share (unit-tested on small fixtures); without a file, an optional "Synthetic illustrative path — not rover data". `GET /api/overlays`. |
| 5 CRISM | Skipped — files absent. DATA_UNAVAILABLE; no classes invented. |
| 6 MEDA | Skipped — no files. CONCEPTUAL; brief says no measured conditions. |
| 7 Global | Schematic globe (graticule + region box), CONCEPTUAL, opened from SCALE → GLOBAL. |
| 8 Docs/UI | Status vocabulary now 7 words incl. APPROXIMATE in the registry and UI legend. Credits panel, local-file inventory in Sources, grids table, grid selector, offline/disclosure chips. Docs rewritten. Snapshot regenerated. UI rebuilt offline (esbuild). 46 tests. |
| 9 GitHub | .gitignore, MIT LICENSE, README, GITHUB_GUIDE.txt, size and secrets check. |

## Before → after numbers (Demo Mission: Butler Landing → derived west rim; synthetic fixture)
| Item | Before (v1) | After (v2) |
|---|---|---|
| Route grid | 1/128° (~463 m), 21,896 cells | 1/512° (~116 m, interpolated), 350,336 cells; 1/128° still selectable |
| Evidence grid | same as route grid | + 1/1024° (~58 m, interpolated) slope along the path |
| Route search time (this machine) | A* 0.06–0.07 s per route | Dijkstra 0.16–0.17 s per route (A* on the same grid: 0.60–1.20 s) |
| Store start-up | not measured | ~0.5 s (grid levels 0.3–0.4 s) |
| Route vertices | 30–31 | 117 |
| Route length A / B / C | 15.99 / 15.72 / 15.72 km | 16.17 / 15.67 / 15.67 km |
| Max slope on route A / B / C | 12.93° / 14.63° / 15.47° | 12.27° / 18.27° / 16.02° (analysis grid: 12.35° / 18.33° / 15.92°) |
| Region slope p95 / max | 10.63° / 20.45° (native) | routing 10.97° / 25.88°; analysis 11.00° / 26.27° |
| Cells above the 25° limit | 0 | routing 6; analysis 29 (mostly spline overshoot) |
| Layers | terrain, slope, cost, science, coverage | + surface (shaded relief); slope & cost now on the 1/512° grid |
| Tests | 17 (3 could not run here) | 46 passing (API tests run on the Starlette server here; on FastAPI too where installed) |

## Known limits
- **No real terrain** in this build. All terrain numbers are SYNTHETIC.
- Finer grids are interpolation: no new information; spline overshoot raises maximum slopes.
- No CTX, HiRISE, CRISM, MEDA, real traverse or basemap files → those features are DATA_UNAVAILABLE / CONCEPTUAL /
  illustrative only.
- UI rebuilt offline with esbuild + React 19 (the project's package.json targets React 18); no TypeScript check against
  real library types was possible offline (checked against loose local stubs). `npm run build` on a laptop re-checks it.
- Timings were measured on a cloud test machine; run `python scripts/benchmark_routes.py` on your laptop.
- The target coordinates for the landing site and crater centre were not re-checked offline (they come with citations).

## Claims table for judges
| Claim | Source | Status | What is NOT claimed |
|---|---|---|---|
| MARSCOPE reads PDS3 MEGDR labels and raw tiles and validates them | code + test against a real PDS label text | DERIVED (software) | That real MOLA data is inside this build |
| The terrain in this build is a synthetic fixture in MOLA format | `scripts/make_fixture.py`, byte-identical rebuild | SYNTHETIC | Any resemblance to real Jezero topography |
| Routes are exact least-cost paths under the stated cost model | code + tests (A* = Dijkstra cost) | DERIVED | Safety, traversability, rover or human capability |
| Routing on a 116 m grid | 1/512° cubic interpolation | SYNTHETIC here (APPROXIMATE with real MOLA) | Real 116 m terrain detail |
| Slope statistics per grid spacing | computed on the grids | SYNTHETIC | Real Martian slopes |
| SURFACE layer | hillshade of the elevation grid | SYNTHETIC here (DERIVED with real MOLA) | Orbital imagery, CTX or HiRISE |
| Delta-front target position | placement from published descriptions | APPROXIMATE | A surveyed or refined position |
| Landing site / crater centre coordinates | cited NASA / IAU values | VERIFIED (cited) | Re-verification in this offline session |
| Violet dotted line | generated sine wave | SYNTHETIC | The Perseverance path, any rover metric |
| CRISM / minerals | — | DATA_UNAVAILABLE | Any mineral detection or class |
| Weather / conditions | — | CONCEPTUAL | Any measured or real-time condition |
| Global view | schematic graticule | CONCEPTUAL | A NASA basemap |
| Slope limit 25°, cost weights, σ | config.py | ASSUMPTION | Measured mobility limits |
| Timings | measured on a cloud test machine | DERIVED | Performance on every laptop |
