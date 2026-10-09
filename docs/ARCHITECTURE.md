# ARCHITECTURE
```
PDS .lbl/.img ──► ingestion/pds3.py (parse, validate, clip; no resampling)
                     │
                     ▼
scripts/build_region.py ──► geospatial/terrain.py (slope, relief, hillshade on spherical Mars)
                     │        + derived rim target + layer PNGs + provenance records
                     ▼
data/processed/jezero/{grid.npz, manifest.json, layers/*.png}
                     │
backend (FastAPI) store.py ──► routing/engine.py (cost model, A*, segment analysis)
                     │        briefing/brief.py (Crew Route Brief from computed data only)
                     ▼
/api/*  ◄──── frontend (React/TS/Vite/Leaflet, CRS.Simple on the native lat/lon grid)
                     └─► fallback: frontend/dist/demo/snapshot.json (frozen real API responses)
```
**API:** `GET /api/regions · /api/layers · /api/layers/{id} · /api/science-targets · /api/routes/{id} · /api/routes/{id}/evidence?segment= · /api/sources · /api/metadata · /api/cell?lat&lon`; `POST /api/routes · /api/routes/compare · /api/crew-brief`. Data problems return HTTP 422 `{"error": "..."}`; unexpected failures return a friendly 500 — never a traceback.

**Why no PostGIS/GDAL:** one raster tile and a handful of points; NumPy reads MEGDR directly. Fewer dependencies → more reliable demo. Revisit when HiRISE/CRISM are added (rasterio for reprojection).

**Display:** Leaflet `CRS.Simple` with (lat, lon) as plane coordinates = the data's own simple-cylindrical grid. All distances/slopes are computed on the Mars sphere in the backend, not in screen space.
