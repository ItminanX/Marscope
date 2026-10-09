# ROUTING
**Grids:** routes are searched on the **1/512° routing grid** (~116 m, cubic interpolation of the 1/128° source grid)
by default. The **native 1/128° grid** stays selectable (`"grid": "native"` in the API, "Routing grid" in PLAN).
Finer spacing adds no terrain information (see SCIENTIFIC_METHOD.md).
**Graph:** every passable cell is a node; 8-connected edges. Step length on the sphere: dy = πR/180/ppd, dx = dy·cos(lat).
**Terrain cost (0–1):** `T = 0.75·min(1, slope/15°)² + 0.25·min(1, relief/150 m)` (relief = max−min in a ~1.4 km window).
**Science proximity (0–1):** `S = max_k exp(−d_k² / 2σ²)`, σ = 1500 m, over candidate science targets.
**Cell cost:** `c = β + α·T + γ·(1−S)`; **edge cost** = step length (m) × (c_i + c_j)/2.
| Mode | α | β | γ | Intent |
|---|---|---|---|---|
| TRAVERSABILITY-FIRST | 6 | 1 | 0 | minimise modeled terrain cost |
| SCIENCE-FIRST | 1.5 | 1 | 4 | stay near candidate science |
| BALANCED | 3 | 1 | 1.5 | trade-off |

**Search:** native grid — A*, heuristic β × great-circle distance (admissible since c ≥ β). Routing grid — Dijkstra
(scipy.sparse.csgraph), same edge model, exact. Both optimal and deterministic. Cells with slope > 25° are excluded —
a **modelling threshold (ASSUMPTION), not a human or rover mobility limit**.

**Timings (cloud test machine, Demo Mission, best of 3; run `python scripts/benchmark_routes.py` on your laptop):**
| grid | cells | algorithm | time per route |
|---|---|---|---|
| native 1/128° | 21,896 | A* | 0.04–0.07 s |
| routing 1/512° | 350,336 | A* | 0.60–1.20 s |
| routing 1/512° | 350,336 | Dijkstra (compiled) | 0.16–0.17 s |
A three-route comparison therefore takes about half a second on the routing grid.

**Evidence:** per ~1.5 km segment — length, elevation gain/loss, mean/max slope (routing grid), max slope read along the
path on the 1/1024° analysis grid, relief, mean T and S, cost, cost/m rank, interpolated-cell fraction, nearest target.
*Higher modeled traversal cost* = mean T ≥ max(0.35, route 75th percentile).
**Route metrics:** length, total cost, gain/loss, mean/max slope, higher-cost segment count, candidate stops (target
within 1200 m), direction changes, interpolated fraction, search time. No "safety" or "best" score exists.
