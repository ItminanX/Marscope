"""MARSCOPE API (FastAPI). Run:  uvicorn app.main:app --port 8000   (from backend/)"""
from __future__ import annotations
from pathlib import Path
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from .config import ROOT, PROCESSED, REGION, MODES, PIPELINE
from .ingestion.pds3 import DataError
from .store import get_store
from .briefing.brief import build_brief, route_differences
from .provenance.registry import STATUS

app = FastAPI(title="MARSCOPE API", version="0.1.0-screening")


class Point(BaseModel):
    lat: float = Field(..., ge=-90, le=90)
    lon: float = Field(..., ge=-360, le=360)
    name: str | None = None


class RouteReq(BaseModel):
    start: Point | None = None
    dest: Point | None = None
    mode: str = "balanced"


class BriefReq(BaseModel):
    route_id: str


@app.exception_handler(DataError)
async def data_error(_: Request, e: DataError):
    return JSONResponse(status_code=422, content={"error": str(e)})


@app.exception_handler(Exception)
async def any_error(_: Request, e: Exception):
    return JSONResponse(status_code=500, content={"error": "Internal problem while processing the request. The demo snapshot remains available."})


def _ends(req: RouteReq):
    s, d = get_store().default_endpoints()
    return (req.start.model_dump() if req.start else s), (req.dest.model_dump() if req.dest else d)


@app.get("/api/health")
def health():
    st = get_store()
    return {"ok": True, "data_mode": st.manifest["data_mode"]}


@app.get("/api/regions")
def regions():
    m = get_store().manifest
    return [{"id": m["region"]["id"], "name": m["region"]["name"], "why": m["region"]["why"], "bounds": m["region"]["bounds"],
             "data_mode": m["data_mode"]}]


@app.get("/api/layers")
def layers():
    m = get_store().manifest
    return {"layers": [{k: v for k, v in l.items()} | {"url": f"/layers/{l['png']}"} for l in m["layers"]], "unavailable": m["unavailable"]}


@app.get("/api/layers/{layer_id}")
def layer(layer_id: str):
    for l in get_store().manifest["layers"]:
        if l["id"] == layer_id:
            return l | {"url": f"/layers/{l['png']}"}
    raise HTTPException(404, detail=f"No layer '{layer_id}' for this region")


@app.get("/api/science-targets")
def targets():
    return {"type": "FeatureCollection", "features": [
        {"type": "Feature", "geometry": {"type": "Point", "coordinates": [t["lon"], t["lat"]]}, "properties": t}
        for t in get_store().targets]}


@app.post("/api/routes")
def route(req: RouteReq):
    s, d = _ends(req)
    return get_store().route(s, d, req.mode)


@app.post("/api/routes/compare")
def compare(req: RouteReq):
    s, d = _ends(req)
    st = get_store()
    routes = [st.route(s, d, m) for m in MODES]
    return {"routes": routes, "differences": route_differences(routes)}


@app.get("/api/routes/{route_id}")
def get_route(route_id: str):
    r = get_store().routes.get(route_id)
    if not r:
        raise DataError("Route not found — generate it first")
    return r


@app.get("/api/routes/{route_id}/evidence")
def evidence(route_id: str, segment: str):
    return get_store().evidence(route_id, segment)


@app.get("/api/cell")
def cell(lat: float, lon: float):
    st = get_store(); g = st.grid
    i, j = g.cell(lat, lon)
    c = None if g.counts is None else int(g.counts[i, j])
    return {"lat": round(float(g.lat[i]), 5), "lon": round(float(g.lon[j]), 5), "elev_m": round(float(g.z[i, j]), 1),
            "slope_deg": round(float(g.slope[i, j]), 2), "relief_m": round(float(g.relief[i, j]), 1), "T": round(float(g.T[i, j]), 3),
            "S": round(float(st.S[i, j]), 3), "mola_shots": c, "interpolated": (c == 0) if c is not None else None,
            "data_mode": st.manifest["data_mode"]}


@app.get("/api/sources")
def sources():
    m = get_store().manifest
    return {"layers": [l["provenance"] for l in m["layers"]], "targets": m["targets"], "unavailable": m["unavailable"]}


@app.get("/api/metadata")
def metadata():
    m = get_store().manifest
    return {"data_mode": m["data_mode"], "built": m["built"], "region": m["region"], "assumptions": m["assumptions"],
            "stats": m["stats"], "status_vocabulary": STATUS, "unavailable": m["unavailable"],
            "pipeline": [{"stage": a, "sub": b, "status": c, "built": d, "next": e} for a, b, c, d, e in PIPELINE]}


@app.post("/api/crew-brief")
def crew_brief(req: BriefReq):
    st = get_store()
    r = st.routes.get(req.route_id)
    if not r:
        raise DataError("Route not found — generate it first")
    comp = [x for x in st.routes.values() if x["start"] == r["start"] and x["dest"] == r["dest"]]
    return build_brief(st, r, comp)


app.mount("/layers", StaticFiles(directory=str(PROCESSED / REGION["id"] / "layers"), check_dir=False), name="layers")
DIST = ROOT / "frontend" / "dist"
if DIST.exists():
    app.mount("/", StaticFiles(directory=str(DIST), html=True), name="ui")
