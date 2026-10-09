# DATA

## Audit and selection (2–3 sources, genuinely integrated)
| Candidate | Mission / instrument | Decision | Reason |
|---|---|---|---|
| **MOLA MEGDR 128 px/deg** | Mars Global Surveyor / Mars Orbiter Laser Altimeter | **CORE — integrated** | Global, consistent, official, small tile (~130 MB) covers Jezero; simple raw format readable without GDAL; supports elevation, slope, relief, route cost. |
| **MOLA shot counts (MEGC)** | same | **Integrated** | Same grid; tells us which cells are interpolated (0 shots) → real coverage/uncertainty layer. |
| Candidate science targets | NASA mission documentation, IAU nomenclature, derived from MOLA | **Integrated (point layer)** | Gives route meaning with traceable sources. Each has status VERIFIED / APPROXIMATE / DERIVED. |
| HiRISE orthoimage / DTM | MRO / HiRISE | DATA UNAVAILABLE (planned) | Metre-scale; products are large; best added for one traverse during the event. |
| CRISM | MRO / CRISM | DATA UNAVAILABLE (planned) | Would replace literature points with spectral evidence; preprocessing is heavier. |
| SHARAD, THEMIS | MRO / Odyssey | CONCEPTUAL | Not needed for the core route story; would add complexity before value. |

## MOLA MEGDR facts (verified against PDS documentation)
- Archive: PDS Geosciences Node, bundle `mgs_mola_topography_derived`, collection `meg128`; PDS3 data set `MGS-M-MOLA-5-MEGDR-L3-V1.0`, DOI 10.17189/1519460.
- URL used: `https://pds-geosciences.wustl.edu/mgs/urn-nasa-pds-mgs_mola_topography_derived/meg128/megt44n045hb.img` (+ `.lbl`), PDS3 mirror path as fallback.
- MEGDRs exist at 4, 16, 32, 64, 128 px/deg; 128 px/deg is tiled. Simple cylindrical, planetocentric, east-positive, IAU2000 frame; binned nadir shots Feb 1999 – Jun 2001; some across-track interpolation at 128 px/deg.
- Tile `megt44n045hb` = topography, 44°N–0°, 45°E–90°E (contains Jezero at 18.38°N, 77.58°E).

## Parser verified against a real PDS label
`backend/tests/data/megr44s090hb.lbl` is the verbatim label of an official MEGDR 128 px/deg tile (fetched from the PDS Geosciences Node). A test confirms the reader extracts 5632 × 11520 samples, 128 px/deg, −44…−88°N, 90…180°E, R = 3396 km, MSB 16-bit samples, and that `LINE_PROJECTION_OFFSET` (−5631.5) passes the geometry cross-check. The same label states: *"Where no observations lie within the area, an interpolated value is supplied… near the equator about 55% of bins contain at least one MOLA shot… gaps of up to 12 km between profiles"* — the basis of MARSCOPE's coverage layer.

## Region: Jezero crater — why
Mars 2020 landing region; crater lake with a preserved delta; a documented start point (Octavia E. Butler Landing, 18.4447°N 77.4508°E). ROI 17.85–18.90°N, 76.95–78.20°E (≈136 × 161 MOLA cells).

## Harmonization (what the pipeline really does)
1. Parse PDS3 label → 2. validate file size and map extents against LINES/LINE_SAMPLES at MAP_RESOLUTION (and LINE_PROJECTION_OFFSET when present) → 3. keep native simple-cylindrical frame (single source ⇒ no reprojection needed) → 4. clip to whole source pixels (**no resampling**, values unchanged; recorded) → 5. verify the shot-count grid is identical in origin, ppd and shape → 6. record every step in the provenance record shown in the app.

## Targets (`data/targets/jezero_targets.json`)
| Target | Status | Source |
|---|---|---|
| Octavia E. Butler Landing | VERIFIED | NASA site naming (5 Mar 2021); published coordinates |
| Jezero crater centre | VERIFIED | IAU nomenclature value |
| Western delta front | **APPROXIMATE** | NASA describes the delta west of the landing site; position is a placement — **verify against the real hillshade before presenting** |
| West rim crest | DERIVED | Highest MOLA elevation along the centre→landing azimuth, 0.70–1.35 crater radii |
