/* ===== core: state, helpers, routing, drawer ===== */
const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
derive(DEMO);
const EMPTY = derive({ key: 'mine', label: 'My investigation', synthetic: false, docs: [], entities: [], evidence: [], relationships: [], events: [], contradictions: [], anomalies: [], gaps: [] });
let MINE = null;
const FILES = [];
const S = { inv: 'demo', route: 'landing', arg: '', drawer: null, pres: null, side: false,
  f: { evType: 'All', evFlag: 'all', evQ: '', entType: 'All', entQ: '', tl: 'All', docQ: '', docPage: 1, linkTo: '' },
  chat: { demo: [], mine: [] }, report: null, genBusy: false, busy: false, g: { sel: null, hide: {}, q: '', path: null, from: '', to: '', pos: {}, v: { x: 0, y: 0, k: 1 } } };
S.g.hide.Date = true;
const I = () => S.inv === 'demo' ? DEMO : (MINE || EMPTY);

let H = { demo: { ev: {}, con: {}, links: [] }, mine: { ev: {}, con: {}, links: [] } };
try { const t = localStorage.getItem('tracelens_review_v1'); if (t) H = Object.assign(H, JSON.parse(t)); } catch (e) { /* storage unavailable */ }
const saveH = () => { try { localStorage.setItem('tracelens_review_v1', JSON.stringify(H)); } catch (e) { /* ignore */ } };
const hv = () => H[S.inv];
const evH = id => hv().ev[id] || { status: '', note: '', tags: [] };
const rels = () => I().relationships.concat(hv().links.map((l, i) => ({ id: 'M-' + (i + 1), s: l.a, t: l.b, type: 'Manual link: ' + l.note, ev: [], conf: 100, manual: true })));

function toast(msg) {
  let t = $('#toast'); if (!t) { t = document.createElement('div'); t.id = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
  t.textContent = msg; t.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(() => { t.hidden = true; }, 2600);
}
const locOf = x => (I().D[x.doc].unit === 'Message' ? 'Message ' : 'Page ') + x.page;
const shortLoc = x => (I().D[x.doc].unit === 'Message' ? 'Msg ' : 'p.') + x.page;
const cite = id => { const x = I().EV[id]; return x ? `<button class="cite" data-act="ev" data-id="${esc(id)}" title="Open source evidence">${esc(id)} · ${esc(I().D[x.doc].name)} · ${shortLoc(x)}</button>` : ''; };
const cites = ids => ids.map(cite).join(' ');
const entChip = id => { const e = I().E[id]; return e ? `<button class="chip" data-act="ent" data-id="${esc(id)}"><i class="dot t-${e.type}"></i>${esc(e.name)}</button>` : ''; };

function hl(x, q) {
  const e0 = I(); const rs = [];
  x.entities.forEach(id => { const e = e0.E[id]; if (!e || !e.re) return; e.re.lastIndex = 0; let m; while ((m = e.re.exec(x.text))) { rs.push({ i: m.index, l: m[0].length, t: e.type, id }); if (!m[0].length) e.re.lastIndex++; } });
  rs.sort((a, b) => a.i - b.i || b.l - a.l);
  const qre = q && q.length > 1 ? new RegExp(reEsc(esc(q)), 'gi') : null;
  const plain = s => qre ? esc(s).replace(qre, m => `<mark class="q">${m}</mark>`) : esc(s);
  let out = '', last = 0;
  for (const r of rs) { if (r.i < last) continue; out += plain(x.text.slice(last, r.i)) + `<mark class="ent t-${r.t}" tabindex="0" role="button" data-act="ent" data-id="${esc(r.id)}" title="${esc(r.t)}: click for details">${esc(x.text.slice(r.i, r.i + r.l))}</mark>`; last = r.i + r.l; }
  return out + plain(x.text.slice(last));
}

function evCard(x, q) {
  const h = evH(x.id), d = I().D[x.doc];
  return `<div class="ev ${x.type === 'Statement' ? 'statement' : ''} ${h.status === 'dismissed' ? 'dismissed' : ''}">
    <div class="src"><b style="color:var(--tx)">#${esc(x.id)}</b><span>${esc(d.name)} · ${locOf(x)} · ${esc(x.section)}</span><span class="chip">${esc(x.type)}</span>
    ${x.flags.map(f => `<span class="chip sev-Medium">${esc(f)}</span>`).join('')}${h.status ? `<span class="chip on">${esc(h.status)}</span>` : ''}</div>
    <div class="txt">${hl(x, q)}</div>
    <div class="row sm mut" style="margin-top:8px"><span>${x.conf}% confidence · ${esc(x.importance)} importance</span><span class="grow"></span><button class="btn sm ghost" data-act="ev" data-id="${esc(x.id)}">Inspect</button></div></div>`;
}

function chainHtml(items) {
  return `<div class="chain" role="list" aria-label="Chain of evidence">${items.map(([k, v]) => `<div class="st" role="listitem"><span class="pt"></span><span class="k">${esc(k)}</span><span class="v">${v}</span></div>`).join('')}</div>`;
}
const confBlock = (score, ids) => { const c = confInfo(I(), score, ids); return `<p class="sm"><b>${score}%</b> · ${esc(c.text)}</p><p class="xs mut">${esc(c.note)}</p>`; };

/* ---------- routing ---------- */
const ROUTES = ['login', 'landing', 'overview', 'documents', 'evidence', 'entities', 'graph', 'timeline', 'contradictions', 'anomalies', 'gaps', 'chat', 'reports', 'settings', 'search'];
function nav(route, arg) { location.hash = '#/' + route + (arg ? '/' + encodeURIComponent(arg) : ''); }
function parseHash() {
  const m = location.hash.replace(/^#\/?/, '').split('/'); const r = m[0] || 'landing';
  S.route = ROUTES.includes(r) ? r : 'landing'; S.arg = m[1] ? decodeURIComponent(m[1]) : ''; S.side = false;
  if (!AUTH.user) S.route = 'login'; else if (S.route === 'login') S.route = 'landing';
}
window.addEventListener('hashchange', () => { parseHash(); S.drawer = null; render(true); });

/* ---------- drawer ---------- */
function openDrawer(kind, id) { S.drawer = { kind, id }; drawDrawer(); }
function closeDrawer() { S.drawer = null; drawDrawer(); }
function drawDrawer() {
  const d = $('#drawer'), sc = $('#scrim'); if (!d) return;
  if (!S.drawer) { d.classList.remove('on'); sc.classList.remove('on'); d.setAttribute('aria-hidden', 'true'); return; }
  d.innerHTML = D[S.drawer.kind](S.drawer.id); d.classList.add('on'); sc.classList.add('on'); d.setAttribute('aria-hidden', 'false');
  const c = $('#dclose'); if (c) c.focus();
}
const dhead = (t, sub) => `<div class="row" style="margin-bottom:14px"><div class="grow"><h3 style="font-size:18px">${t}</h3>${sub ? `<p class="sm mut">${sub}</p>` : ''}</div><button class="btn sm" id="dclose" data-act="close" aria-label="Close panel">Close</button></div>`;
const D = {
  ev(id) {
    const x = I().EV[id]; if (!x) return dhead('Evidence not found', 'This item is no longer in the investigation.');
    const e0 = I(), d = e0.D[x.doc], h = evH(id);
    const cons = e0.contradictions.filter(c => c.a.includes(id) || c.b.includes(id)), evs = e0.events.filter(v => v.ev.includes(id));
    const rl = rels().filter(r => r.ev.includes(id)), an = e0.anomalies.filter(a => a.ev.includes(id)), gp = e0.gaps.filter(g => g.ev.includes(id));
    return dhead(`Evidence #${esc(id)}`, `Source: ${esc(d.name)} · ${locOf(x)} · Section: ${esc(x.section)}`) +
      `<div class="ev ${x.type === 'Statement' ? 'statement' : ''}"><div class="txt">${hl(x)}</div></div>
      <div class="row" style="margin:12px 0"><span class="chip">${esc(x.type)}</span><span class="chip">${esc(x.importance)} importance</span>${x.tags.map(t => `<span class="chip">#${esc(t)}</span>`).join('')}</div>
      <h4 class="sm" style="margin:14px 0 6px">Chain of evidence</h4>
      ${chainHtml([['Finding', x.flags.length ? 'Linked to: ' + esc(x.flags.join(', ')) : 'Supports entity and event extraction'], ['Claim', esc(x.type) + ' recorded in ' + esc(x.section)], ['Evidence', '#' + esc(id)], ['Source', esc(d.name)], ['Location', locOf(x)], ['Related entity', x.entities.slice(0, 4).map(entChip).join(' ')], ['Related event', evs.length ? evs.map(v => `<button class="chip" data-act="event" data-id="${esc(v.id)}">${esc(v.id)} · ${fmtDate(v.date)}</button>`).join(' ') : '<span class="mut">None extracted</span>']])}
      <h4 class="sm" style="margin:14px 0 6px">Why this confidence</h4>${confBlock(x.conf, [id])}
      ${cons.length ? `<h4 class="sm" style="margin:14px 0 6px">Contradictions involving this item</h4>${cons.map(c => `<button class="chip sev-${c.severity}" data-act="go" data-r="contradictions" data-id="${esc(c.id)}">${esc(c.id)} · ${esc(c.title)}</button>`).join(' ')}` : ''}
      ${an.length ? `<p class="sm" style="margin-top:8px">Anomalies: ${an.map(a => `<button class="chip" data-act="go" data-r="anomalies">${esc(a.id)}</button>`).join(' ')}</p>` : ''}
      ${gp.length ? `<p class="sm" style="margin-top:8px">Evidence gaps: ${gp.map(g => `<button class="chip" data-act="go" data-r="gaps">${esc(g.id)}</button>`).join(' ')}</p>` : ''}
      ${rl.length ? `<p class="sm" style="margin-top:8px">Relationships: ${rl.map(r => `<button class="chip" data-act="go" data-r="graph" data-id="e:${esc(r.id)}">${esc(e0.E[r.s].name)} → ${esc(e0.E[r.t].name)}</button>`).join(' ')}</p>` : ''}
      <h4 class="sm" style="margin:18px 0 6px">Human review</h4>
      <div class="row">${[['verified', 'Verify'], ['relevant', 'Mark relevant'], ['dismissed', 'Dismiss as false positive'], ['flagged', 'Flag for review']].map(([s, l]) => `<button class="btn sm ${h.status === s ? 'pri' : ''}" data-act="evstatus" data-id="${esc(id)}" data-s="${s}" aria-pressed="${h.status === s}">${l}</button>`).join('')}${h.status ? `<button class="btn sm ghost" data-act="evstatus" data-id="${esc(id)}" data-s="">Clear</button>` : ''}</div>
      <label class="sm mut" for="evnote" style="display:block;margin-top:10px">Note</label><textarea id="evnote">${esc(h.note)}</textarea>
      <label class="sm mut" for="evtags" style="display:block;margin-top:8px">Tags (comma separated)</label><input type="text" id="evtags" value="${esc(h.tags.join(', '))}">
      <button class="btn sm" style="margin-top:8px" data-act="evnote" data-id="${esc(id)}">Save note and tags</button>`;
  },
  event(id) {
    const v = I().events.find(x => x.id === id); if (!v) return dhead('Event not found');
    return dhead(`Event #${esc(v.id)}`, `Date: ${fmtDate(v.date)}`) + `<p class="serif" style="font-size:16px">${esc(v.desc)}</p>
      <h4 class="sm" style="margin:16px 0 6px">Sources</h4><div class="list">${v.ev.map(id => evCard(I().EV[id])).join('')}</div>
      <h4 class="sm" style="margin:16px 0 6px">Entities</h4><div class="row">${v.entities.map(entChip).join('')}</div>
      ${v.kind === 'claim' ? '<p class="xs mut" style="margin-top:12px">This event is a statement or reported figure, not a recorded transaction.</p>' : ''}`;
  },
  ent(id) {
    const e = I().E[id]; if (!e) return dhead('Entity not found');
    const first = I().EV[e.evIds[0]];
    return dhead(esc(e.name), `${esc(e.type)} · ${e.mentions} mentions · ${e.docIds.length} documents`) +
      `<h4 class="sm" style="margin:6px 0">Why this was detected</h4>
      <p class="sm">${S.inv === 'demo' ? 'Matched by the demo extraction pass on the exact strings below.' : 'Matched by a local pattern rule (' + esc(e.type) + ' pattern).'}</p>
      <p class="sm mut" style="margin-top:6px">Matched text: ${e.aliases.map(a => `<span class="chip">${esc(a)}</span>`).join(' ')}</p>
      <p class="sm">Extraction confidence: <b>${e.confScore}%</b></p>${first ? `<h4 class="sm" style="margin:14px 0 6px">First source passage</h4>${evCard(first)}` : ''}
      <button class="btn pri" style="margin-top:14px" data-act="go" data-r="entities" data-id="${esc(id)}">Open entity profile</button>`;
  }
};
