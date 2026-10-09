export type Status = 'VERIFIED' | 'DERIVED' | 'ASSUMPTION' | 'CONCEPTUAL' | 'DATA_UNAVAILABLE' | 'SYNTHETIC' | 'APPROXIMATE' | string;
export interface Provenance { id: string; source_name: string; mission: string; instrument: string; product: string; source_url: string;
  archive: string; spatial_reference: string; coverage: unknown; resolution: string; retrieval_date: string; processing_steps: unknown[];
  credit: string; notes: string; limitations: string[]; status: Status; }
export interface Layer { id: string; name: string; png: string; url: string; default?: boolean; smooth?: boolean;
  legend: { type: string; min?: number; max?: number; unit?: string; colors: string[]; label?: string }; provenance: Provenance; }
export interface Target { id: string; name: string; lat: number; lon: number; role: string; science: boolean; status: Status;
  source: string; source_url?: string; why: string; investigate: string; limitation: string; fixture_note?: string; }
export interface Pt { lat: number; lon: number; name?: string | null }
export interface ProfilePt { d_km: number; lat: number; lon: number; elev_m: number; slope_deg: number; relief_m: number; T: number; S: number; interpolated: boolean | null }
export interface Segment { id: string; index: number; from_vertex: number; to_vertex: number; coords: [number, number][]; length_m: number;
  elev_start_m: number; elev_end_m: number; gain_m: number; loss_m: number; slope_mean_deg: number; slope_max_deg: number; relief_mean_m: number;
  T_mean: number; S_mean: number; cost: number; cost_per_m: number; cost_breakdown: Record<string, number>; higher_cost: boolean;
  interpolated_fraction: number | null; nearest_target: { id: string; name: string; distance_m: number; status: Status } | null }
export interface Route { route_id: string; mode: string; mode_label: string; intent: string; weights: { alpha: number; beta: number; gamma: number };
  start: Pt; dest: Pt; geojson: { geometry: { coordinates: [number, number][] } }; profile: ProfilePt[]; segments: Segment[];
  stops: { target_id: string; name: string; distance_m: number; at_km: number; status: Status; number: string; label: string }[];
  metrics: Record<string, number | null>; data_mode: string }
export interface Section { text?: string; status: Status; values?: [string, number, string][]; url?: string; breakdown?: Record<string, number>; chain?: string[]; items?: string[] }
export interface Evidence { route_id: string; segment: Segment; decision: string; mode: string; rank_by_cost_per_m: string; label: string; sections: Record<string, Section> }
export interface Meta { data_mode: string; built: string; region: { id: string; name: string; why: string; bounds: { lat_min: number; lat_max: number; lon_min: number; lon_max: number };
  shape: number[]; ppd: number; radius_m: number }; assumptions: { terrain: Record<string, number>; modes: Record<string, { label: string; alpha: number; beta: number; gamma: number; intent: string }>; science_sigma_m: number };
  stats: Record<string, number | null>; status_vocabulary: Record<string, string>; unavailable: { id: string; name: string; status: Status; plan: string }[];
  pipeline: { stage: string; sub: string; status: Status; built: string; next: string }[] }
export interface Diff { mode: string; letter: string; vs: string; facts: string[]; why: string; shared_cells_pct: number }
export type Brief = Record<string, any>;
