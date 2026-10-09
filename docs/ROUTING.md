# ROUTING
**Graph:** every passable MOLA cell is a node; 8-connected edges. Step length uses spherical spacing: dy = πR/180/ppd, dx = dy·cos(lat).
**Terrain cost (0–1):** `T = 0.75·min(1, slope/15°)² + 0.25·min(1, relief/150 m)` (relief = 3×3 max−min).
**Science proximity (0–1):** `S = max_k exp(−d_k² / 2σ²)`, σ = 1500 m, over candidate science targets.
**Cell cost:** `c = β + α·T + γ·(1−S)`; **edge cost** = step length (m) × (c_i + c_j)/2.
| Mode | α | β | γ | Intent |
|---|---|---|---|---|
| TRAVERSABILITY-FIRST | 6 | 1 | 0 | minimise modeled terrain cost |
| SCIENCE-FIRST | 1.5 | 1 | 4 | stay near candidate science |
| BALANCED | 3 | 1 | 1.5 | trade-off |

**Search:** A*, heuristic = β × great-circle distance (admissible since c ≥ β) → optimal, deterministic. Cells with slope > 25° (at ~463 m scale) are excluded — a **modelling threshold, not a human mobility limit**.
**Why routes differ:** γ makes distance from science expensive; α makes slope/relief expensive. The WHY panel shows each segment's share of cost from β, α·T and γ(1−S).
**Analysis per ~1.5 km segment:** length, elevation gain/loss, mean/max slope, relief, mean T and S, cost, cost/m rank, interpolated-cell fraction, nearest target. *Higher modeled traversal cost* = mean T ≥ max(0.35, route 75th percentile).
**Route metrics:** length, total cost, gain/loss, mean/max slope, higher-cost segment count, candidate stops (target within 1200 m), direction changes, interpolated fraction. No "safety" or "best" score exists.
