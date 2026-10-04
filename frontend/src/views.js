/* ===== page views ===== */
const ph = (t, d, extra) => `<div class="ph row"><div class="grow"><h2>${t}</h2>${d ? `<p>${d}</p>` : ''}</div>${extra || ''}</div>`;
const empty = (t, m, a) => `<div class="panel" style="text-align:center;padding:40px 20px"><h3>${t}</h3><p class="mut" style="margin:6px auto 14px;max-width:46ch">${m}</p>${a || ''}</div>`;
const needDocs = () => I().docs.length ? '' : empty('No documents yet', 'Add text, CSV, or markdown files to build an evidence universe for this investigation.', '<button class="btn pri" data-act="go" data-r="documents">Add documents</button>');
const typeChips = (key, types, cur) => `<div class="row" role="group" aria-label="Filter">${['All', ...types].map(t => `<button class="chip ${cur === t ? 'on' : ''}" data-act="filt" data-k="${key}" data-v="${esc(t)}" aria-pressed="${cur === t}">${esc(t)}</button>`).join('')}</div>`;
const rangeVal = v => (v >= 1e5 ? inr(v) : inr(v));

const V = {};
V.overview = () => {
  const e0 = I(); if (!e0.docs.length) return ph('Overview', 'Investigation summary') + needDocs();
  const avg = Math.round(e0.evidence.reduce((n, x) => n + x.conf, 0) / (e0.evidence.length || 1));
  const rev = e0.evidence.filter(x => evH(x.id).status).length;
  const M = [['documents', e0.docs.length, 'Documents analyzed'], ['evidence', e0.evidence.length, 'Evidence items'], ['entities', e0.entities.length, 'Entities discovered'], ['graph', e0.relationships.length, 'Relationships found'], ['timeline', e0.events.length, 'Events extracted'], ['contradictions', e0.contradictions.length, 'Potential contradictions', 1], ['anomalies', e0.anomalies.length, 'Possible anomalies', 1], ['gaps', e0.gaps.length, 'Evidence gaps', 1]];
  const types = {}; e0.evidence.forEach(x => types[x.type] = (types[x.type] || 0) + 1);
  const max = Math.max(...Object.values(types));
  const C = 2 * Math.PI * 44, off = C * (1 - avg / 100);
  const openC = e0.contradictions.filter(c => !(hv().con[c.id] || {}).resolved).length;
  const dates = e0.events.map(v => v.date).sort(), t0 = Date.parse(dates[0]), t1 = Date.parse(dates[dates.length - 1]) || t0 + 1;
  return `${ph('Investigation overview', `${esc(e0.label)} · every number below opens the evidence behind it.`)}
  <div class="grid g4" style="margin-bottom:14px">${M.map(([r, n, l, w]) => `<button class="metric ${w && n ? 'warn' : ''}" data-act="go" data-r="${r}"><b>${n}</b><span>${l}</span></button>`).join('')}</div>
  <div class="grid g3" style="margin-bottom:14px">
    <div class="panel"><h3>Investigation health</h3><div class="row" style="gap:18px">
      <svg width="104" height="104" viewBox="0 0 104 104" role="img" aria-label="Mean extraction confidence ${avg} percent"><circle cx="52" cy="52" r="44" fill="none" stroke="var(--line)" stroke-width="8"/><circle cx="52" cy="52" r="44" fill="none" stroke="url(#hg)" stroke-width="8" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${off}" transform="rotate(-90 52 52)"/><defs><linearGradient id="hg"><stop stop-color="#2fb7cc"/><stop offset="1" stop-color="#6f62e8"/></linearGradient></defs><text x="52" y="58" text-anchor="middle" style="fill:var(--tx)" font-size="22" font-weight="600">${avg}%</text></svg>
      <div class="sm"><p>Mean extraction confidence</p><p class="mut">${rev} of ${e0.evidence.length} evidence items reviewed by a human</p><p class="mut">${openC} contradictions open · ${e0.gaps.length} evidence gaps</p></div></div>
      <p class="xs mut" style="margin-top:10px">Confidence is an estimate from source count, agreement and extraction quality, not a statistical certainty.</p></div>
    <div class="panel"><h3>Evidence distribution</h3>${Object.entries(types).map(([t, n]) => `<div style="margin-bottom:9px"><div class="row sm"><span class="grow">${esc(t)}</span><span class="mut">${n}</span></div><div class="bar"><i style="width:${Math.round(n / max * 100)}%"></i></div></div>`).join('')}</div>
    <div class="panel"><h3>Contradiction alerts</h3>${e0.contradictions.length ? `<div class="list">${e0.contradictions.map(c => `<button class="ev" style="border-left-color:var(--am)" data-act="go" data-r="contradictions" data-id="${esc(c.id)}"><div class="src"><b style="color:var(--tx)">${esc(c.id)}</b><span class="chip sev-${c.severity}">${c.severity}</span><span>${c.conf}%</span></div><div class="sm">${esc(c.title)}</div></button>`).join('')}</div>` : '<p class="sm mut">None detected so far. Absence of a flag is not proof of consistency.</p>'}</div></div>
  <div class="grid g21" style="margin-bottom:14px">
    <div class="panel"><div class="row"><h3 class="grow">Entity network</h3><button class="btn sm" data-act="go" data-r="graph">Open graph</button></div>${miniGraph()}</div>
    <div class="panel"><h3>Investigation questions</h3><div class="list">${suggestions().map(q => `<button class="btn sm" style="text-align:left" data-act="ask" data-q="${esc(q)}">${esc(q)}</button>`).join('')}</div></div></div>
  <div class="grid g2"><div class="panel"><div class="row"><h3 class="grow">Timeline preview</h3><button class="btn sm" data-act="go" data-r="timeline">Open timeline</button></div>
    <div style="position:relative;height:64px;margin:10px 6px 4px"><div style="position:absolute;left:0;right:0;top:30px;height:1px;background:var(--line2)"></div>${e0.events.map(v => { const p = ((Date.parse(v.date) - t0) / (t1 - t0 || 1)) * 100; const fl = e0.evidence.find(x => x.id === v.ev[0]).flags.length; return `<button data-act="event" data-id="${esc(v.id)}" title="${fmtDate(v.date)}: ${esc(v.desc)}" aria-label="${fmtDate(v.date)}: ${esc(v.desc)}" style="position:absolute;left:calc(${p}% - 6px);top:${fl ? 22 : 24}px;width:13px;height:13px;border-radius:50%;border:2px solid ${fl ? 'var(--am)' : 'var(--cy)'};background:${fl ? 'rgba(245,185,75,.4)' : 'var(--ink)'};padding:0"></button>`; }).join('')}</div>
    <div class="row sm mut"><span class="grow">${fmtDate(dates[0])}</span><span>${fmtDate(dates[dates.length - 1])}</span></div></div>
    <div class="panel"><h3>Recent evidence</h3><div class="list">${e0.evidence.filter(x => x.importance === 'High').slice(0, 3).map(x => evCard(x)).join('')}</div></div></div>`;
};
const suggestions = () => S.inv === 'demo'
  ? ['What evidence connects Rajiv Mehta to Orion Systems?', 'Find all payments above ₹5 lakh', 'Which documents contradict the statement about the March payment?', 'What is missing from the document set?']
  : ['Show every passage mentioning an organization', 'Find all payments above ₹1 lakh', 'Which statements conflict with other passages?', 'What is missing from the document set?'];

V.documents = () => {
  const e0 = I();
  const up = `<div class="panel" id="drop" style="border-style:dashed;text-align:center;padding:26px"><h3>Add documents</h3>
    <p class="sm mut" style="margin:6px 0 12px">Drag files here or choose files. Text, CSV, markdown, JSON, PDF, DOCX and images (OCR) are analyzed in your browser.</p>
    <label class="btn pri" style="display:inline-block">Choose files<input id="file" type="file" multiple accept=".txt,.csv,.md,.json,.log,.pdf,.docx,.png,.jpg,.jpeg,.tif" style="position:absolute;opacity:0;width:1px;height:1px"></label>
    <p class="xs mut" style="margin-top:10px">Limit 15 MB per file. Files are read in your browser; they are only sent to a server if you configure a backend.</p></div>`;
  const st = FILES.map(f => `<div class="panel" style="padding:12px 14px"><div class="row"><b class="grow" style="overflow-wrap:anywhere">${esc(f.name)}</b><span class="chip">${esc(f.ext.toUpperCase())}</span><span class="xs mut">${esc(f.size)}</span></div>
    <div class="sm" style="margin-top:6px;display:grid;gap:2px">${['Uploaded', 'Text extracted', 'Entities detected', 'Evidence indexed', 'Investigation ready'].map((s, i) => `<span style="color:${f.steps[i] ? 'var(--gr)' : f.error ? 'var(--mut)' : 'var(--am)'}">${f.steps[i] ? '✓' : f.error ? '–' : '…'} ${s}</span>`).join('')}</div>
    ${f.error ? `<p class="sm" style="color:var(--ro);margin-top:6px">${esc(f.error)}</p>` : ''}</div>`).join('');
  if (S.arg && e0.D[S.arg]) return viewer(S.arg);
  const rows = e0.docs.map(d => { const n = e0.evidence.filter(x => x.doc === d.id).length; return `<tr data-act="doc" data-id="${esc(d.id)}" tabindex="0"><td><b>${esc(d.name)}</b><div class="xs mut">${esc(d.meta)}</div></td><td>${esc(d.type)}</td><td>${d.pages} ${d.unit.toLowerCase()}s</td><td>${esc(d.size)}</td><td>${n} evidence</td><td><span style="color:var(--gr)">✓ ${S.inv === 'demo' ? 'Demo analysis' : 'Ready'}</span></td></tr>`; }).join('');
  return ph('Documents', e0.synthetic ? 'Synthetic demo documents. Open one to inspect highlighted evidence page by page.' : 'Documents in this investigation.') + (e0.synthetic ? '' : up + `<div class="list" style="margin:14px 0">${st}</div>`) +
    (e0.docs.length ? `<div class="panel tblwrap"><table class="tbl"><thead><tr><th>Document</th><th>Type</th><th>Length</th><th>Size</th><th>Evidence</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table></div>` : (FILES.length ? '' : empty('No documents yet', 'Add a file above to start. Nothing is uploaded off this device in this build.'))) +
    (e0.synthetic ? `<div class="panel" style="margin-top:14px"><h3>Processing pipeline</h3><p class="sm mut">Demo documents are precomputed through the same stages a real upload would take: extraction, chunking, entities, events, claims, relationships, contradiction and anomaly checks. Add your own files from “My investigation” to run the local analyzer.</p></div>` : '');
};
function viewer(id) {
  const e0 = I(), d = e0.D[id], p = Math.min(Math.max(+S.f.docPage || 1, 1), d.pages), q = S.f.docQ;
  const onPage = e0.evidence.filter(x => x.doc === id && x.page === p);
  const hits = q ? e0.evidence.filter(x => x.doc === id && x.text.toLowerCase().includes(q.toLowerCase())) : [];
  let body;
  if (d.pagesText) { const t = d.pagesText[p - 1] || ''; body = `<div class="serif" style="white-space:pre-wrap;font-size:15px;overflow-wrap:anywhere">${esc(t)}</div>${onPage.length ? '<h4 class="sm" style="margin:16px 0 6px">Extracted evidence on this page</h4><div class="list">' + onPage.map(x => evCard(x, q)).join('') + '</div>' : ''}`; }
  else body = onPage.length ? `<div class="list">${onPage.map(x => `<div><div class="skel" style="animation:none;opacity:.5;width:70%"></div>${evCard(x, q)}<div class="skel" style="animation:none;opacity:.5;width:55%"></div></div>`).join('')}</div><p class="xs mut" style="margin-top:12px">Synthetic document: only the passages relevant to the investigation are reproduced.</p>` : `<p class="mut sm">No evidence was extracted from this ${d.unit.toLowerCase()}.</p>`;
  return `${ph(esc(d.name), esc(d.meta), '<button class="btn sm" data-act="go" data-r="documents">All documents</button>')}
  <div class="row" style="margin-bottom:12px"><button class="btn sm" data-act="pg" data-d="-1" ${p <= 1 ? 'disabled' : ''}>Previous</button><span class="sm">${d.unit} ${p} of ${d.pages}</span><button class="btn sm" data-act="pg" data-d="1" ${p >= d.pages ? 'disabled' : ''}>Next</button>
    <input type="search" data-in="docQ" value="${esc(q)}" placeholder="Search in this document" aria-label="Search in this document" style="max-width:280px"></div>
  ${q ? `<p class="sm mut" style="margin-bottom:8px">${hits.length} matching evidence passage${hits.length === 1 ? '' : 's'}: ${hits.map(h => `<button class="chip" data-act="pgto" data-p="${h.page}">${shortLoc(h)}</button>`).join(' ')}</p>` : ''}
  <div class="grid g21"><div class="panel">${body}</div><div class="panel"><h3>Entities in this document</h3><div class="row">${e0.entities.filter(e => e.docIds.includes(id)).map(e => entChip(e.id)).join('')}</div></div></div>`;
}

V.evidence = () => {
  const e0 = I(); if (!e0.docs.length) return ph('Evidence', 'Every extracted passage with its source.') + needDocs();
  const f = S.f, q = f.evQ.toLowerCase();
  const types = [...new Set(e0.evidence.map(x => x.type))];
  const flt = { all: () => true, high: x => x.conf >= 90, imp: x => x.importance === 'High', contradiction: x => x.flags.includes('contradiction'), anomaly: x => x.flags.includes('anomaly'), reviewed: x => !!evH(x.id).status };
  const list = e0.evidence.filter(x => (f.evType === 'All' || x.type === f.evType) && flt[f.evFlag](x) && (!q || (x.text + ' ' + x.id + ' ' + x.tags.join(' ') + ' ' + x.entities.map(i => e0.E[i].name).join(' ')).toLowerCase().includes(q)));
  const more = f.evMore || 12;
  return `${ph('Evidence explorer', 'Every item keeps its document, page and exact text.')}
  <div class="row" style="margin-bottom:10px"><input type="search" data-in="evQ" value="${esc(f.evQ)}" placeholder="Filter evidence by text, entity, tag or ID" aria-label="Filter evidence" style="max-width:420px"></div>
  <div style="display:grid;gap:8px;margin-bottom:14px">${typeChips('evType', types, f.evType)}
  <div class="row">${[['all', 'Any'], ['high', 'High confidence'], ['imp', 'High importance'], ['contradiction', 'In a contradiction'], ['anomaly', 'In an anomaly'], ['reviewed', 'Human-reviewed']].map(([k, l]) => `<button class="chip ${f.evFlag === k ? 'on' : ''}" data-act="filt" data-k="evFlag" data-v="${k}" aria-pressed="${f.evFlag === k}">${l}</button>`).join('')}</div></div>
  <p class="sm mut" style="margin-bottom:10px">${list.length} of ${e0.evidence.length} items</p>
  <div class="list">${list.slice(0, more).map(x => evCard(x, f.evQ)).join('') || empty('No matching evidence', 'Try removing a filter or searching for a different term.')}</div>
  ${list.length > more ? `<button class="btn" style="margin-top:12px" data-act="more">Show more</button>` : ''}`;
};

V.entities = () => {
  const e0 = I(); if (!e0.docs.length) return ph('Entities', 'People, organizations, amounts and more.') + needDocs();
  if (S.arg && e0.E[S.arg]) return entProfile(e0.E[S.arg]);
  const f = S.f, q = f.entQ.toLowerCase(), types = [...new Set(e0.entities.map(e => e.type))];
  const list = e0.entities.filter(e => (f.entType === 'All' || e.type === f.entType) && (!q || e.name.toLowerCase().includes(q))).sort((a, b) => b.mentions - a.mentions);
  return `${ph('Entities', `${e0.entities.length} entities extracted. Open one for its profile and relationships.`)}
  <div class="row" style="margin-bottom:10px"><input type="search" data-in="entQ" value="${esc(f.entQ)}" placeholder="Search entities" aria-label="Search entities" style="max-width:340px"></div><div style="margin-bottom:12px">${typeChips('entType', types, f.entType)}</div>
  <div class="panel tblwrap"><table class="tbl"><thead><tr><th>Name</th><th>Type</th><th>Mentions</th><th>Documents</th><th>Relationships</th><th>Confidence</th></tr></thead><tbody>${list.map(e => `<tr data-act="go" data-r="entities" data-id="${esc(e.id)}" tabindex="0"><td><i class="dot t-${e.type}"></i> <b>${esc(e.name)}</b></td><td>${esc(e.type)}</td><td>${e.mentions}</td><td>${e.docIds.length}</td><td>${e.rels.length}</td><td>${e.confScore}%</td></tr>`).join('') || '<tr><td colspan="6" class="mut">No matching entities.</td></tr>'}</tbody></table></div>`;
};
function entProfile(e) {
  const e0 = I(), links = hv().links.filter(l => l.a === e.id || l.b === e.id);
  return `${ph(esc(e.name), `${esc(e.type)} · ${e.mentions} mentions · ${e.docIds.length} documents · ${e.rels.length} relationships · confidence ${e.confScore}%`, '<button class="btn sm" data-act="go" data-r="entities">All entities</button>')}
  <div class="grid g21"><div><h3 style="margin-bottom:8px">Evidence</h3><div class="list">${e.evIds.map(id => evCard(e0.EV[id])).join('')}</div></div>
  <div style="display:grid;gap:14px;align-content:start"><div class="panel"><h3>Relationships</h3><div class="list">${e.rels.map(r => { const o = e0.E[r.s === e.id ? r.t : r.s]; return `<button class="btn sm" style="text-align:left" data-act="go" data-r="graph" data-id="e:${esc(r.id)}">${esc(r.type)}: ${esc(o.name)} · ${r.conf}%</button>`; }).join('') || '<p class="sm mut">No relationships extracted.</p>'}</div>
      <button class="btn sm pri" style="margin-top:10px" data-act="go" data-r="graph" data-id="n:${esc(e.id)}">Show in graph</button></div>
    <div class="panel"><h3>Manual link</h3><p class="xs mut" style="margin-bottom:8px">Add a relationship you know about. It is marked as manual and carries no extracted evidence.</p>
      <select id="linkto" aria-label="Link to entity">${e0.entities.filter(x => x.id !== e.id && ['Person', 'Organization', 'Location', 'ID', 'Product'].includes(x.type)).map(x => `<option value="${esc(x.id)}">${esc(x.name)}</option>`).join('')}</select>
      <input type="text" id="linknote" placeholder="Relationship (for example, former colleague)" style="margin-top:6px" aria-label="Relationship description">
      <button class="btn sm" style="margin-top:8px" data-act="link" data-id="${esc(e.id)}">Add link</button>
      ${links.map(l => `<p class="xs mut" style="margin-top:6px">Linked: ${esc(e0.E[l.a].name)} → ${esc(e0.E[l.b].name)} (${esc(l.note)})</p>`).join('')}</div></div></div>`;
}

V.timeline = () => {
  const e0 = I(); if (!e0.docs.length) return ph('Timeline', 'Reconstructed chronology.') + needDocs();
  const F = S.f.tl, fl = { All: () => true, Transactions: v => e0.EV[v.ev[0]].type === 'Transaction', Statements: v => v.kind === 'claim', Communications: v => e0.EV[v.ev[0]].type === 'Communication', Flagged: v => e0.EV[v.ev[0]].flags.length }[F];
  const list = [...e0.events].sort((a, b) => a.date.localeCompare(b.date)).filter(fl);
  let last = '';
  return `${ph('Timeline', 'Events extracted from dated passages. Dashed markers are statements or reported figures rather than recorded events.')}
  <div style="margin-bottom:14px">${typeChips('tl', ['Transactions', 'Statements', 'Communications', 'Flagged'], F)}</div>
  ${list.length ? `<div class="tl">${list.map(v => { const x = e0.EV[v.ev[0]], m = v.date.slice(0, 7), hd = m !== last ? `<div class="dt" style="margin-top:14px">${MON[+m.slice(5) - 1]} ${m.slice(0, 4)}</div>` : ''; last = m;
    return hd + `<div class="it ${v.kind === 'claim' ? 'claim' : ''} ${x.flags.length ? 'flag' : ''}"><button class="ev" data-act="event" data-id="${esc(v.id)}"><div class="src"><b style="color:var(--tx)">${fmtDate(v.date)}</b><span>#${esc(v.id)}</span>${x.flags.map(f => `<span class="chip sev-Medium">${f}</span>`).join('')}</div><div class="sm">${esc(v.desc)}</div><div style="margin-top:6px">${cites(v.ev)}</div></button></div>`; }).join('')}</div>` : empty('No events match', 'Pick another filter to see more of the chronology.')}`;
};

const conState = id => hv().con[id] || { resolved: false, flag: false, note: '' };
V.contradictions = () => {
  const e0 = I(); if (!e0.docs.length) return ph('Contradictions', 'Potential inconsistencies across documents.') + needDocs();
  if (S.arg) { const c = e0.contradictions.find(x => x.id === S.arg); if (c) return conDetail(c); }
  return `${ph('Potential contradictions', 'TraceLens compares statements across documents. Each item is a potential contradiction that requires human verification.')}
  ${e0.contradictions.length ? `<div class="list">${e0.contradictions.map(c => { const s = conState(c.id); return `<button class="ev" style="border-left-color:var(--am);${s.resolved ? 'opacity:.6' : ''}" data-act="go" data-r="contradictions" data-id="${esc(c.id)}"><div class="src"><b style="color:var(--tx)">#${esc(c.id)}</b><span class="chip sev-${c.severity}">${c.severity}</span><span class="chip">${esc(c.type)}</span><span>${c.conf}% confidence</span>${s.resolved ? '<span class="chip on">resolved</span>' : ''}${s.flag ? '<span class="chip on">flagged</span>' : ''}</div><div>${esc(c.title)}</div></button>`; }).join('')}</div>` : empty('No contradictions detected', 'Nothing in the uploaded set conflicts under the current rules. Absence of a flag is not proof of consistency.')}`;
};
function conDetail(c) {
  const e0 = I(), s = conState(c.id), allIds = [...c.a, ...c.b];
  return `${ph(`Contradiction #${esc(c.id)}`, esc(c.title), '<button class="btn sm" data-act="go" data-r="contradictions">All contradictions</button>')}
  <div class="row" style="margin-bottom:14px"><span class="chip sev-${c.severity}">Severity: ${c.severity}</span><span class="chip">${esc(c.type)}</span><span class="chip">Confidence ${c.conf}%</span>${s.resolved ? '<span class="chip on">Resolved</span>' : ''}</div>
  <div class="grid g2" style="margin-bottom:14px"><div><h3 style="margin-bottom:8px">Claim A</h3><div class="list">${c.a.map(id => evCard(e0.EV[id])).join('')}</div></div>
  <div><h3 style="margin-bottom:8px">Claim B${c.b.length > 1 ? ' (' + c.b.length + ' sources)' : ''}</h3><div class="list">${c.b.map(id => evCard(e0.EV[id])).join('')}</div></div></div>
  <div class="grid g2"><div class="panel"><h3>Why they conflict</h3><p>${esc(c.conflict)}</p><p class="sm" style="margin-top:10px;color:var(--am)">${esc(c.caution)}</p>
      <h4 class="sm" style="margin:14px 0 6px">Why this confidence</h4>${confBlock(c.conf, allIds)}
      <h4 class="sm" style="margin:14px 0 6px">Recommended next checks</h4><ul class="sm" style="margin:0;padding-left:18px">${c.next.map(n => `<li>${esc(n)}</li>`).join('')}</ul></div>
    <div class="panel"><h3>Chain of evidence</h3>${chainHtml(c.chain.map(([k, v]) => [k, esc(v)]))}
      <div style="margin-top:8px">${cites(allIds)}</div></div></div>
  <div class="panel" style="margin-top:14px"><h3>Human review</h3><div class="row"><button class="btn sm ${s.resolved ? 'pri' : ''}" data-act="conflag" data-id="${esc(c.id)}" data-k="resolved" aria-pressed="${s.resolved}">${s.resolved ? 'Resolved (undo)' : 'Mark as resolved'}</button><button class="btn sm ${s.flag ? 'pri' : ''}" data-act="conflag" data-id="${esc(c.id)}" data-k="flag" aria-pressed="${s.flag}">${s.flag ? 'Flagged for review (undo)' : 'Flag for review'}</button></div>
    <label class="sm mut" for="connote" style="display:block;margin-top:10px">Note</label><textarea id="connote">${esc(s.note)}</textarea><button class="btn sm" style="margin-top:8px" data-act="connote" data-id="${esc(c.id)}">Save note</button></div>`;
}

V.anomalies = () => {
  const e0 = I(); if (!e0.docs.length) return ph('Anomalies', 'Possible irregularities.') + needDocs();
  return `${ph('Possible anomalies', 'Statistical and structural irregularities in this document set. They are leads to check, not findings of wrongdoing.')}
  ${e0.anomalies.length ? `<div class="list">${e0.anomalies.map(a => { const hasR = a.observed && a.hi; const mx = hasR ? a.observed * 1.1 : 1;
    return `<div class="panel"><div class="row"><b>#${esc(a.id)}</b><span class="chip">${a.conf}% confidence</span></div><h3 style="margin:6px 0">${esc(a.title)}</h3><p>${esc(a.text)}</p>
    ${hasR ? `<div class="row sm" style="margin-top:10px"><span>Observed: <b>${inr(a.observed)}</b></span><span>Typical range: <b>${inr(a.lo)} – ${inr(a.hi)}</b></span><span>Deviation: <b>${(a.observed / a.hi).toFixed(1)}× typical maximum</b></span></div>
    <div style="position:relative;height:22px;margin-top:8px" role="img" aria-label="Observed value against typical range"><div style="position:absolute;top:8px;left:0;right:0;height:6px;background:var(--line);border-radius:4px"></div><div style="position:absolute;top:8px;height:6px;border-radius:4px;background:var(--gr);left:${a.lo / mx * 100}%;width:${(a.hi - a.lo) / mx * 100}%"></div><div style="position:absolute;top:2px;width:3px;height:18px;background:var(--ro);left:${a.observed / mx * 100}%"></div></div>` : ''}
    <p class="sm" style="margin-top:10px;color:var(--am)">${esc(a.caution)}</p><div style="margin-top:8px"><span class="xs mut">Evidence: </span>${cites(a.ev)}</div></div>`; }).join('')}</div>` : empty('No anomalies detected', 'Amount outliers and duplicate passages are checked. Nothing crossed the threshold.')}`;
};

V.gaps = () => {
  const e0 = I(); if (!e0.docs.length) return ph('Evidence gaps', 'Documents referenced but not provided.') + needDocs();
  return `${ph('Evidence gap analyzer', 'Documents and records the evidence refers to that are not in the uploaded set.')}
  ${e0.gaps.length ? `<div class="list">${e0.gaps.map(g => `<div class="panel" style="border-left:3px solid var(--am)"><div class="row"><b>#${esc(g.id)}</b><span class="chip sev-${g.severity}">${g.severity}</span></div><h3 style="margin:6px 0">${esc(g.title)}</h3><p>${esc(g.text)}</p>
    <p class="sm" style="margin-top:8px"><span class="mut">Expected record:</span> ${esc(g.expected)}</p><p class="sm"><span class="mut">Potential next check:</span> ${esc(g.next)}</p><div style="margin-top:8px"><span class="xs mut">Referenced in: </span>${cites(g.ev)}</div></div>`).join('')}</div>` : empty('No evidence gaps found', 'No references to missing documents were detected under the current rules.')}`;
};

V.search = () => {
  const q = S.arg, e0 = I(); if (!q) return ph('Search', 'Search all documents.') + '<p class="mut">Type a term in the search bar above.</p>';
  const r = retrieve(q, 20), ents = e0.entities.filter(e => e.name.toLowerCase().includes(q.toLowerCase()) || e.aliases.some(a => a.toLowerCase().includes(q.toLowerCase())));
  return `${ph(`Results for “${esc(q)}”`, 'Keyword, entity and synonym matching ranked by relevance and confidence. Embedding search needs the backend.')}
  ${ents.length ? `<h3 style="margin-bottom:8px">Entities</h3><div class="row" style="margin-bottom:16px">${ents.map(e => entChip(e.id)).join('')}</div>` : ''}
  <h3 style="margin-bottom:8px">Evidence</h3><div class="list">${r.hits.map(h => evCard(h.x, q)).join('') || empty('No matching results', 'Nothing in the uploaded documents matched. Try a different term or a person or organization name.')}</div>`;
};

V.settings = () => `${ph('Settings')}
  <div class="panel" style="margin-bottom:14px"><h3>Appearance</h3><div class="row"><span class="sm mut grow">Current theme: ${getTheme()}</span>${themeBtn()}</div></div>
  <div class="panel" style="margin-bottom:14px"><h3>Backend</h3><p class="sm" id="beStatus">${window.TRACELENS_API_URL ? 'Checking ' + esc(window.TRACELENS_API_URL) + '…' : 'No backend configured. Running fully in the browser. Set TRACELENS_API_URL in config.js to enable PDF, DOCX and OCR extraction.'}</p></div>
  <div class="grid g2"><div class="panel"><h3>Analysis mode</h3><p class="sm"><span class="chip sev-Medium">AI analysis unavailable</span></p><p class="sm" style="margin-top:8px">No backend or LLM key is connected to this build. The demo investigation uses precomputed analysis, and uploaded text files use a local rule-based analyzer. Both stay fully explorable.</p></div>
  <div class="panel"><h3>Privacy</h3><p class="sm">Files you add are read in this browser tab and are not sent anywhere in this build. Review notes are stored in this browser’s local storage. A deployed version should add authentication, per-investigation isolation, file validation on the server and encrypted storage; none of that is claimed here.</p></div>
  <div class="panel"><h3>Review data</h3><p class="sm mut" style="margin-bottom:10px">Clears notes, tags, statuses and manual links for the current investigation.</p><button class="btn" data-act="resetH">Clear review data</button></div>
  <div class="panel"><h3>Uploaded documents</h3><p class="sm mut" style="margin-bottom:10px">Removes files from “My investigation”.</p><button class="btn" data-act="clearFiles">Remove uploaded documents</button></div></div>`;
