/* ===== evidence graph: force layout + SVG renderer (no dependencies) ===== */
const TCOL = { Person: 'var(--cy)', Organization: 'var(--vi)', Money: 'var(--am)', Location: 'var(--gr)', ID: 'var(--mut)', Date: 'var(--mut)', Product: '#d9609f' };
const GW = 900, GH = 560;

function layoutFor(e0) {
  if (e0._layout) return e0._layout;
  const nodes = e0.entities.filter(e => e.rels.length), pos = {};
  let seed = 11; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  nodes.forEach((n, i) => { const a = i / (nodes.length || 1) * Math.PI * 2; pos[n.id] = { x: GW / 2 + Math.cos(a) * 240 + rnd() * 20, y: GH / 2 + Math.sin(a) * 200 + rnd() * 20, vx: 0, vy: 0 }; });
  const es = e0.relationships.filter(r => pos[r.s] && pos[r.t]);
  for (let it = 0; it < 420; it++) {
    const t = 1 - it / 420;
    for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
      const a = pos[nodes[i].id], b = pos[nodes[j].id]; let dx = a.x - b.x, dy = a.y - b.y; const d2 = dx * dx + dy * dy + .01, d = Math.sqrt(d2), f = 9000 / d2;
      dx /= d; dy /= d; a.vx += dx * f; a.vy += dy * f; b.vx -= dx * f; b.vy -= dy * f;
    }
    es.forEach(r => { const a = pos[r.s], b = pos[r.t]; let dx = b.x - a.x, dy = b.y - a.y; const d = Math.sqrt(dx * dx + dy * dy) || 1, f = (d - 110) * .02; dx /= d; dy /= d; a.vx += dx * f; a.vy += dy * f; b.vx -= dx * f; b.vy -= dy * f; });
    nodes.forEach(n => { const p = pos[n.id]; p.vx += (GW / 2 - p.x) * .004; p.vy += (GH / 2 - p.y) * .006; p.x += p.vx * t * .9; p.y += p.vy * t * .9; p.vx *= .6; p.vy *= .6; });
  }
  const xs = nodes.map(n => pos[n.id].x), ys = nodes.map(n => pos[n.id].y), mnx = Math.min(...xs), mxx = Math.max(...xs), mny = Math.min(...ys), mxy = Math.max(...ys);
  const out = {}; nodes.forEach(n => { const p = pos[n.id]; out[n.id] = { x: 70 + (p.x - mnx) / ((mxx - mnx) || 1) * (GW - 140), y: 50 + (p.y - mny) / ((mxy - mny) || 1) * (GH - 100) }; });
  return (e0._layout = { nodes, pos: out });
}

function shape(type, x, y, col) {
  const s = `style="stroke:${col}"`;
  switch (type) {
    case 'Person': return `<circle class="shape" cx="${x}" cy="${y}" r="15" ${s}/>`;
    case 'Organization': return `<rect class="shape" x="${x - 15}" y="${y - 13}" width="30" height="26" rx="6" ${s}/>`;
    case 'Money': return `<polygon class="shape" ${s} points="${[0, 1, 2, 3, 4, 5].map(i => (x + 15 * Math.cos(i * Math.PI / 3)).toFixed(1) + ',' + (y + 15 * Math.sin(i * Math.PI / 3)).toFixed(1)).join(' ')}"/>`;
    case 'Location': return `<polygon class="shape" ${s} points="${x},${y - 16} ${x + 16},${y} ${x},${y + 16} ${x - 16},${y}"/>`;
    case 'Product': return `<polygon class="shape" ${s} points="${x},${y - 15} ${x + 15},${y + 12} ${x - 15},${y + 12}"/>`;
    case 'Date': return `<circle class="shape" cx="${x}" cy="${y}" r="9" ${s}/>`;
    default: return `<rect class="shape" x="${x - 10}" y="${y - 10}" width="20" height="20" ${s}/>`;
  }
}
const nodePos = (L, id) => S.g.pos[id] || L.pos[id];
function edgeGeom(L, r, group) {
  const a = nodePos(L, r.s), b = nodePos(L, r.t); const k = r.s < r.t ? r.s + '|' + r.t : r.t + '|' + r.s, g = group[k], i = g.indexOf(r.id), off = (i - (g.length - 1) / 2) * 38;
  const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2, dx = b.x - a.x, dy = b.y - a.y, d = Math.sqrt(dx * dx + dy * dy) || 1, cx = mx + -dy / d * off, cy = my + dx / d * off;
  return { d: `M${a.x.toFixed(1)} ${a.y.toFixed(1)} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`, lx: .25 * a.x + .5 * cx + .25 * b.x, ly: .25 * a.y + .5 * cy + .25 * b.y };
}
const isConEdge = r => { const e0 = I(), po = id => e0.E[id] && ['Person', 'Organization'].includes(e0.E[id].type); return po(r.s) && po(r.t) && e0.contradictions.some(c => c.b.some(id => r.ev.includes(id))); };

function graphSVGInner(mini) {
  const e0 = I(), L = layoutFor(e0), G = S.g, rs = rels().filter(r => nodePos(L, r.s) && nodePos(L, r.t));
  const vis = new Set(L.nodes.filter(n => !G.hide[n.type]).map(n => n.id)); const m = e0.E;
  const edges = rs.filter(r => vis.has(r.s) && vis.has(r.t));
  const group = {}; edges.forEach(r => { const k = r.s < r.t ? r.s + '|' + r.t : r.t + '|' + r.s; (group[k] = group[k] || []).push(r.id); });
  const sel = !mini && G.sel; let focusN = null, focusE = null;
  if (sel && sel.k === 'n') { focusN = new Set([sel.id]); edges.forEach(r => { if (r.s === sel.id || r.t === sel.id) { focusN.add(r.s); focusN.add(r.t); } }); }
  if (sel && sel.k === 'e') { const r = edges.find(x => x.id === sel.id); if (r) { focusE = r.id; focusN = new Set([r.s, r.t]); } }
  const q = !mini && G.q.toLowerCase(), qn = q ? new Set(L.nodes.filter(n => n.name.toLowerCase().includes(q) || n.aliases.some(a => a.toLowerCase().includes(q))).map(n => n.id)) : null;
  const path = !mini && G.path;
  let out = '';
  edges.forEach(r => {
    const g = edgeGeom(L, r, group), con = isConEdge(r), onPath = path && path.edges.has(r.id);
    const dim = (focusN && !(focusE ? r.id === focusE : (focusN.has(r.s) && focusN.has(r.t) && (sel.k === 'n' ? (r.s === sel.id || r.t === sel.id) : true)))) || (path && !onPath) || (qn && !(qn.has(r.s) || qn.has(r.t)));
    out += `<path class="gedge ${con ? 'con' : ''} ${dim ? 'dim' : ''} ${focusE === r.id ? 'sel' : ''} ${onPath ? 'path' : ''}" d="${g.d}"/>`;
    if (!mini) { out += `<path d="${g.d}" fill="none" stroke="transparent" stroke-width="14" data-eid="${esc(r.id)}" style="cursor:pointer"/>`; if (focusE === r.id || (sel && sel.k === 'n' && !dim) || con || onPath || G.v.k > 1.4) out += `<text class="glab" x="${g.lx.toFixed(1)}" y="${g.ly.toFixed(1)}">${esc(r.type.length > 34 ? r.type.slice(0, 32) + '…' : r.type)}</text>`; }
  });
  L.nodes.filter(n => vis.has(n.id)).forEach(n => {
    const p = nodePos(L, n.id), col = TCOL[n.type] || '#8c9cba';
    const dim = (focusN && !focusN.has(n.id)) || (qn && !qn.has(n.id)) || (path && !path.nodes.has(n.id));
    out += `<g class="gnode ${dim ? 'dim' : ''} ${sel && sel.k === 'n' && sel.id === n.id ? 'sel' : ''}" data-nid="${esc(n.id)}">${shape(n.type, +p.x.toFixed(1), +p.y.toFixed(1), col)}${(!mini || ['Person', 'Organization'].includes(n.type)) ? `<text x="${p.x.toFixed(1)}" y="${(p.y + 30).toFixed(1)}">${esc(n.name.length > 20 ? n.name.slice(0, 18) + '…' : n.name)}</text>` : ''}</g>`;
  });
  return out || '';
}
function miniGraph() {
  const e0 = I(); if (!e0.relationships.length) return '<p class="sm mut">No relationships yet.</p>';
  layoutFor(e0);
  return `<button data-act="go" data-r="graph" aria-label="Open the evidence graph" style="display:block;width:100%;background:none;border:0;padding:0"><svg viewBox="0 0 ${GW} ${GH}" style="width:100%;height:auto;background:radial-gradient(ellipse at 50% 40%,var(--gbg1),var(--gbg2));border-radius:8px;border:1px solid var(--line)">${graphSVGInner(true)}</svg></button>`;
}

V.graph = () => {
  const e0 = I(), G = S.g; if (!e0.docs.length) return ph('Relationships', 'Interactive evidence graph.') + needDocs();
  if (S.arg) { const [k, id] = S.arg.split(':'); G.sel = { k: k === 'n' ? 'n' : 'e', id }; S.arg = ''; G.path = null; }
  const L = layoutFor(e0);
  if (!L.nodes.length) return ph('Relationships', 'Interactive evidence graph.') + empty('No relationships found', 'Entities need to appear together in the same passage before a relationship can be drawn.');
  const types = [...new Set(L.nodes.map(n => n.type))], opts = L.nodes.map(n => `<option value="${esc(n.id)}">${esc(n.name)}</option>`).join('');
  return `${ph('Evidence graph', `${L.nodes.length} of ${e0.entities.length} entities have relationships. Click a node or a line to see the evidence behind it. Amber dashed lines touch a potential contradiction.`)}
  <div class="row" style="margin-bottom:10px"><input type="search" data-in="gq" value="${esc(G.q)}" placeholder="Search nodes" aria-label="Search graph nodes" style="max-width:220px">
   ${types.map(t => `<button class="chip ${G.hide[t] ? '' : 'on'}" data-act="gtype" data-t="${t}" aria-pressed="${!G.hide[t]}"><i class="dot t-${t}"></i>${t}</button>`).join('')}</div>
  <div class="row" style="margin-bottom:10px"><span class="sm mut">Highlight path</span><select id="pfrom" aria-label="Path from" style="max-width:190px"><option value="">From…</option>${opts}</select><select id="pto" aria-label="Path to" style="max-width:190px"><option value="">To…</option>${opts}</select><button class="btn sm" data-act="gpath">Find path</button>${G.path ? '<button class="btn sm ghost" data-act="gpathclear">Clear path</button>' : ''}</div>
  <div class="gwrap"><div id="gbox"><div class="gtools"><button class="btn sm" data-act="gzoom" data-d="1.25" aria-label="Zoom in">+</button><button class="btn sm" data-act="gzoom" data-d="0.8" aria-label="Zoom out">−</button><button class="btn sm" data-act="gzoom" data-d="0" aria-label="Reset view">Reset</button></div>
  <svg id="gsvg" viewBox="0 0 ${GW} ${GH}" role="img" aria-label="Evidence graph of entities and relationships. A keyboard accessible list follows."><g id="gview"></g></svg></div><div id="ginsp" class="panel"></div></div>`;
};

function inspector() {
  const e0 = I(), G = S.g, sel = G.sel; let h = '';
  const list = layoutFor(e0).nodes.filter(n => !G.hide[n.type]);
  if (sel && sel.k === 'n' && e0.E[sel.id]) {
    const e = e0.E[sel.id];
    h = `<h3><i class="dot t-${e.type}"></i> ${esc(e.name)}</h3><p class="sm mut">${esc(e.type)} · ${e.mentions} mentions · ${e.docIds.length} documents · ${e.confScore}% confidence</p>
    <h4 class="sm" style="margin:12px 0 6px">Relationships</h4><div class="list">${rels().filter(r => r.s === e.id || r.t === e.id).map(r => { const o = e0.E[r.s === e.id ? r.t : r.s]; return `<button class="btn sm" style="text-align:left" data-act="gsel" data-k="e" data-id="${esc(r.id)}">${r.s === e.id ? '→' : '←'} ${esc(o.name)} · ${esc(r.type)}</button>`; }).join('')}</div>
    <button class="btn sm pri" style="margin-top:10px" data-act="go" data-r="entities" data-id="${esc(e.id)}">Open entity profile</button>`;
  } else if (sel && sel.k === 'e' && rels().find(r => r.id === sel.id)) {
    const r = rels().find(x => x.id === sel.id), a = e0.E[r.s], b = e0.E[r.t], x0 = e0.EV[r.ev[0]];
    h = `<h3>Relationship</h3><p><b>${esc(a.name)}</b> → <b>${esc(b.name)}</b></p><p class="sm mut">Type: ${esc(r.type)}</p>
    <h4 class="sm" style="margin:12px 0 6px">Evidence</h4>${r.ev.length ? `<div>${cites(r.ev)}</div>` : '<p class="sm mut">Added manually. No extracted evidence.</p>'}
    <h4 class="sm" style="margin:12px 0 6px">Confidence</h4>${r.ev.length ? confBlock(r.conf, r.ev) : '<p class="sm">Manual link, not scored.</p>'}
    ${x0 ? `<h4 class="sm" style="margin:12px 0 6px">Chain of evidence</h4>${chainHtml([['Finding', esc(r.type)], ['Claim', esc(a.name) + ' → ' + esc(b.name)], ['Evidence', esc(r.ev.join(', '))], ['Source', esc([...new Set(r.ev.map(id => e0.D[e0.EV[id].doc].name))].join(', '))], ['Location', esc(r.ev.map(id => locOf(e0.EV[id])).join(', '))]])}` : ''}`;
  } else h = `<h3>Inspector</h3><p class="sm mut">Select a node or line. Drag nodes to rearrange, scroll to zoom, drag the background to pan.</p><div class="row" style="margin-top:10px">${Object.keys(TCOL).filter(t => list.some(n => n.type === t)).map(t => `<span class="chip"><i class="dot t-${t}"></i>${t}</span>`).join('')}</div>`;
  h += `<details style="margin-top:14px"><summary class="sm mut" style="cursor:pointer">Keyboard list of nodes</summary><div class="row" style="margin-top:8px">${list.map(n => `<button class="chip" data-act="gsel" data-k="n" data-id="${esc(n.id)}">${esc(n.name)}</button>`).join('')}</div></details>`;
  return h;
}
function drawGraph() { const g = $('#gview'); if (!g) return; g.innerHTML = graphSVGInner(false); g.setAttribute('transform', `translate(${S.g.v.x} ${S.g.v.y}) scale(${S.g.v.k})`); const i = $('#ginsp'); if (i) i.innerHTML = inspector(); }

function findPath(a, b) {
  const e0 = I(), L = layoutFor(e0), vis = new Set(L.nodes.filter(n => !S.g.hide[n.type]).map(n => n.id)), es = rels().filter(r => vis.has(r.s) && vis.has(r.t));
  const prev = { [a]: null }, q = [a];
  while (q.length) { const c = q.shift(); if (c === b) break; es.forEach(r => { const o = r.s === c ? r.t : r.t === c ? r.s : null; if (o && !(o in prev)) { prev[o] = { n: c, e: r.id }; q.push(o); } }); }
  if (!(b in prev)) return null; const nodes = new Set([b]), edges = new Set(); let c = b; while (prev[c]) { edges.add(prev[c].e); nodes.add(prev[c].n); c = prev[c].n; } return { nodes, edges };
}
function initGraph() {
  const svg = $('#gsvg'); if (!svg) return; drawGraph();
  let st = null;
  const scale = () => svg.getBoundingClientRect().width / GW;
  svg.addEventListener('pointerdown', ev => { st = { x: ev.clientX, y: ev.clientY, moved: 0, node: ev.target.closest('.gnode'), edge: ev.target.closest('[data-eid]'), v0: { ...S.g.v } }; if (st.node) { const id = st.node.dataset.nid; st.id = id; st.p0 = { ...nodePos(layoutFor(I()), id) }; } svg.setPointerCapture(ev.pointerId); svg.classList.add('drag'); });
  svg.addEventListener('pointermove', ev => {
    if (!st) return; const dx = ev.clientX - st.x, dy = ev.clientY - st.y; st.moved = Math.max(st.moved, Math.abs(dx) + Math.abs(dy)); if (st.moved < 4) return;
    if (st.node) { S.g.pos[st.id] = { x: st.p0.x + dx / scale() / S.g.v.k, y: st.p0.y + dy / scale() / S.g.v.k }; } else { S.g.v.x = st.v0.x + dx / scale(); S.g.v.y = st.v0.y + dy / scale(); }
    drawGraph();
  });
  const end = () => {
    if (!st) return; const s = st; st = null; svg.classList.remove('drag');
    if (s.moved < 4) { S.g.sel = s.node ? { k: 'n', id: s.node.dataset.nid } : s.edge ? { k: 'e', id: s.edge.dataset.eid } : null; S.g.path = null; drawGraph(); }
  };
  svg.addEventListener('pointerup', end); svg.addEventListener('pointercancel', end);
  svg.addEventListener('wheel', ev => { ev.preventDefault(); zoomAt(ev.deltaY < 0 ? 1.12 : 0.89, ev.clientX, ev.clientY); }, { passive: false });
}
function zoomAt(f, cx, cy) {
  const svg = $('#gsvg'), r = svg.getBoundingClientRect(), s = r.width / GW, v = S.g.v, k = Math.min(3, Math.max(.4, v.k * f)), ratio = k / v.k;
  const px = cx == null ? GW / 2 : (cx - r.left) / s, py = cy == null ? GH / 2 : (cy - r.top) / s;
  v.x = px - (px - v.x) * ratio; v.y = py - (py - v.y) * ratio; v.k = k; drawGraph();
}
