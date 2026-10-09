# PRESCREENING ALIGNMENT — film ↔ prototype (v2, offline build)

The cinematic prescreening film and this prototype share one identity: palette, typefaces (Space Grotesk, Inter,
JetBrains Mono), terminology and structure. The film's terrain is procedural and its routes are hand-drawn (its own
README says so). The table says what each scene maps to **in this build** and what is real behind it.

| Film scene | What the film shows | Where it is in the prototype | What is behind it in THIS build |
|---|---|---|---|
| S01–S02 · First step, Team DeltaX | Tagline, challenge, team | Intro screen (+ pre-event disclosure line) | — |
| S04 · The data problem | MOLA, HiRISE, CRISM, SHARAD, THEMIS as candidate layers | Left rail groups TERRAIN / SURFACE / SCIENCE / CONTEXT | Terrain = **SYNTHETIC fixture** in MOLA format; CTX, HiRISE, CRISM = DATA UNAVAILABLE; THEMIS, SHARAD, MEDA = CONCEPTUAL |
| S05 · Reveal | MARSCOPE wordmark | Header + intro | — |
| S06 · Integrated map | Scale ladder GLOBAL → ROUTE; tabs EXPLORE · PLAN · WHY · BRIEF | Rail SCALE ladder (GLOBAL opens a **CONCEPTUAL schematic globe**); header journey tabs | Globe = graticule + region box only, not a NASA basemap |
| S07 · Data layers | Terrain, surface, science, context layers | Layer toggles with legends, status chips, "Where did this come from?" | Terrain/slope/cost/shaded relief/coverage: **SYNTHETIC**; science proximity from cited targets; **SURFACE = shaded relief, not imagery** |
| S08 · Route branches | Routes A / B / C by priority | PLAN tab: same names, letters, colours; grid selector (1/512° routing or 1/128° native) | **Computed** (exact least-cost search) — on synthetic terrain, so the shapes demonstrate the method only |
| S09 · WHY? | Evidence chain for segment C-04 | WHY panel: TERRAIN (+1/1024° slope reading) → SURFACE → SCIENCE → SOURCE → METHOD → PROVENANCE → LIMITATION → ROUTE DECISION | Computed from synthetic terrain; every node carries its status |
| S10 · Science along the way | SCIENCE STOP 01 card | Numbered stops; card with WHY HERE? / WHAT DATA SUPPORTS THIS? / INVESTIGATE / SOURCE / LIMITATION / OFFLINE REVIEW | Delta front **APPROXIMATE** (not refined offline); rim crest SYNTHETIC here |
| S11 · Crew Route Brief | Dark briefing, ROUTE · WATCH · DISCOVER · CONDITIONS · SOURCES · UNCERTAINTY | Same layout; brief header says SYNTHETIC TEST TERRAIN; CONDITIONS say no MEDA data | Generated from computed route + provenance |
| S12 · Technical system | NASA DATA → … → CREW BRIEF | SYSTEM view: 8 stages with honest build status | All 8 stages run, on the synthetic fixture in this build |
| S13 · Coda | "DON'T JUST MAP MARS. PLAN THE WALK." | Brief footer; last Demo Mission step | — |
| (new) | — | CREDITS panel; context layer "Perseverance path slot" | Path slot shows a **SYNTHETIC illustration — not rover data** |

## Say this if asked
- "The prototype runs on a synthetic test terrain in the official MOLA file format, because this version was prepared
  fully offline. Every number on screen is labelled SYNTHETIC. Loading the real MOLA tile is one command on a machine
  with internet."
- "The grey shaded-relief layer is computed from the elevation grid. It is not a photo."
- "The violet dotted line is an illustration to test the map. It is not Perseverance's path."
- "Finer routing grids make smoother routes. They do not add terrain detail."

## Recommended screening order
1. Play the film (4:00). 2. Switch to the prototype and press **▶ DEMO MISSION** — its 8 steps follow the film's scene
order. Keep the red SYNTHETIC banner visible; do not crop it out.
