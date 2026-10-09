import type { Brief, Layer, Meta, Target } from '../types';
import { Chip } from './Panels';

function Strip({ st, letter }: { st: any; letter: string }) {
  const H = 560, top = 22, y = (km: number) => top + H - (km / st.length_km) * H;
  const ev = st.elev.map((e: number[]) => e[1]), mn = Math.min(...ev), mx = Math.max(...ev), sp = mx - mn || 1;
  const prof = st.elev.map((e: number[], i: number) => `${i ? 'L' : 'M'}${(96 - ((e[1] - mn) / sp) * 70).toFixed(1)} ${y(e[0]).toFixed(1)}`).join('');
  return (<svg viewBox={`0 0 250 ${H + 50}`} className="strip">
    <path d={`${prof}L96 ${y(st.length_km)}L96 ${y(0)}Z`} className="sp-fill" /><path d={prof} className="sp-prof" />
    <line x1={110} x2={110} y1={y(0)} y2={y(st.length_km)} className="sp-line" />
    {st.segments.map((s: any) => <g key={s.id}>{s.higher_cost && <line x1={110} x2={110} y1={y(s.from_km)} y2={y(s.to_km)} className="sp-hi" />}
      <line x1={102} x2={118} y1={y(s.from_km)} y2={y(s.from_km)} className="sp-tick" />
      <text x={124} y={(y(s.from_km) + y(s.to_km)) / 2 + 4} className={`sp-t ${s.higher_cost ? 'hi' : ''}`}>{s.id}</text></g>)}
    {st.stops.map((s: any) => <g key={s.label}><path d={`M110 ${y(s.at_km) - 8}l8 8l-8 8l-8 -8z`} className="sp-stop" />
      <text x={172} y={y(s.at_km) + 4} className="sp-t stop">{s.label.replace('SCIENCE ', '')}</text></g>)}
    <circle cx={110} cy={y(0)} r={6} className="sp-start" /><path d={`M110 ${y(st.length_km) - 9}l9 9l-9 9l-9 -9z`} className="sp-dest" />
    <text x={4} y={H + 46} className="sp-t">ROUTE {letter} · {st.length_km} km · elevation (left)</text></svg>);
}

export function BriefDoc({ b, onClose }: { b: Brief; onClose: () => void }) {
  const m = b.mission, r = b.route;
  const St = ({ s }: { s: string }) => <Chip s={s} />;
  return (<div className="modal" onClick={onClose}><div className="briefwrap" onClick={(e) => e.stopPropagation()}>
    <div className="noprint bactions"><button className="hbtn" onClick={() => window.print()}>PRINT / SAVE AS PDF</button><button className="hbtn" onClick={onClose}>CLOSE</button></div>
    <div className="doc">
      <div className="d-head"><div className="d-k">MARSCOPE · {b.doc_id} · GENERATED {b.generated}</div><h1>CREW ROUTE BRIEF</h1>
        <div className="d-cls">{b.classification}</div></div>
      <div className="d-body">
        <div className="d-strip"><Strip st={r.strip} letter={b.letter} /></div>
        <div className="d-grid">
          <div className="d-sec"><h4><em>01</em>MISSION</h4><div className="kv"><span>REGION</span><span>{m.region}</span>
            <span>START</span><span>{m.start.name || 'custom'} · {m.start.lat.toFixed(4)}°N {m.start.lon.toFixed(4)}°E</span>
            <span>DESTINATION</span><span>{m.destination.name || 'custom'} · {m.destination.lat.toFixed(4)}°N {m.destination.lon.toFixed(4)}°E</span>
            <span>PRIORITY</span><span>{m.route} · {m.mode} — {m.objective}</span></div></div>
          <div className="d-sec"><h4><em>02</em>ROUTE</h4><div className="kv"><span>LENGTH</span><span>{r.length_km} km · {r.segments} segments</span>
            <span>ELEVATION</span><span>+{r.elev_gain_m} m / −{r.elev_loss_m} m</span><span>SLOPE (MOLA SCALE)</span><span>mean {r.slope_mean_deg}° · max {r.slope_max_deg}°</span></div>
            {r.alternatives.length > 0 && <table><thead><tr><th>ALTERNATIVE</th><th>KM</th><th>MAX SLOPE</th><th>STOPS</th><th>HIGHER-COST</th></tr></thead>
              <tbody>{r.alternatives.map((a: any) => <tr key={a.mode}><td>ROUTE {a.letter} · {a.mode}</td><td>{a.length_km}</td><td>{a.slope_max_deg}°</td><td>{a.candidate_stops}</td><td>{a.higher_cost_segments}</td></tr>)}</tbody></table>}</div>
          <div className="d-sec"><h4><em>03</em>WATCH · TERRAIN</h4>{b.watch.length ? <ul>{b.watch.map((w: any) => <li key={w.id}><b>{w.id}</b> (km {w.km[0]}–{w.km[1]}) — {w.note}</li>)}</ul>
            : <p>No segment exceeds the higher-cost threshold under this priority.</p>}</div>
          <div className="d-sec"><h4><em>04</em>DISCOVER · SCIENCE</h4>{b.discover.length ? b.discover.map((s: any) => <div key={s.target_id} className="d-stop">
            <b>{s.label}</b> · {s.name} · km {s.at_km} · {s.distance_m} m from path <St s={s.status} />
            <div>{s.why}</div><div><i>Investigate:</i> {s.investigate}</div></div>) : <p>No candidate science target within the stop radius.</p>}</div>
          <div className="d-sec"><h4><em>05</em>CONDITIONS</h4><table><tbody>{b.conditions.map((c: any) => <tr key={c.item}><td>{c.item}</td><td>{c.text}</td><td><St s={c.status} /></td></tr>)}</tbody></table></div>
          <div className="d-sec"><h4><em>06</em>EVIDENCE · METHOD</h4><table><tbody>{b.evidence.map((e: any) => <tr key={e.name}><td>{e.name}</td><td><St s={e.status} /></td></tr>)}</tbody></table>
            <ul>{b.method.map((x: string) => <li key={x}>{x}</li>)}</ul></div>
          <div className="d-sec"><h4><em>07</em>UNCERTAINTY · LIMITATIONS</h4><ul>{b.uncertainty.map((x: string) => <li key={x}>{x}</li>)}</ul></div>
          <div className="d-sec"><h4><em>08</em>SOURCES</h4><ul>{b.sources.map((s: any) => <li key={s.name}><b>{s.name}</b>{s.archive ? ` — ${s.archive}` : ''}
            {s.url ? <span className="mono small"> · {s.url}</span> : null}{s.credit ? ` · Credit: ${s.credit}` : ''}</li>)}</ul></div>
        </div></div>
      <div className="d-foot">DON’T JUST MAP MARS. PLAN THE WALK. · MARSCOPE · TEAM DELTAX · PRE-EVENT SCREENING PROTOTYPE</div>
    </div></div></div>);
}

const rows: [string, string][] = [['source_name', 'Source'], ['mission', 'Mission'], ['instrument', 'Instrument'], ['product', 'Product'], ['archive', 'Archive'],
  ['source_url', 'Source URL'], ['spatial_reference', 'Spatial reference'], ['resolution', 'Resolution'], ['retrieval_date', 'Retrieved'], ['credit', 'Credit'], ['notes', 'Notes']];

export function SourcesDoc({ layers, targets, meta, focus, onClose }: { layers: Layer[]; targets: Target[]; meta: Meta; focus?: string; onClose: () => void }) {
  const ls = focus ? [...layers].sort((a) => (a.id === focus ? -1 : 1)) : layers;
  return (<div className="modal" onClick={onClose}><div className="mbox" onClick={(e) => e.stopPropagation()}><button className="x" onClick={onClose}>CLOSE</button>
    <div className="k">PROVENANCE</div><h2>DATA SOURCES</h2>
    {ls.map((l) => { const p = l.provenance; return (<div className="pcard" key={l.id} style={l.id === focus ? { borderColor: 'var(--cyan)' } : {}}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}><b>{l.name}</b><Chip s={p.status} /></div>
      <table><tbody>{rows.map(([k, lab]) => <tr key={k}><td>{lab}</td><td>{k === 'source_url' && String(p[k as keyof typeof p]).startsWith('http') ? <a href={p.source_url} target="_blank" rel="noreferrer">{p.source_url}</a> : String(p[k as keyof typeof p])}</td></tr>)}
        <tr><td>Processing</td><td><ol style={{ paddingLeft: 16 }}>{p.processing_steps.map((s: any, i) => <li key={i}>{typeof s === 'string' ? s : `${s.step}: ${s.note || s.validation || ''}${s.rows ? ` rows ${s.rows.join('–')}, cols ${s.cols.join('–')}, resampled: ${s.resampled}` : ''}${s.bytes ? ` (${s.file}, ${s.bytes} bytes, ${s.lines}×${s.samples})` : ''}`}</li>)}</ol></td></tr>
        <tr><td>Limitations</td><td><ul style={{ paddingLeft: 16 }}>{p.limitations.map((x) => <li key={x}>{x}</li>)}</ul></td></tr></tbody></table></div>); })}
    <div className="pcard"><b>Candidate targets</b><table><tbody>{targets.map((t) => <tr key={t.id}><td>{t.name}</td><td><Chip s={t.status} /> {t.source} {t.source_url && <a href={t.source_url} target="_blank" rel="noreferrer">link</a>}</td></tr>)}</tbody></table></div>
    <div className="pcard"><b>Not integrated in this build</b><table><tbody>{meta.unavailable.map((u) => <tr key={u.id}><td>{u.name}</td><td><Chip s={u.status} /> {u.plan}</td></tr>)}</tbody></table></div>
  </div></div>);
}

export function LimitsDoc({ meta, onClose }: { meta: Meta; onClose: () => void }) {
  const a = meta.assumptions, t = a.terrain, s = meta.stats;
  const groups: [string, string[]][] = [
    ['Data mode', [meta.data_mode === 'NASA_PDS' ? 'Terrain values come from the official MOLA MEGDR tile (unchanged), clipped to the region.' :
      'SYNTHETIC TEST FIXTURE: terrain values are NOT NASA data. Run scripts/fetch_mola.py + scripts/build_region.py to load real MOLA.']],
    ['Unavailable layers', meta.unavailable.map((u) => `${u.name} — ${u.status.replace('_', ' ')}`)],
    ['Missing coverage', [s.interpolated_fraction != null ? `${Math.round((s.interpolated_fraction as number) * 100)}% of MOLA bins in this region contain zero laser shots (interpolated). Toggle "MOLA coverage" to see them.` : 'Shot-count layer not loaded.']],
    ['Different resolutions', ['All analysis runs on the native 1/128° MOLA grid (~463 m N-S). Nothing is resampled. Future HiRISE/CRISM layers are 100–1000× finer and will need explicit, documented resampling.']],
    ['Preprocessing assumptions', [`Slope by central differences over ~926 m baselines; local relief = 3×3 max−min.`, `Display hillshade uses 3× vertical exaggeration (display only, never used in analysis).`]],
    ['Spatial uncertainty', ['MOLA shot locations are known to ~100 m; the grid cell is ~463 m. Target positions marked APPROXIMATE are placements, not surveyed points.']],
    ['Route-model assumptions', [`T = ${t.w_slope}·min(1, slope/${t.slope_ref_deg}°)² + ${t.w_relief}·min(1, relief/${t.relief_ref_m} m)`, `Cells steeper than ${t.max_slope_deg}° are excluded (${s.excluded_cells} cells here). This is a modelling threshold, NOT a human mobility limit.`,
      `Science proximity σ = ${a.science_sigma_m} m.`, ...Object.values(a.modes).map((m) => `${m.label}: α=${m.alpha}, β=${m.beta}, γ=${m.gamma}`)]],
    ['Unsupported conclusions', ['MARSCOPE does not label any route safe or unsafe.', 'No mineral detections are claimed; science targets come from published descriptions or derived topography.']],
    ['Temporal information', ['MOLA data were acquired 1999–2001. No dust, weather, lighting or seasonal conditions are modeled.']],
  ];
  return (<div className="modal" onClick={onClose}><div className="mbox" onClick={(e) => e.stopPropagation()}><button className="x" onClick={onClose}>CLOSE</button>
    <div className="k">SCIENTIFIC HONESTY IS PART OF THE PRODUCT</div><h2>DATA LIMITATIONS</h2>
    {groups.map(([g, items]) => <div className="pcard" key={g}><b>{g}</b><ul style={{ paddingLeft: 18, marginTop: 6 }}>{items.map((x) => <li key={x}>{x}</li>)}</ul></div>)}
    <div className="pcard"><b>Status vocabulary used in the interface</b><table><tbody>{Object.entries(meta.status_vocabulary).map(([k, v]) => <tr key={k}><td><Chip s={k} /></td><td>{v}</td></tr>)}</tbody></table></div>
  </div></div>);
}

export function SystemDoc({ meta, onClose }: { meta: Meta; onClose: () => void }) {
  const n = meta.pipeline.length, x = (i: number) => 60 + i * (880 / (n - 1));
  let d = ''; for (let px = 60; px <= 940; px += 5) d += `${d ? 'L' : 'M'}${px} ${60 + 12 * Math.sin(((px - 60) / (880 / (n - 1))) * Math.PI)}`;
  return (<div className="modal" onClick={onClose}><div className="mbox wide" onClick={(e) => e.stopPropagation()}><button className="x" onClick={onClose}>CLOSE</button>
    <div className="kick">ARCHITECTURE · STATUS OF THIS PRE-EVENT BUILD</div><h2>FROM ORBIT TO ONE PAGE</h2>
    <svg viewBox="0 0 1000 150" className="pipe-svg"><path d={d} className="pp-line" />
      {meta.pipeline.map((p, i) => <g key={p.stage}><circle cx={x(i)} cy={60} r={8} className={`pp-dot ${p.status}`} />
        {(() => { const w = p.stage.split(' '); const h = Math.ceil(w.length / 2); return [w.slice(0, h).join(' '), w.slice(h).join(' ')]; })().map((t, k) =>
          <text key={k} x={x(i)} y={96 + k * 16} className="pp-t">{t}</text>)}
        <text x={x(i)} y={136} className="pp-s">{String(i + 1).padStart(2, '0')}</text></g>)}</svg>
    <table className="ptable"><thead><tr><th>#</th><th>STAGE</th><th>STATUS</th><th>IN THIS BUILD</th><th>NEXT (HACKATHON)</th></tr></thead>
      <tbody>{meta.pipeline.map((p, i) => <tr key={p.stage}><td>{String(i + 1).padStart(2, '0')}</td><td><b>{p.stage}</b></td><td><span className={`chip ${p.status === 'IMPLEMENTED' ? 'DERIVED' : 'CONCEPTUAL'}`}>{p.status}</span></td><td>{p.built}</td><td>{p.next}</td></tr>)}</tbody></table>
    <div className="k" style={{ marginTop: 12, lineHeight: 1.6 }}>Data in use: {meta.data_mode === 'NASA_PDS' ? 'official MOLA MEGDR (PDS)' : 'SYNTHETIC TEST FIXTURE — load real MOLA with scripts/fetch_mola.py'}.</div>
  </div></div>);
}
