/* ===== shell, landing, events, upload, presentation mode ===== */
const NAV = [['overview', 'Overview'], ['documents', 'Documents'], ['evidence', 'Evidence'], ['entities', 'Entities'], ['graph', 'Relationships'], ['timeline', 'Timeline'], ['contradictions', 'Contradictions'], ['anomalies', 'Anomalies'], ['gaps', 'Evidence gaps'], ['chat', 'Investigation Chat'], ['reports', 'Reports'], ['settings', 'Settings']];
const logo = `<img src="assets/logo-mark-96.png" width="30" height="30" alt="" decoding="async">`;
/* ---------- theme ---------- */
const getTheme = () => document.documentElement.getAttribute('data-theme') || 'dark';
function setTheme(t) { document.documentElement.setAttribute('data-theme', t); try { localStorage.setItem('tracelens_theme', t); } catch (e) { /* storage unavailable */ } const m = document.querySelector('meta[name=theme-color]'); if (m) m.content = t === 'light' ? '#f2f5fb' : '#060a12'; }
const themeBtn = () => { const l = getTheme() === 'light'; return `<button class="btn tbtn" data-act="theme" aria-label="Switch to ${l ? 'dark' : 'light'} theme" title="Switch to ${l ? 'dark' : 'light'} theme">${l ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z"/></svg>' : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>'}</button>`; };

function landing() {
  const hero = `<svg viewBox="0 0 480 360" style="width:100%;height:auto" role="img" aria-label="Animated evidence graph: Rajiv Mehta linked to Orion Systems by a transfer, with a contradicting interview statement"><defs><filter id="gl"><feGaussianBlur stdDeviation="3"/></filter></defs>
    <path class="e" d="M110 90 L260 70" style="stroke:var(--edge)" stroke-width="2" fill="none"/><path class="e" d="M110 90 L120 250" style="stroke:var(--edge)" stroke-width="2" fill="none"/>
    <path class="e" d="M260 70 L390 150" style="stroke:var(--edge)" stroke-width="2" fill="none"/><path class="e" d="M120 250 L300 280" style="stroke:var(--edge)" stroke-width="2" fill="none"/><path class="e" d="M300 280 L390 150" style="stroke:var(--edge)" stroke-width="2" fill="none"/>
    <path class="e cx" d="M110 90 L390 150" stroke-width="2.4" stroke-dasharray="6 5" fill="none" style="stroke:var(--am);animation-name:draw,pulse"/>
    <g><circle cx="110" cy="90" r="22" stroke-width="2.4" style="fill:var(--nodefill);stroke:var(--cy)"/><text x="110" y="60" style="fill:var(--tx)" font-size="12" text-anchor="middle">Rajiv Mehta</text></g>
    <g><rect x="368" y="130" width="44" height="40" rx="9" stroke-width="2.4" style="fill:var(--nodefill);stroke:var(--vi)"/><text x="390" y="190" style="fill:var(--tx)" font-size="12" text-anchor="middle">Orion Systems</text></g>
    <g><rect x="238" y="52" width="44" height="36" rx="9" stroke-width="2" style="fill:var(--nodefill);stroke:var(--vi)"/><text x="260" y="40" style="fill:var(--tx)" font-size="12" text-anchor="middle">Nova Infrastructure</text></g>
    <g><polygon points="300,258 322,280 300,302 278,280" stroke-width="2" style="fill:var(--nodefill);stroke:var(--am)"/><text x="300" y="325" style="fill:var(--tx)" font-size="12" text-anchor="middle">₹8,00,000</text></g>
    <g><circle cx="120" cy="250" r="14" stroke-width="2" style="fill:var(--nodefill);stroke:var(--cy)"/><text x="120" y="282" style="fill:var(--tx)" font-size="12" text-anchor="middle">Dev Kulkarni</text></g>
    <text x="236" y="106" style="fill:var(--am)" font-size="11" text-anchor="middle" transform="rotate(10 236 106)">potential contradiction</text></svg>`;
  const chain = chainHtml([['Finding', 'Potential financial relationship'], ['Claim', 'Funds moved to Orion Systems'], ['Evidence', '₹8,00,000 transfer, #E-004'], ['Source', 'transaction_record.pdf'], ['Location', 'Page 3, Transfers']]);
  return `<div class="land"><div class="wrap">
  <div class="lnav"><span class="brand" style="padding:0">${logo}TRACELENS</span><span class="grow"></span><span class="xs mut userchip">${esc(AUTH.user ? AUTH.user.name : '')}</span><button class="btn sm ghost" data-act="demo">Explore demo</button><button class="btn sm pri" data-act="start">Start investigation</button><button class="btn sm ghost" data-act="logout">Sign out</button>${themeBtn()}</div>
  <section class="hero"><div><img src="assets/logo-mark-512.png" width="72" height="72" alt="TraceLens logo" style="border-radius:16px;margin-bottom:14px;display:block"><span class="brandmark">TRACELENS</span><h1>Turn documents into evidence. Turn evidence into insight.</h1>
    <p style="margin:18px 0 22px;color:var(--mut);max-width:52ch;font-size:17px">An AI-powered document investigation platform that discovers entities, relationships, timelines, contradictions and hidden connections across complex document collections.</p>
    <div class="row"><button class="btn pri" data-act="start" style="padding:11px 20px">Start Investigation</button><button class="btn" data-act="demo" style="padding:11px 20px">Explore Demo</button></div>
    <p class="xs mut" style="margin-top:12px">The demo is a synthetic case. No account or upload needed.</p></div>
    <div>${hero}</div></section>
  <section class="lsec"><h2>Documents contain information. Investigations require connections.</h2><div class="ba"><div><h4>Reading by hand</h4><p class="mut" style="margin-top:6px">Hundreds of pages across contracts, emails, statements and ledgers. A denial on page 8 of one file and a transfer on page 3 of another are easy to miss. Dates drift, amounts differ, and nobody remembers which document said what.</p></div><div><h4>With TraceLens</h4><p class="mut" style="margin-top:6px">The whole collection becomes one evidence graph. Conflicts, gaps and unusual amounts are flagged, and every flag opens the exact passage, page and section it came from.</p></div></div></section>
  <section class="lsec"><h2>How it works</h2><p class="mut" style="max-width:60ch">Structured intermediate data at every stage, so each conclusion can be traced backwards.</p><div class="pipe">${['Documents', 'Text extraction and OCR', 'Chunking', 'Entities', 'Events', 'Claims', 'Relationships', 'Embeddings and retrieval', 'Contradictions', 'Anomalies', 'Evidence gaps', 'Investigator and report'].map((s, i) => `<span class="${i === 8 || i === 10 ? 'hi' : ''}">${s}</span>`).join('')}</div></section>
  <section class="lsec"><h2>Key capabilities</h2><div class="cap" style="margin-top:14px">${[['Evidence graph', 'Interactive map of people, organizations, amounts and accounts, with evidence behind every line.'], ['Contradiction engine', 'Compares claims across documents and reports potential conflicts with careful wording.'], ['Chain of evidence', 'Finding, claim, evidence, source, location. Always one click from the original passage.'], ['Timeline reconstruction', 'Dated passages become a chronology that links back to its sources.'], ['Evidence gap analyzer', 'Finds records the documents mention that were never provided.'], ['Anomaly checks', 'Unusual amounts, repeated references and duplicate passages.'], ['Cited investigator', 'Answers only from retrieved passages, and says so when evidence is insufficient.'], ['Human review', 'Verify, dismiss, tag, note, link and resolve. The reviewer stays in charge.']].map(([a, b]) => `<div><b>${a}</b><span class="mut">${b}</span></div>`).join('')}</div></section>
  <section class="lsec"><h2>Every conclusion is traceable</h2><div class="grid g2" style="margin-top:16px;align-items:center"><div class="panel">${chain}</div><div><p class="mut">Click any citation in an answer, graph, timeline or report to open the source passage with its entities highlighted. Where sources disagree, TraceLens shows both sides together and states what needs verifying.</p></div></div></section>
  <section class="lsec"><h2>Where it helps</h2><p class="mut" style="margin-top:6px">Compliance reviews, audits, journalism, legal research, financial investigation, procurement review, internal investigations, academic research, and any team with more documents than hours.</p></section>
  <section class="lsec"><h2>Privacy and security</h2><p class="mut" style="max-width:68ch;margin-top:6px">In this build, files you add are analyzed inside your browser and are not uploaded. The architecture is designed for per-investigation isolation, server-side file validation and secrets kept in environment variables. TraceLens assists investigators and does not make legal judgments. Findings are potential and need human verification.</p></section>
  <section class="lsec" style="text-align:center"><h2 style="margin:0 auto 14px;max-width:none">TraceLens connects the evidence.</h2><div class="row" style="justify-content:center"><button class="btn pri" data-act="demo" style="padding:11px 20px">Explore Demo Investigation</button><button class="btn" data-act="start" style="padding:11px 20px">Start Investigation</button></div><p class="xs mut" style="margin-top:24px;padding-bottom:30px">ALGOXILLA · ALG-AI-02 Intelligent Document Investigator</p></section></div></div>`;
}

function shell() {
  const e0 = I(), counts = { documents: e0.docs.length, evidence: e0.evidence.length, entities: e0.entities.length, graph: e0.relationships.length, timeline: e0.events.length, contradictions: e0.contradictions.length, anomalies: e0.anomalies.length, gaps: e0.gaps.length };
  const cur = S.route === 'search' ? '' : S.route;
  const body = (V[S.route] || V.overview)();
  return `<div id="app"><nav id="side" class="${S.side ? 'on' : ''}" aria-label="Investigation navigation"><button class="brand" data-act="landing" aria-label="TraceLens home">${logo}TRACELENS</button>
   ${NAV.map(([r, l]) => `<button class="nav" data-act="go" data-r="${r}" ${cur === r ? 'aria-current="page"' : ''}>${l}${counts[r] != null ? `<span class="n ${['contradictions', 'anomalies', 'gaps'].includes(r) && counts[r] ? 'alert' : ''}">${counts[r]}</span>` : ''}</button>`).join('')}
   <div class="demo-tag">${e0.synthetic ? '<b>DEMO INVESTIGATION</b>Synthetic data' : '<b>MY INVESTIGATION</b>Analyzed locally'}</div>
   <button class="btn sm" data-act="switch">${S.inv === 'demo' ? 'Switch to my investigation' : 'Switch to demo investigation'}</button>
   <button class="btn sm ghost" data-act="logout">Sign out${AUTH.user ? ' (' + esc(AUTH.user.name) + ')' : ''}</button></nav>
  <div id="main"><header id="top"><button class="btn sm" id="burger" data-act="burger" aria-label="Toggle navigation">Menu</button>
   <input type="search" id="gsearch" placeholder="Search entities, evidence, passages" aria-label="Search all documents" value="${S.route === 'search' ? esc(S.arg) : ''}">
   <button class="btn sm" data-act="present">Presentation mode</button>${themeBtn()}</header><main id="view">${body}</main></div></div>`;
}

let renderLock = false;
function render(resetScroll) {
  if (renderLock) return; renderLock = true;
  try {
    const y = window.scrollY, ae = document.activeElement, key = ae && ae.dataset && ae.dataset.in, pos = ae && ae.selectionStart, id = ae && ae.id;
    try { $('#root').innerHTML = S.route === 'login' ? loginView() : S.route === 'landing' ? landing() : shell(); } catch (err) { console.error(err); $('#root').innerHTML = '<div style="padding:40px"><h2>Something went wrong while drawing this page</h2><p class="mut">Go back to the overview and try again.</p><button class="btn" data-act="go" data-r="overview">Overview</button></div>'; }
    if (S.route === 'graph') initGraph();
    if (S.route === 'settings' && window.TRACELENS_API_URL) checkBackend();
    window.scrollTo(0, resetScroll ? 0 : y);
    const el = key ? document.querySelector(`[data-in="${key}"]`) : id && ['chatq', 'gsearch'].includes(id) ? document.getElementById(id) : null;
    if (el) { el.focus(); try { el.setSelectionRange(pos, pos); } catch (e) { /* not a text input */ } }
    drawPres(); drawDrawer();
  } catch (err) { console.error(err); } finally { renderLock = false; }
}

/* ---------- upload: real client-side parsing ---------- */
const OKEXT = ['txt', 'csv', 'md', 'json', 'log'], NEEDS_BACKEND = ['pdf', 'docx', 'png', 'jpg', 'jpeg', 'tif'];
const safeName = n => String(n).replace(/[^\w.\- ()]/g, '_').slice(0, 120);
const kb = n => n > 1048576 ? (n / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(n / 1024)) + ' KB';
/* ---------- in-browser PDF / DOCX / image extraction (used when no backend is configured) ---------- */
const CDN = 'https://cdnjs.cloudflare.com/ajax/libs/';
const loadScript = src => new Promise((res, rej) => { const el = document.createElement('script'); el.src = src; el.onload = res; el.onerror = () => rej(new Error('Could not load the extraction library. Check your internet connection and try again.')); document.head.appendChild(el); });
async function extractLocal(f, ext) {
  let text = '';
  if (ext === 'pdf') {
    if (!window.pdfjsLib) await loadScript(CDN + 'pdf.js/3.11.174/pdf.min.js');
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = CDN + 'pdf.js/3.11.174/pdf.worker.min.js';
    let doc; try { doc = await window.pdfjsLib.getDocument({ data: new Uint8Array(await f.arrayBuffer()) }).promise; } catch (e) { throw new Error('This PDF is corrupt or encrypted and could not be opened.'); }
    const pages = [];
    for (let i = 1; i <= doc.numPages; i++) {
      const tc = await (await doc.getPage(i)).getTextContent(); let line = '', out = '';
      for (const it of tc.items) { line += it.str; if (it.hasEOL) { out += line + '\n'; line = ''; } }
      pages.push((out + line).trim());
    }
    text = pages.filter(Boolean).join('\n\n');
    if (!text.trim()) throw new Error('No text layer found. This looks like a scanned PDF; OCR is required.');
  } else if (ext === 'docx') {
    if (!window.mammoth) await loadScript(CDN + 'mammoth/1.6.0/mammoth.browser.min.js');
    try { text = (await window.mammoth.extractRawText({ arrayBuffer: await f.arrayBuffer() })).value; } catch (e) { throw new Error('This DOCX file is corrupt and could not be opened.'); }
    if (!text.trim()) throw new Error('No readable text was found in this document.');
  } else {
    if (!window.Tesseract) await loadScript(CDN + 'tesseract.js/5.0.5/tesseract.min.js');
    try { text = (await window.Tesseract.recognize(f, 'eng')).data.text; } catch (e) { throw new Error('OCR failed on this image.'); }
    if (!text.trim()) throw new Error('OCR found no text in this image.');
  }
  return text.trim();
}
async function handleFiles(list) {
  for (const f of [...list]) {
    const ext = (f.name.split('.').pop() || '').toLowerCase(), rec = { name: safeName(f.name), ext, size: kb(f.size), steps: [false, false, false, false, false], error: '', text: '' };
    FILES.push(rec); render();
    if (f.size === 0) { rec.error = 'This file is empty.'; render(); continue; }
    if (f.size > 15 * 1048576) { rec.error = 'This file is over the 15 MB limit.'; render(); continue; }
    if (NEEDS_BACKEND.includes(ext) && window.TRACELENS_API_URL) {
      try { rec.steps[0] = true; render(); const fd = new FormData(); fd.append('file', f); const res = await fetch(window.TRACELENS_API_URL.replace(/\/$/, '') + '/api/extract', { method: 'POST', body: fd, headers: authHeaders() }); if (res.status === 401) { authLogout(); return; } const j = await res.json().catch(() => ({})); if (!res.ok) throw new Error(j.detail || 'extraction failed'); rec.text = j.text; rec.ext = j.kind || ext; rec.steps[1] = true; render(); MINE = analyze(FILES.filter(x => x.text && !x.error), 'My investigation'); rec.steps[2] = rec.steps[3] = rec.steps[4] = true; }
      catch (err) { rec.error = 'Backend extraction failed: ' + (err.message || 'service unreachable') + '.'; }
      S.inv = 'mine'; render(); continue;
    }
    if (NEEDS_BACKEND.includes(ext)) {
      try { rec.steps[0] = true; render(); rec.text = await extractLocal(f, ext); rec.ext = 'txt'; rec.steps[1] = true; render(); await new Promise(r => setTimeout(r, 30)); MINE = analyze(FILES.filter(x => x.text && !x.error), 'My investigation'); rec.steps[2] = rec.steps[3] = rec.steps[4] = true; }
      catch (err) { rec.error = err.message || 'The file could not be read.'; }
      S.inv = 'mine'; render(); continue;
    }
    if (!OKEXT.includes(ext)) { rec.error = 'Unsupported file type. Use TXT, CSV, MD or JSON here.'; render(); continue; }
    try {
      rec.steps[0] = true; render(); rec.text = await f.text(); if (!rec.text.trim()) throw new Error('empty'); if (/\u0000/.test(rec.text.slice(0, 2000))) throw new Error('binary');
      rec.steps[1] = true; render(); await new Promise(r => setTimeout(r, 30));
      MINE = analyze(FILES.filter(x => x.text && !x.error), 'My investigation'); rec.steps[2] = true; rec.steps[3] = true; rec.steps[4] = true;
    } catch (err) { rec.error = err.message === 'binary' ? 'This file looks binary rather than text.' : err.message === 'empty' ? 'No readable text was found in this file.' : 'The file could not be read.'; }
    S.inv = 'mine'; render();
  }
  if (MINE) toast(`Analyzed ${MINE.docs.length} document${MINE.docs.length > 1 ? 's' : ''}: ${MINE.evidence.length} evidence items, ${MINE.entities.length} entities`);
}

/* ---------- presentation mode ---------- */
const PRES = [
  { r: 'overview', t: 'The problem', d: 'Five documents, 48 emails, one story spread across them. Reading everything by hand takes days, and connections get missed.' },
  { r: 'documents', t: 'Documents', d: 'Each file is broken into passages that keep their document, page and section.' },
  { r: 'evidence', t: 'Evidence', d: 'Passages become evidence items with an ID, type, confidence and importance.' },
  { r: 'graph', arg: 'n:rajiv', t: 'Connections', d: 'Entities and relationships form an evidence graph. Rajiv Mehta connects to Orion Systems, an account, and a transfer. Click any line for its evidence.' },
  { r: 'contradictions', arg: 'C-07', t: 'A potential contradiction', d: 'An interview denial sits against a transfer record and an email. TraceLens shows both sides and what needs verifying. It does not accuse anyone.' },
  { r: 'timeline', t: 'Timeline', d: 'Dated passages become a chronology. Amber markers touch flagged evidence; dashed markers are statements.' },
  { r: 'chat', t: 'Investigation', d: 'Ask a question. The answer is built from retrieved passages, and each citation opens its source.', pre: () => { S.chat.demo = []; ask('What evidence connects Rajiv Mehta to Orion Systems?'); return true; } },
  { r: 'reports', t: 'Conclusion', d: 'Findings, gaps and sources are compiled into an explainable report. Everything stays marked as potential until a human verifies it.' }
];
function presGo(i) {
  S.inv = 'demo'; S.pres = Math.max(0, Math.min(PRES.length - 1, i)); const p = PRES[S.pres]; S.drawer = null;
  if (p.r === 'graph') { S.g.sel = null; S.g.path = null; }
  if (p.pre && p.pre()) { return; }
  nav(p.r, p.arg); if (location.hash === '#/' + p.r + (p.arg ? '/' + encodeURIComponent(p.arg) : '')) { parseHash(); render(true); }
}
function drawPres() {
  let el = $('#pres'); if (S.pres == null) { if (el) el.hidden = true; return; }
  if (!el) { el = document.createElement('div'); el.id = 'pres'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'Presentation guide'); document.body.appendChild(el); }
  const p = PRES[S.pres]; el.hidden = false;
  el.innerHTML = `<div class="row"><span class="chip on">${S.pres + 1} of ${PRES.length}</span><b class="grow">${esc(p.t)}</b><button class="btn sm ghost" data-act="presend">Exit</button></div><p class="sm" style="margin:8px 0 12px">${esc(p.d)}</p><div class="row"><button class="btn sm" data-act="presprev" ${S.pres === 0 ? 'disabled' : ''}>Back</button><button class="btn sm pri" data-act="presnext">${S.pres === PRES.length - 1 ? 'Finish' : 'Next'}</button>
  <span class="xs mut">${PRES.map((_, i) => i === S.pres ? '●' : '○').join(' ')}</span></div>`;
}

/* ---------- events ---------- */
function act(a, d, t, ev) {
  switch (a) {
    case 'go': nav(d.r, d.id); break;
    case 'landing': nav('landing'); break;
    case 'logout': authLogout(); break;
    case 'authmode': AUTH.mode = d.m; AUTH.error = ''; render(); break;
    case 'pwtoggle': { const inp = document.getElementById('a-' + d.f); if (!inp) break; AUTH.show[d.f] = !AUTH.show[d.f]; inp.type = AUTH.show[d.f] ? 'text' : 'password'; t.setAttribute('aria-pressed', AUTH.show[d.f]); t.setAttribute('aria-label', (AUTH.show[d.f] ? 'Hide' : 'Show') + ' password'); t.title = (AUTH.show[d.f] ? 'Hide' : 'Show') + ' password'; t.innerHTML = (AUTH.show[d.f] ? eyeOff : eyeOn) + '<span>' + (AUTH.show[d.f] ? 'Hide' : 'Show') + '</span>'; inp.focus(); break; }
    case 'theme': setTheme(getTheme() === 'light' ? 'dark' : 'light'); render(); break;
    case 'start': S.inv = 'mine'; nav('documents'); break;
    case 'demo': S.inv = 'demo'; nav('overview'); break;
    case 'switch': { S.inv = S.inv === 'demo' ? 'mine' : 'demo'; S.arg = ''; S.drawer = null; S.side = false; const h = '#/' + S.route; if (location.hash !== h) location.hash = h; else render(true); break; }
    case 'burger': S.side = !S.side; render(); break;
    case 'close': closeDrawer(); break;
    case 'ev': openDrawer('ev', d.id); break;
    case 'event': openDrawer('event', d.id); break;
    case 'ent': openDrawer('ent', d.id); break;
    case 'filt': S.f[d.k] = d.v; S.f.evMore = 0; render(); break;
    case 'more': S.f.evMore = (S.f.evMore || 12) + 12; render(); break;
    case 'doc': nav('documents', d.id); S.f.docPage = 1; S.f.docQ = ''; break;
    case 'pg': S.f.docPage = (+S.f.docPage || 1) + (+d.d); render(); break;
    case 'pgto': S.f.docPage = +d.p; render(); break;
    case 'evstatus': { const h = hv().ev[d.id] || { status: '', note: '', tags: [] }; h.status = d.s; hv().ev[d.id] = h; saveH(); render(); drawDrawer(); toast(d.s ? 'Marked ' + d.s : 'Review status cleared'); break; }
    case 'evnote': { const h = hv().ev[d.id] || { status: '', note: '', tags: [] }; h.note = $('#evnote').value.slice(0, 2000); h.tags = $('#evtags').value.split(',').map(s => s.trim().replace(/^#/, '')).filter(Boolean).slice(0, 10); hv().ev[d.id] = h; saveH(); toast('Note saved'); break; }
    case 'conflag': { const s = hv().con[d.id] || { resolved: false, flag: false, note: '' }; s[d.k] = !s[d.k]; hv().con[d.id] = s; saveH(); render(); break; }
    case 'connote': { const s = hv().con[d.id] || { resolved: false, flag: false, note: '' }; s.note = $('#connote').value.slice(0, 2000); hv().con[d.id] = s; saveH(); toast('Note saved'); break; }
    case 'link': { const to = $('#linkto').value, note = $('#linknote').value.trim(); if (!to || !note) { toast('Choose an entity and describe the relationship'); break; } hv().links.push({ a: d.id, b: to, note: note.slice(0, 80) }); saveH(); S.g.v = { x: 0, y: 0, k: 1 }; render(); toast('Manual link added'); break; }
    case 'gtype': S.g.hide[d.t] = !S.g.hide[d.t]; S.g.path = null; render(); break;
    case 'gsel': S.g.sel = { k: d.k, id: d.id }; drawGraph(); break;
    case 'gzoom': if (+d.d === 0) { S.g.v = { x: 0, y: 0, k: 1 }; S.g.pos = {}; drawGraph(); } else zoomAt(+d.d); break;
    case 'gpath': { const a1 = $('#pfrom').value, b1 = $('#pto').value; if (!a1 || !b1 || a1 === b1) { toast('Pick two different entities'); break; } const p = findPath(a1, b1); if (!p) { toast('No path between these entities in the visible graph'); break; } S.g.path = p; S.g.sel = null; render(); break; }
    case 'gpathclear': S.g.path = null; render(); break;
    case 'ask': ask(d.q); break;
    case 'send': { const i = $('#chatq'); if (i && i.value.trim()) { const q = i.value; i.value = ''; ask(q); } break; }
    case 'genreport': S.genBusy = true; S.report = null; render(); setTimeout(() => { S.report = buildReport(); S.genBusy = false; render(); }, 900); break;
    case 'dl': { const rp = S.report || buildReport(), base = 'tracelens-' + I().key; if (d.k === 'json') saveFile(base + '-report.json', reportJSON(rp)); else if (d.k === 'csv') saveFile(base + '-evidence.csv', evidenceCSV()); else saveFile(base + '-report.html', `<!doctype html><meta charset="utf-8"><title>TraceLens report</title><style>${REPORT_CSS}</style>${reportHTML(rp)}`); break; }
    case 'print': try { window.print(); } catch (e) { toast('Printing is unavailable here. Download the HTML report instead.'); } break;
    case 'resetH': H[S.inv] = { ev: {}, con: {}, links: [] }; saveH(); toast('Review data cleared'); render(); break;
    case 'clearFiles': FILES.length = 0; MINE = null; S.chat.mine = []; S.report = null; toast('Uploaded documents removed'); render(); break;
    case 'present': presGo(0); break;
    case 'presnext': if (S.pres >= PRES.length - 1) { S.pres = null; drawPres(); } else presGo(S.pres + 1); break;
    case 'presprev': presGo(S.pres - 1); break;
    case 'presend': S.pres = null; drawPres(); break;
  }
}
document.addEventListener('click', e => { const t = e.target.closest('[data-act]'); if (t) { if (t.tagName === 'A') e.preventDefault(); act(t.dataset.act, t.dataset, t, e); return; } if (e.target.id === 'scrim') closeDrawer(); });
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && S.drawer) closeDrawer();
  if (e.key === 'Enter') { const t = e.target; if (t.id === 'chatq') { e.preventDefault(); act('send', {}); } else if (t.id === 'gsearch') { e.preventDefault(); const q = t.value.trim(); if (q && S.route !== 'landing') nav('search', q); } else if (t.dataset && t.dataset.act && t.tagName !== 'BUTTON' && t.tagName !== 'INPUT') { e.preventDefault(); act(t.dataset.act, t.dataset, t, e); } }
  if (e.key === ' ' && e.target.dataset && e.target.dataset.act && e.target.getAttribute('role') === 'button' && e.target.tagName !== 'BUTTON') { e.preventDefault(); act(e.target.dataset.act, e.target.dataset, e.target, e); }
});
let deb; document.addEventListener('input', e => {
  const k = e.target.dataset && e.target.dataset.in; if (!k) return; const v = e.target.value; clearTimeout(deb);
  deb = setTimeout(() => { if (k === 'gq') { S.g.q = v; render(); } else { S.f[k] = v; S.f.evMore = 0; render(); } }, 160);
});
document.addEventListener('change', e => { if (e.target.id === 'file') { handleFiles(e.target.files); e.target.value = ''; } });
document.addEventListener('dragover', e => { if ($('#drop')) { e.preventDefault(); $('#drop').style.borderColor = 'var(--cy)'; } });
document.addEventListener('dragleave', e => { if ($('#drop')) $('#drop').style.borderColor = ''; });
document.addEventListener('drop', e => { if ($('#drop')) { e.preventDefault(); $('#drop').style.borderColor = ''; handleFiles(e.dataTransfer.files); } });
window.addEventListener('error', () => toast('Something went wrong. Your investigation data is unchanged.'));
document.addEventListener('DOMContentLoaded', () => { parseHash(); render(true); });

async function checkBackend() {
  const el = () => document.getElementById('beStatus'); try { const r = await fetch(window.TRACELENS_API_URL.replace(/\/$/, '') + '/api/health'); const j = await r.json(); if (el()) el().textContent = `Backend connected (${j.status}). Extraction: ${Object.entries(j.extractors || {}).map(([k, v]) => k + ' ' + (v ? 'on' : 'off')).join(', ')}. AI analysis: ${j.llm ? 'configured' : 'not configured'}.`; }
  catch (e) { if (el()) el().textContent = 'Backend unreachable. The app continues in browser-only mode.'; }
}
