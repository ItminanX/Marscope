import type { Diff, Evidence, Layer, Meta, Pt, Route, Section, Target } from '../types';
import { MODE_COLOR } from './MapView';

export const LETTER: Record<string, string> = { traversability: 'A', science: 'B', balanced: 'C' };
export const Chip = ({ s }: { s: string }) => <span className={`chip ${s}`}>{String(s).replace('_', ' ')}</span>;

/* ---------------- LEFT RAIL (film: SCALE + LAYERS) ---------------- */
const GROUPS: { name: string; sub: string; layers: string[]; extra: string[] }[] = [
  { name: 'TERRAIN', sub: 'MOLA · ELEVATION', layers: ['terrain', 'slope', 'cost'], extra: [] },
  { name: 'SURFACE', sub: 'HiRISE · IMAGERY', layers: [], extra: ['hirise'] },
  { name: 'SCIENCE', sub: 'TARGETS · CRISM', layers: ['science'], extra: ['crism'] },
  { name: 'CONTEXT', sub: 'COVERAGE · THEMIS', layers: ['coverage'], extra: ['themis', 'weather'] },
];
export function Rail({ layers, visible, toggle, onSource, meta, scale }: { layers: Layer[]; visible: Record<string, boolean>; toggle: (id: string) => void;
  onSource: (l: Layer) => void; meta: Meta; scale: number }) {
  return (<>
    <div className="sec"><h3>Scale</h3>
      {['GLOBAL', 'REGIONAL', 'LOCAL', 'ROUTE'].map((s, i) => <div key={s} className={`lad ${scale === i ? 'on' : ''} ${i === 0 ? 'na' : ''}`} title={i === 0 ? 'Global view not in this build' : ''}><i />{s}{i === 0 && <em>NOT IN BUILD</em>}</div>)}</div>
    <div className="sec"><h3>Layers</h3>
      {GROUPS.map((g) => { const active = g.layers.some((id) => visible[id]); return (
        <div className={`grp ${active ? 'act' : ''}`} key={g.name}>
          <div className="gh"><i className={`dot ${g.layers.length ? 'on' : ''}`} /><div><b>{g.name}</b><span>{g.sub}</span></div></div>
          {g.layers.map((id) => { const l = layers.find((x) => x.id === id); if (!l) return null; return (
            <div className="lyr" key={id}><input type="checkbox" checked={!!visible[id]} onChange={() => toggle(id)} aria-label={l.name} />
              <div><b>{l.name}</b>
                {visible[id] && (l.legend.type === 'ramp'
                  ? (<><div className="legend" style={{ background: `linear-gradient(90deg, ${l.legend.colors.join(',')})` }} /><div className="lr"><span>{l.legend.min}</span><span>{l.legend.unit}</span><span>{l.legend.max}</span></div></>)
                  : (<div className="lr"><span><i className="sw0" style={{ background: l.legend.colors[0] }} />{l.legend.label}</span></div>))}
                <button className="src" onClick={() => onSource(l)}>Where did this come from?</button></div>
              <Chip s={l.provenance.status} /></div>); })}
          {g.extra.map((id) => { const u = meta.unavailable.find((x) => x.id === id); if (!u) return null; return (
            <div className="lyr na" key={id} title={u.plan}><input type="checkbox" disabled /><div><b>{u.name}</b><div className="lr"><span>{u.plan}</span></div></div><Chip s={u.status} /></div>); })}
        </div>); })}
    </div>
    <div className="sec"><h3>Status language</h3><div className="k" style={{ lineHeight: 2.1 }}>
      <Chip s="VERIFIED" /> official data<br /><Chip s="DERIVED" /> computed from it<br /><Chip s="ASSUMPTION" /> configurable<br />
      <Chip s="APPROXIMATE" /> placed, not surveyed<br /><Chip s="CONCEPTUAL" /> future<br /><Chip s="DATA_UNAVAILABLE" /><br /><Chip s="SYNTHETIC" /> test fixture</div></div>
  </>);
}

/* ---------------- EXPLORE ---------------- */
export function ExplorePanel({ meta, targets, onTarget, onSystem, layers, onSource }: { meta: Meta; targets: Target[]; onTarget: (t: Target) => void; onSystem: () => void; layers: Layer[]; onSource: (l: Layer) => void }) {
  return (<>
    <div className="sec"><div className="kick">REGION OF INTEREST</div><h2 className="h2">{meta.region.name}</h2><p className="p">{meta.region.why}</p>
      <div className="mt" style={{ marginTop: 10 }}><span>grid <b>{meta.region.shape.join(' × ')}</b></span><span>cell <b>1/{meta.region.ppd}°</b></span>
        <span>elev <b>{meta.stats.elev_min_m}…{meta.stats.elev_max_m} m</b></span><span>slope p95 <b>{meta.stats.slope_p95_deg}°</b></span>
        <span>interpolated <b>{meta.stats.interpolated_fraction != null ? Math.round((meta.stats.interpolated_fraction as number) * 100) + '%' : '—'}</b></span><span>excluded cells <b>{meta.stats.excluded_cells}</b></span></div></div>
    <div className="sec"><h3>Evidence sources</h3>{layers.slice(0, 1).concat(layers.filter((l) => l.id === 'coverage')).map((l) =>
      <div key={l.id} className="srcrow"><div><b>{l.provenance.instrument}</b><span>{l.provenance.product}</span></div><Chip s={l.provenance.status} />
        <button className="src" onClick={() => onSource(l)}>record</button></div>)}</div>
    <div className="sec"><h3>Candidate targets</h3>{targets.map((t) => (
      <button key={t.id} className="trow" onClick={() => onTarget(t)}><i className={`tm ${t.role}`} /><div><b>{t.name}</b><span>{t.role.toUpperCase()} · {t.lat.toFixed(4)}°N {t.lon.toFixed(4)}°E</span></div><Chip s={t.status} /></button>))}</div>
    <div className="sec"><h3>System</h3><div className="pipe-mini">{meta.pipeline.map((p, i) => <div key={p.stage} title={p.built}><i className={p.status} /><span>{String(i + 1).padStart(2, '0')}</span>{p.stage}</div>)}</div>
      <button className="src" onClick={onSystem}>Open the pipeline</button></div>
  </>);
}

/* ---------------- PLAN (film: ROUTE PLANNER) ---------------- */
export function PlanPanel({ meta, start, dest, picking, setPicking, mode, chooseMode, generate, busy, routes, sel, onSel, diffs }: {
  meta: Meta; start: Pt; dest: Pt; picking: string | null; setPicking: (p: 'start' | 'dest' | null) => void; mode: string; chooseMode: (m: string) => void;
  generate: () => void; busy: boolean; routes: Route[]; sel: string | null; onSel: (id: string) => void; diffs: Diff[] }) {
  const w = meta.assumptions.modes[mode];
  return (<>
    <div className="sec"><h3>Route planner</h3>
      <div className="fld"><span>START</span><b>{start.name || 'Custom point'}</b><small>{start.lat.toFixed(4)}°N {start.lon.toFixed(4)}°E</small></div>
      <div className="fld"><span>DESTINATION</span><b>{dest.name || 'Custom point'}</b><small>{dest.lat.toFixed(4)}°N {dest.lon.toFixed(4)}°E</small></div>
      <div className="pick"><button className={picking === 'start' ? 'on' : ''} onClick={() => setPicking(picking === 'start' ? null : 'start')}>SET START ON MAP</button>
        <button className={picking === 'dest' ? 'on' : ''} onClick={() => setPicking(picking === 'dest' ? null : 'dest')}>SET DESTINATION</button></div>
      <h3 style={{ marginTop: 14 }}>Mission priority</h3>
      <div className="prio">{['traversability', 'science', 'balanced'].map((m) => <button key={m} className={mode === m ? 'on' : ''} onClick={() => chooseMode(m)}>
        <i style={{ background: MODE_COLOR[m] }} />{meta.assumptions.modes[m].label}</button>)}</div>
      <div className="weights">c = β + α·T + γ·(1−S) · α <em>{w.alpha}</em> β <em>{w.beta}</em> γ <em>{w.gamma}</em><br /><span>{w.intent}</span></div>
      <button className="go" disabled={busy} onClick={generate}>{busy ? 'COMPUTING…' : routes.length ? 'RECOMPUTE ROUTES' : 'GENERATE ROUTES'}</button></div>
    {routes.length > 0 && <div className="sec"><h3>Candidate routes · computed by A*</h3>
      {routes.map((r) => { const m = r.metrics; return (
        <div key={r.route_id} className={`rcard ${r.route_id === sel ? 'on' : ''}`} onClick={() => onSel(r.route_id)} tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onSel(r.route_id)}>
          <h4><i style={{ background: MODE_COLOR[r.mode] }} />ROUTE {LETTER[r.mode]} · {r.mode_label}{r.route_id === sel && <em>SELECTED</em>}</h4>
          <div className="mt"><span>length <b>{m.length_km} km</b></span><span>max slope <b>{m.slope_max_deg}°</b></span><span>gain <b>+{m.elev_gain_m} m</b></span>
            <span>mean T <b>{m.T_mean}</b></span><span>higher-cost <b>{m.higher_cost_segments}/{m.segments}</b></span><span>science stops <b>{m.candidate_stops}</b></span></div></div>); })}
      <div className="k" style={{ lineHeight: 1.6 }}>Descriptive comparison. No route is ranked "best" or called "safe".</div></div>}
    {diffs.length > 0 && <div className="sec"><h3>Why do the routes differ?</h3>{diffs.map((d) => (
      <div className="diff" key={d.mode}><b><i style={{ background: MODE_COLOR[Object.keys(LETTER).find((k) => LETTER[k] === d.letter)!] }} />ROUTE {d.letter} vs ROUTE C</b>
        <ul>{d.facts.map((f) => <li key={f}>{f}</li>)}<li>{d.shared_cells_pct}% of cells shared with ROUTE C</li></ul><p>{d.why}</p></div>))}</div>}
  </>);
}

/* ---------------- WHY (film: evidence chain → route decision) ---------------- */
function Spark({ route, seg }: { route: Route; seg: Evidence['segment'] }) {
  const pr = route.profile.slice(Math.max(0, seg.from_vertex - 6), seg.to_vertex + 7);
  const v = pr.map((p) => p.elev_m), mn = Math.min(...v), mx = Math.max(...v), sp = mx - mn || 1;
  const d = pr.map((p, i) => `${i ? 'L' : 'M'}${(i / (pr.length - 1)) * 230} ${56 - ((p.elev_m - mn) / sp) * 48}`).join('');
  const a = (Math.min(6, seg.from_vertex) / (pr.length - 1)) * 230, b = ((pr.length - 1 - Math.min(6, route.profile.length - 1 - seg.to_vertex)) / (pr.length - 1)) * 230;
  return (<svg viewBox="0 0 230 62" className="spark"><rect x={a} y={0} width={Math.max(2, b - a)} height={62} className="pv-seg" />
    <path d={`${d}L230 62L0 62Z`} className="pv-fill" /><path d={d} className="pv-line" /><text x={a + 4} y={60} className="pv-t">{seg.id}</text>
    <text x={226} y={10} className="pv-t r">{Math.round(mx)} m</text><text x={226} y={60} className="pv-t r">{Math.round(mn)} m</text></svg>);
}
const Node = ({ n, name, s, children }: { n: string; name: string; s: Section | { status: string; text?: string }; children?: any }) => (
  <div className="node"><div className="nk"><em>{n}</em>{name}<Chip s={s.status} /></div>{s.text && <p>{s.text}</p>}{children}</div>);
export function WhyPanel({ ev, route, onSources }: { ev: Evidence; route: Route | null; onSources: () => void }) {
  const S = ev.sections, bd = S.METHOD.breakdown || {}; const L = ev.segment.id[0];
  return (<div className="sec why">
    <div className="kick">EVIDENCE CHAIN · SEGMENT {ev.segment.id} · ROUTE {L} {ev.mode}</div><h2 className="h2 big">WHY THIS SEGMENT?</h2>
    <div className="lab"><span className="chip ASSUMPTION">{ev.label.toUpperCase()}</span><span className="k">cost / m rank {ev.rank_by_cost_per_m} · modeled, not measured</span></div>
    <div className="chainbox">
      <Node n="01" name="TERRAIN" s={S.TERRAIN}>{route && <Spark route={route} seg={ev.segment} />}
        <table className="vt"><tbody>{S.TERRAIN.values!.map(([k, v, u]) => <tr key={k}><td>{k}</td><td>{v}</td><td>{u}</td></tr>)}</tbody></table></Node>
      <Node n="02" name="SURFACE" s={S.SURFACE} />
      <Node n="03" name="SCIENCE" s={S.SCIENCE} />
      <Node n="04" name="DATA · SOURCE" s={S.DATA}><a className="src" href={S.DATA.url} target="_blank" rel="noreferrer">{S.DATA.url}</a></Node>
      <Node n="05" name="METHOD" s={S.METHOD}><div className="bar">{Object.values(bd).map((v, i) => <i key={i} style={{ width: `${v * 100}%` }} />)}</div>
        <div className="barl">{Object.entries(bd).map(([k, v]) => <span key={k}>{k} {(v * 100).toFixed(0)}%</span>)}</div></Node>
      <Node n="06" name="PROVENANCE" s={S.PROVENANCE}><div className="chain">{S.PROVENANCE.chain!.map((c) => <div key={c}>{c}</div>)}</div>
        <button className="src" onClick={onSources}>Open the full source record</button></Node>
      <Node n="07" name="LIMITATION" s={S.LIMITATION}><ul className="ul">{S.LIMITATION.items!.map((t) => <li key={t}>{t}</li>)}</ul></Node>
      <div className="node dec"><div className="nk"><em>→</em>ROUTE DECISION</div><p>{ev.decision}</p></div>
    </div>
    <div className="foot">A ROUTE IS NOT A LINE. IT IS A CHAIN OF EVIDENCE.</div>
  </div>);
}

/* ---------------- SCIENCE STOP (film Scene 10) ---------------- */
export function StopPanel({ t, route }: { t: Target; route: Route | null }) {
  const on = route?.stops.find((s) => s.target_id === t.id);
  return (<div className="sec why">
    <div className="kick amber">{on ? `${on.label} · ON ROUTE ${LETTER[route!.mode]}` : t.science ? 'CANDIDATE SCIENCE TARGET' : t.role.toUpperCase()}</div>
    <h2 className="h2">{t.science ? 'CANDIDATE SCIENCE AREA' : t.role === 'start' ? 'START POINT' : 'CONTEXT POINT'}</h2>
    <div className="lab"><b>{t.name}</b></div><div className="lab"><Chip s={t.status} /><span className="k">{t.lat.toFixed(4)}°N {t.lon.toFixed(4)}°E</span></div>
    {on && <div className="k" style={{ color: 'var(--cyan)', margin: '4px 0 10px' }}>{on.distance_m} m from the path at km {on.at_km}</div>}
    <div className="srow"><b>WHY HERE?</b><span>{t.why}</span></div>
    <div className="srow"><b>WHAT DATA SUPPORTS THIS?</b><span>{t.source}</span>{t.source_url && <a className="src" href={t.source_url} target="_blank" rel="noreferrer">{t.source_url}</a>}</div>
    <div className="srow"><b>WHAT COULD AN EXPLORER INVESTIGATE?</b><span>{t.investigate}</span></div>
    <div className="srow"><b>LIMITATION</b><span>{t.limitation}</span>{t.fixture_note && <span style={{ color: 'var(--red)' }}>{t.fixture_note}</span>}</div>
  </div>);
}
