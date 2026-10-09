# SCIENTIFIC METHOD & INTEGRITY
**Status vocabulary (shown in the UI):** VERIFIED (official data, unchanged) · DERIVED (computed from it) · ASSUMPTION (configurable) · CONCEPTUAL (future) · DATA UNAVAILABLE · SYNTHETIC (test fixture, not NASA data) · APPROXIMATE (placed, not surveyed).

**Slope:** central differences (one-sided at edges) over the native grid with latitude-dependent dx; slope = atan(|∇z|). Validated by a unit test on an analytic 10° plane (exact). Because MOLA cells are ~463 m, slope is averaged over ~926 m baselines: crater walls appear gentler than at metre scale, and boulders/small craters are invisible.
**Relief:** 3×3 max−min (≈1.4 km window), a roughness proxy at this scale only.
**Hillshade:** display only (az 315°, alt 45°, 3× exaggeration); never used in analysis.
**Coverage:** MEGC shot counts; cells with 0 shots are interpolated and are flagged per segment.
**Assumptions (all in `backend/app/config.py`, all displayed in the app):** slope_ref 15°, relief_ref 150 m, weights 0.75/0.25, exclusion slope 25°, σ = 1500 m, mode weights, stop radius 1200 m, segment length 1.5 km.
**Not claimed:** safety, survivability, traversability guarantees, mineral detections, real-time conditions, model accuracy. Science targets are from published descriptions or derived topography.
**Synthetic fixture:** used only where the PDS archive is unreachable (the build sandbox). Its provenance record deliberately carries no PDS identity; the app labels it on every screen.
