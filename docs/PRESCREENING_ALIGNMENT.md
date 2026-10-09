# PRESCREENING ALIGNMENT — film ↔ prototype

The cinematic prescreening film and this prototype share one identity: the same palette (charcoal, rust, sand, cyan route, amber attention, off-white), the same typefaces (Space Grotesk, Inter, JetBrains Mono), the same terminology and the same structure. A judge who watched the film should recognise every screen.

| Film scene | What the film shows | Where it is in the prototype | Real in prototype? |
|---|---|---|---|
| S01–S02 · First step, Team DeltaX | "ONE ROUTE. EVERY LAYER. ONE CREW BRIEF.", challenge, team | Intro screen (same kicker, wordmark, descriptor, tagline) | — |
| S04 · The data problem | MOLA, HiRISE, CRISM, SHARAD, THEMIS as candidate layers | Left rail groups **TERRAIN / SURFACE / SCIENCE / CONTEXT** | MOLA terrain + coverage integrated; HiRISE, CRISM = DATA UNAVAILABLE; THEMIS = CONCEPTUAL |
| S05 · Reveal | MARSCOPE · MISSION-AWARE ROUTE INTELLIGENCE FOR MARS | Header + intro | — |
| S06 · Integrated map | Scale ladder GLOBAL → REGIONAL → LOCAL → ROUTE; HUD tabs EXPLORE · PLAN · WHY · BRIEF | Rail **SCALE** ladder (follows map zoom; GLOBAL marked "not in build"); header **journey tabs** EXPLORE · PLAN · WHY · BRIEF | Yes |
| S07 · Data layers | Terrain, surface, science, context layers on one grid | Layer toggles with legends and "Where did this come from?" | Yes (MOLA-derived) |
| S08 · Route branches | ROUTE A traversability-first (sand), B science-first (amber), C balanced (cyan); mission-priority selector | PLAN tab: same names, letters, colours, selector | **Yes — computed by A*** (the film's routes were illustrative) |
| S09 · WHY? | "EVIDENCE CHAIN · SEGMENT C-04 · BALANCED ROUTE"; nodes TERRAIN → SURFACE → SCIENCE → SOURCE → METHOD → ROUTE DECISION; "A ROUTE IS NOT A LINE. IT IS A CHAIN OF EVIDENCE." | WHY panel with the same kicker format, cyan chain, segment IDs `C-04`, plus PROVENANCE and LIMITATION nodes, ROUTE DECISION, same footer | Yes |
| S10 · Science along the way | SCIENCE STOP 01 card: WHY HERE? / WHAT EVIDENCE? / WHAT COULD BE INVESTIGATED? / SOURCE | Numbered stops on the map; card with WHY HERE? / WHAT DATA SUPPORTS THIS? / WHAT COULD AN EXPLORER INVESTIGATE? / SOURCE / LIMITATION | Yes (targets traceable; delta front APPROXIMATE) |
| S11 · Crew Route Brief | Dark briefing, route strip with segment IDs, ROUTE · WATCH · DISCOVER · CONDITIONS · SOURCES · UNCERTAINTY, "BRIEF-C" | Same layout and sections (+ MISSION, EVIDENCE · METHOD), doc id `BRIEF-C · …`, prints light | Yes |
| S12 · Technical system | NASA DATA → … → CREW BRIEF (8 stages) | **SYSTEM** view: same 8 stages, each with honest build status | Pre-event versions of all 8 implemented |
| S13 · Coda | "DON'T JUST MAP MARS. PLAN THE WALK." | Brief footer; last Demo Mission step | — |

## Differences that are intentional (say them if asked)
- **Terrain:** the film's terrain is procedural and illustrative. The prototype uses MOLA (after `fetch_mola.py`) or a labelled synthetic fixture. Route shapes, segment numbers and the "ridge saddle" of the film's C-04 therefore differ from the prototype's computed C-segments.
- **Science stop:** the film shows an illustrative "layered outcrop"; the prototype's stops are the Jezero delta front (APPROXIMATE) and the derived west rim.
- **Hackathon wording:** the film says "during the hackathon we plan to build this pipeline". Accurate framing for the screening: *"a pre-event prototype of every stage already runs on MOLA data; during the event we extend it with HiRISE and CRISM evidence."*

## Recommended screening order
1. Play the film (4:00). 2. Switch to the prototype and press **▶ DEMO MISSION** — its 8 steps follow the film's scene order, so the live demo reads as "here is the real thing".
