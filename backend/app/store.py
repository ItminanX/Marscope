"""Loads the processed region once and computes/caches routes. All route numbers come from here."""
from __future__ import annotations
import hashlib, json
from functools import lru_cache
import numpy as np
from .config import PROCESSED, REGION, MODES, TERRAIN, SCIENCE_SIGMA_M, STOP_RADIUS_M
from .ingestion.pds3 import DataError
from .routing.engine import Grid, science_field, cell_cost, astar, analyse


class Store:
    def __init__(self, region_id: str = REGION["id"]):
        d = PROCESSED / region_id
        if not (d / "manifest.json").exists():
            raise DataError("No processed region found. Run: python scripts/build_region.py")
        self.dir = d
        self.manifest = json.loads((d / "manifest.json").read_text())
        g = np.load(d / "grid.npz")
        counts = g["counts"] if (g["counts"] >= 0).any() else None
        self.grid = Grid(g["z"], g["slope"], g["relief"], counts, float(g["lat_max"]), float(g["lon_west"]), float(g["ppd"]), float(g["radius_m"]))
        self.targets = self.manifest["targets"]
        self.S = science_field(self.grid, self.targets)
        self.routes: dict[str, dict] = {}

    @property
    def synthetic(self):
        return self.manifest["data_mode"] != "NASA_PDS"

    def default_endpoints(self):
        s = next(t for t in self.targets if t["role"] == "start"); d = next(t for t in self.targets if t["role"] == "destination")
        return {"lat": s["lat"], "lon": s["lon"], "name": s["name"]}, {"lat": d["lat"], "lon": d["lon"], "name": d["name"]}

    def route(self, start: dict, dest: dict, mode: str) -> dict:
        if mode not in MODES:
            raise DataError(f"Unknown route mode '{mode}'. Use one of: {', '.join(MODES)}")
        key = json.dumps([round(start["lat"], 5), round(start["lon"], 5), round(dest["lat"], 5), round(dest["lon"], 5), mode])
        rid = hashlib.sha1(key.encode()).hexdigest()[:12]
        if rid in self.routes:
            return self.routes[rid]
        g = self.grid
        a, b = g.cell(start["lat"], start["lon"]), g.cell(dest["lat"], dest["lon"])
        c = cell_cost(g, self.S, mode)
        path, total = astar(g, c, a, b, MODES[mode]["beta"])
        profile, segs, stops, metrics = analyse(g, self.S, c, path, mode, self.targets)
        coords = [[p["lon"], p["lat"]] for p in profile]
        r = {"route_id": rid, "mode": mode, "mode_label": MODES[mode]["label"], "intent": MODES[mode]["intent"],
             "weights": {k: MODES[mode][k] for k in ("alpha", "beta", "gamma")},
             "start": start, "dest": dest, "algorithm_cost": round(total, 1),
             "geojson": {"type": "Feature", "geometry": {"type": "LineString", "coordinates": coords},
                         "properties": {"route_id": rid, "mode": mode}},
             "profile": profile, "segments": segs, "stops": stops, "metrics": metrics,
             "data_mode": self.manifest["data_mode"]}
        self.routes[rid] = r
        return r

    def evidence(self, rid: str, seg_id: str) -> dict:
        r = self.routes.get(rid)
        if r is None:
            raise DataError("Route not found — generate it first")
        s = next((x for x in r["segments"] if x["id"] == seg_id), None)
        if s is None:
            raise DataError(f"Segment {seg_id} not found on this route")
        w = r["weights"]; topo = self.manifest["layers"][0]["provenance"]
        rank = sorted(r["segments"], key=lambda x: -x["cost_per_m"]).index(s) + 1
        t = TERRAIN
        terrain_text = (f"Mean slope {s['slope_mean_deg']}° (max {s['slope_max_deg']}°) and 3×3 local relief {s['relief_mean_m']} m "
                        f"give a modeled terrain cost T = {s['T_mean']} (0–1). Elevation {s['elev_start_m']} → {s['elev_end_m']} m "
                        f"(+{s['gain_m']:g} m up, {s['loss_m']:g} m down) over {s['length_m']/1000:.2f} km.")
        nt = s["nearest_target"]
        sci_text = (f"Nearest candidate target: {nt['name']} at {nt['distance_m']/1000:.2f} km ({nt['status']}). "
                    f"Mean science proximity S = {s['S_mean']}.") if nt else "No candidate science target in this region."
        share_cost = s["cost"] / max(1e-9, sum(x["cost"] for x in r["segments"]))
        share_len = s["length_m"] / max(1e-9, sum(x["length_m"] for x in r["segments"]))
        decision = (f"{s['id']} is part of ROUTE {s['id'][0]} ({r['mode_label']}). It carries {100*share_cost:.0f}% of the route's modeled cost "
                    f"over {100*share_len:.0f}% of its length. Under these weights, no cheaper connected path between the same endpoints exists (A* optimality).")
        return {
            "route_id": rid, "segment": s, "decision": decision, "mode": r["mode_label"], "rank_by_cost_per_m": f"{rank} of {len(r['segments'])}",
            "label": "Higher modeled traversal cost" if s["higher_cost"] else "Lower modeled traversal cost",
            "sections": {
                "TERRAIN": {"text": terrain_text, "status": "DERIVED" if not self.synthetic else "SYNTHETIC",
                            "values": [["mean slope", s["slope_mean_deg"], "deg"], ["max slope", s["slope_max_deg"], "deg"],
                                       ["local relief", s["relief_mean_m"], "m"], ["terrain cost T", s["T_mean"], "0–1"],
                                       ["elevation gain", s["gain_m"], "m"], ["length", s["length_m"], "m"]]},
                "SURFACE": {"text": "No surface imagery is integrated in this build. HiRISE orthoimagery of this segment is the planned next layer.",
                            "status": "DATA_UNAVAILABLE"},
                "SCIENCE": {"text": sci_text, "status": nt["status"] if nt else "DATA_UNAVAILABLE"},
                "DATA": {"text": f"{topo['source_name']} — {topo['product']}", "status": topo["status"], "url": topo["source_url"]},
                "METHOD": {"text": (f"Cell cost c = β + α·T + γ·(1−S) with α={w['alpha']}, β={w['beta']}, γ={w['gamma']} ({r['mode_label']}). "
                                    f"Edge cost = step length × mean c. A* search, 8-connected grid, admissible heuristic β × distance. "
                                    f"T = {t['w_slope']}·min(1, slope/{t['slope_ref_deg']}°)² + {t['w_relief']}·min(1, relief/{t['relief_ref_m']} m). "
                                    f"S = max exp(−d²/2σ²), σ = {SCIENCE_SIGMA_M:.0f} m."),
                           "breakdown": s["cost_breakdown"], "status": "DERIVED"},
                "PROVENANCE": {"chain": [topo["mission"], topo["instrument"], topo["product"], topo["archive"]], "status": topo["status"]},
                "LIMITATION": {"items": ["MOLA cells are ~463 m: boulders, small craters and short steep slopes are invisible at this scale.",
                                         (f"{round(100*s['interpolated_fraction'])}% of this segment's cells have zero MOLA shots (interpolated)."
                                          if s["interpolated_fraction"] is not None else "Shot-count coverage not available for this build."),
                                         "Cost weights are assumptions, not measured human mobility limits.",
                                         "This is a planning aid, not a safety assessment."], "status": "ASSUMPTION"},
            },
        }


@lru_cache(maxsize=1)
def get_store() -> Store:
    return Store()
