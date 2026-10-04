/* ===== retrieval, investigator chat, report ===== */
const STOP = new Set('the a an of to in on for and or is are was were be by with from at as that this what which who whom where when how show find all any every me my about between connects connect connected evidence documents document mention mentioning mentioned does do did has have had it its their there than into'.split(' '));
const SYN = { payment: ['transfer', 'paid', 'debit', 'credit', 'transaction'], payments: ['transfer', 'paid', 'debit', 'credit', 'transaction'], transfer: ['payment', 'debit', 'credit', 'paid'], paid: ['payment', 'transfer', 'credit'], approval: ['approved', 'granted'], approved: ['approval', 'granted'], contract: ['agreement', 'procurement'], agreement: ['contract', 'procurement'], denied: ['stated', 'never'], email: ['message', 'from'], delivery: ['delivered', 'confirmation'], money: ['payment', 'amount'] };
const MLONG = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
const NOUN = { Transaction: 'Transaction record', 'Contract term': 'Contract clause', Approval: 'Approval record', Communication: 'Email', Statement: 'Interview statement', 'Report figure': 'Report figure', Mention: 'Passage' };
function amountQuery(q) {
  const m = q.match(/(?:above|over|more than|greater than|exceeding|>)\s*(?:₹|rs\.?|inr|\$)?\s*([\d.,]+)\s*(lakh|lakhs|crore|crores|k|thousand|million)?/i); if (!m) return null;
  let v = parseFloat(m[1].replace(/,/g, '')); if (isNaN(v)) return null; const u = (m[2] || '').toLowerCase();
  if (u.startsWith('lakh')) v *= 1e5; else if (u.startsWith('crore')) v *= 1e7; else if (u === 'k' || u === 'thousand') v *= 1e3; else if (u === 'million') v *= 1e6; return v;
}
function retrieve(q, k = 6) {
  const e0 = I(), lq = q.toLowerCase(), thr = amountQuery(q);
  const matched = e0.entities.filter(e => e.type !== 'Date' && e.aliases.some(a => a.length > 2 && lq.includes(a.toLowerCase())));
  let toks = lq.split(/[^a-z0-9₹]+/).filter(t => t.length > 2 && !STOP.has(t)); const syn = [];
  toks.forEach(t => { (SYN[t] || []).forEach(s => syn.push(s)); const mi = MLONG.indexOf(t); if (mi >= 0) syn.push(MON[mi].toLowerCase()); });
  const entTok = new Set(matched.flatMap(e => e.aliases.flatMap(a => a.toLowerCase().split(/[^a-z0-9₹]+/))));
  const kwToks = toks.filter(t => !entTok.has(t));
  let hits = [];
  e0.evidence.forEach(x => {
    if (evH(x.id).status === 'dismissed') return; const tx = x.text.toLowerCase();
    if (thr != null) { if (x.amount && x.amount > thr) hits.push({ x, score: 1 + x.amount / 1e7 }); return; }
    const kw = kwToks.filter(t => tx.includes(t)).length, sy = syn.filter(t => tx.includes(t)).length * .4, en = matched.filter(e => x.entities.includes(e.id)).length * 2;
    if (kw + sy + en === 0) return; hits.push({ x, score: kw * 1.5 + sy + en + x.conf / 200 + (x.importance === 'High' ? .3 : 0) });
  });
  if (matched.length >= 2) { const both = hits.filter(h => matched.filter(e => h.x.entities.includes(e.id)).length >= 2); if (both.length) hits = both; }
  hits.sort((a, b) => b.score - a.score);
  return { hits: hits.slice(0, k), matched, thr, nCand: hits.length };
}
const sevRank = { High: 0, Medium: 1, Low: 2 };
function investigate(q) {
  const e0 = I(), lq = q.toLowerCase(), R = retrieve(q, 8), ents = R.matched.filter(e => !['Money'].includes(e.type));
  const trace = `Query understood → ${ents.length ? 'entities: ' + ents.map(e => e.name).join(', ') : 'no entity match'}${R.thr != null ? ' · amount filter above ' + inr(R.thr) : ''} → ${R.nCand} candidate passages → ranked by relevance, entity match, confidence → top ${R.hits.length} cited`;
  const none = { tag: 'none', lead: 'I couldn’t find sufficient evidence in the uploaded documents.', note: e0.docs.length ? 'Try naming a person, organization or amount, or add more documents.' : 'No documents have been added to this investigation yet.', items: [], trace };
  if (!e0.docs.length) return none;
  if (/\b(gap|missing|absent|not found|lack)/.test(lq)) return e0.gaps.length ? { tag: 'ok', lead: `I found ${e0.gaps.length} evidence gap${e0.gaps.length > 1 ? 's' : ''}: records the evidence refers to that are not in the document set.`, items: e0.gaps.map(g => ({ label: g.title + '. ' + g.next, ids: g.ev })), note: 'A gap means the record was not uploaded, not that it does not exist.', trace } : none;
  if (/\b(anomal|unusual|duplicate|suspicious|irregular)/.test(lq)) return e0.anomalies.length ? { tag: 'ok', lead: `I found ${e0.anomalies.length} possible anomal${e0.anomalies.length > 1 ? 'ies' : 'y'}.`, items: e0.anomalies.map(a => ({ label: a.title, ids: a.ev })), note: 'These are leads to check. Unusual does not mean improper.', trace } : none;
  if (/\b(contradict|inconsisten|conflict|disagree)/.test(lq)) {
    const ids = new Set(R.hits.map(h => h.x.id)), rel = e0.contradictions.filter(c => [...c.a, ...c.b].some(i => ids.has(i)));
    const cs = (rel.length ? rel : e0.contradictions).sort((a, b) => sevRank[a.severity] - sevRank[b.severity]);
    return cs.length ? { tag: 'ok', lead: `I found ${cs.length} potential contradiction${cs.length > 1 ? 's' : ''}${rel.length ? ' related to your question' : ''}.`, items: cs.map(c => ({ label: `${c.id} (${c.severity}, ${c.conf}%): ${c.title}`, ids: [...c.a, ...c.b], link: c.id })), note: 'Each is a potential contradiction that requires human verification, not a conclusion about intent.', trace } : none;
  }
  if (/\b(timeline|chronolog|sequence|when did)/.test(lq) && !ents.length) return e0.events.length ? { tag: 'ok', lead: `The timeline has ${e0.events.length} extracted events. The earliest are:`, items: [...e0.events].sort((a, b) => a.date.localeCompare(b.date)).slice(0, 6).map(v => ({ label: `${fmtDate(v.date)}: ${v.desc}`, ids: v.ev })), note: 'Open the Timeline page for the full chronology.', trace } : none;
  if (!R.hits.length) return none;
  const hits = R.hits.slice(0, 6), ids = hits.map(h => h.x.id), docsN = new Set(hits.map(h => h.x.doc)).size;
  const items = hits.map(h => ({ label: `${NOUN[h.x.type] || 'Passage'}${R.thr != null ? ': ' + inr(h.x.amount) : ''}`, ids: [h.x.id] }));
  let lead = R.thr != null ? `I found ${hits.length} transaction${hits.length > 1 ? 's' : ''} above ${inr(R.thr)} across ${docsN} document${docsN > 1 ? 's' : ''}.` : `I found ${hits.length} relevant evidence item${hits.length > 1 ? 's' : ''} across ${docsN} document${docsN > 1 ? 's' : ''}.`;
  const con = e0.contradictions.find(c => [...c.a, ...c.b].filter(i => ids.includes(i)).length >= 2);
  let note;
  if (con) { const bN = con.b.filter(i => ids.includes(i)).length, aN = con.a.filter(i => ids.includes(i)).length; const bd = new Set(con.b.map(i => e0.D[e0.EV[i].doc].name)).size;
    note = `${cap(nw(bN))} source${bN > 1 ? 's' : ''} across ${bd} document${bd > 1 ? 's' : ''} ${bN > 1 ? 'indicate' : 'indicates'} the activity, while ${nw(aN)} statement${aN > 1 ? 's' : ''} conflict${aN > 1 ? '' : 's'} with it. This creates a potential contradiction (${con.id}) requiring verification.`; }
  else note = 'These passages are listed as found. No contradiction was detected among them, and no inference beyond what the passages state is drawn.';
  return { tag: 'ok', lead, items, note, trace, link: con && con.id };
}
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
function ansHtml(a) {
  return `<p>${esc(a.lead)}</p>${a.items.length ? `<ol style="margin:10px 0;padding-left:20px;display:grid;gap:8px">${a.items.map(it => `<li><div class="sm">${esc(it.label)}${it.link ? ` <button class="chip sev-High" data-act="go" data-r="contradictions" data-id="${esc(it.link)}">Open ${esc(it.link)}</button>` : ''}</div><div>${cites(it.ids)}</div></li>`).join('')}</ol>` : ''}<p class="sm" style="margin-top:8px">${esc(a.note)}</p>${a.link ? `<p style="margin-top:8px"><button class="btn sm" data-act="go" data-r="contradictions" data-id="${esc(a.link)}">Open contradiction ${esc(a.link)}</button></p>` : ''}<details style="margin-top:8px"><summary class="xs mut" style="cursor:pointer">How this answer was built</summary><p class="xs mut" style="margin-top:4px">${esc(a.trace)}. Evidence is retrieved first; the answer is assembled only from those passages.</p></details>`;
}
V.chat = () => {
  const e0 = I(), msgs = S.chat[S.inv];
  return `${ph('TraceLens Investigator', 'Ask about the evidence. Answers are assembled only from retrieved passages, and every claim carries a citation you can open.')}
  <div class="list" id="msgs" style="margin-bottom:14px">${msgs.length ? msgs.map(m => m.role === 'u' ? `<div class="msg u">${esc(m.text)}</div>` : `<div class="msg">${ansHtml(m.ans)}</div>`).join('') : `<div class="panel"><p class="sm mut" style="margin-bottom:10px">Try one of these:</p><div class="list">${suggestions().map(q => `<button class="btn sm" style="text-align:left" data-act="ask" data-q="${esc(q)}">${esc(q)}</button>`).join('')}</div></div>`}
  ${S.busy ? '<div class="msg" aria-live="polite"><p class="sm mut">Retrieving evidence, ranking, composing with citations…</p><div class="skel" style="width:80%"></div><div class="skel" style="width:60%"></div></div>' : ''}</div>
  <div class="row" style="position:sticky;bottom:0;background:var(--ink);padding:10px 0"><input type="text" id="chatq" placeholder="Ask about the evidence…" aria-label="Question for TraceLens Investigator" style="flex:1" ${e0.docs.length ? '' : 'disabled'}><button class="btn pri" data-act="send" ${S.busy ? 'disabled' : ''}>Ask</button></div>`;
};
function ask(q) {
  q = q.trim(); if (!q || S.busy) return; S.chat[S.inv].push({ role: 'u', text: q }); S.busy = true;
  if (S.route !== 'chat') nav('chat'); else render();
  setTimeout(() => { let a; try { a = investigate(q); } catch (e) { a = { tag: 'none', lead: 'Something went wrong while searching the evidence.', note: 'Please try rephrasing the question.', items: [], trace: 'error' }; } S.chat[S.inv].push({ role: 'a', ans: a }); S.busy = false; render(); window.scrollTo({ top: document.body.scrollHeight }); }, 550);
}

/* ---------- report ---------- */
function buildReport() {
  const e0 = I(), avg = Math.round(e0.evidence.reduce((n, x) => n + x.conf, 0) / (e0.evidence.length || 1)), top = [...e0.contradictions].sort((a, b) => sevRank[a.severity] - sevRank[b.severity])[0];
  const reviewed = e0.evidence.filter(x => evH(x.id).status).length;
  return { title: e0.label, synthetic: e0.synthetic, generated: new Date().toISOString().slice(0, 10), avg, reviewed, top,
    summary: `This review covers ${e0.docs.length} document${e0.docs.length === 1 ? '' : 's'}. TraceLens extracted ${e0.entities.length} entities, ${e0.relationships.length} relationships and ${e0.events.length} events, and flagged ${e0.contradictions.length} potential contradiction${e0.contradictions.length === 1 ? '' : 's'}, ${e0.anomalies.length} possible anomal${e0.anomalies.length === 1 ? 'y' : 'ies'} and ${e0.gaps.length} evidence gap${e0.gaps.length === 1 ? '' : 's'}.` + (top ? ` The most significant item, ${top.id}, indicates a possible inconsistency: ${top.conflict} It requires human verification.` : '') };
}
function reportHTML(rp) {
  const e0 = I(), t = (h, rows) => `<table><thead><tr>${h.map(x => `<th>${esc(x)}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
  const src = x => `${esc(e0.D[x.doc].name)}, ${locOf(x)}`;
  const open = [...e0.contradictions.filter(c => !conState(c.id).resolved).flatMap(c => c.next), ...e0.gaps.map(g => g.next)];
  return `<h1>Investigation report: ${esc(rp.title)}</h1><p style="color:#555">Generated ${esc(rp.generated)} by TraceLens${rp.synthetic ? ' · DEMO INVESTIGATION, synthetic data' : ''}</p>
  <p class="note">TraceLens assists investigators. Findings are potential and require human verification. This report makes no legal or criminal judgment.</p>
  <h2>1. Investigation overview</h2><p>${esc(rp.summary)}</p>
  <h2>2. Documents analyzed</h2>${t(['Document', 'Type', 'Length', 'Evidence items'], e0.docs.map(d => [esc(d.name), esc(d.type), d.pages + ' ' + d.unit.toLowerCase() + 's', e0.evidence.filter(x => x.doc === d.id).length]))}
  <h2>3. Key findings</h2><ul>${[...e0.contradictions.map(c => `<b>${esc(c.id)} (${c.severity}, ${c.conf}%)</b> potential contradiction: ${esc(c.title)}. Evidence: ${[...c.a, ...c.b].join(', ')}.`), ...e0.anomalies.map(a => `<b>${esc(a.id)}</b> possible anomaly: ${esc(a.title)}. Evidence: ${a.ev.join(', ')}.`), ...e0.gaps.map(g => `<b>${esc(g.id)}</b> evidence gap: ${esc(g.title)}. Evidence: ${g.ev.join(', ')}.`)].map(x => `<li>${x}</li>`).join('') || '<li>No findings flagged.</li>'}</ul>
  <h2>4. Evidence summary</h2>${t(['ID', 'Source', 'Type', 'Excerpt'], e0.evidence.filter(x => x.importance === 'High').map(x => [esc(x.id), src(x), esc(x.type), esc(x.text.length > 150 ? x.text.slice(0, 147) + '…' : x.text)]))}
  <h2>5. Entity relationships</h2>${t(['Relationship', 'Type', 'Confidence', 'Evidence'], e0.relationships.map(r => [esc(e0.E[r.s].name) + ' → ' + esc(e0.E[r.t].name), esc(r.type), r.conf + '%', esc(r.ev.join(', '))]))}
  <h2>6. Timeline</h2>${t(['Date', 'Event', 'Sources'], [...e0.events].sort((a, b) => a.date.localeCompare(b.date)).map(v => [fmtDate(v.date), esc(v.desc), esc(v.ev.join(', '))]))}
  <h2>7. Contradictions</h2>${e0.contradictions.map(c => `<p><b>${esc(c.id)} · ${esc(c.type)} · ${c.severity} · ${c.conf}%</b><br>Claim A (${c.a.map(i => src(e0.EV[i])).join('; ')}): “${esc(e0.EV[c.a[0]].text)}”<br>Claim B (${c.b.map(i => src(e0.EV[i])).join('; ')}): “${esc(e0.EV[c.b[0]].text)}”<br>Why they may conflict: ${esc(c.conflict)}<br><i>${esc(c.caution)}</i>${conState(c.id).resolved ? '<br>Status: marked resolved by reviewer.' : ''}</p>`).join('') || '<p>None flagged.</p>'}
  <h2>8. Anomalies</h2>${e0.anomalies.map(a => `<p><b>${esc(a.id)}</b> ${esc(a.title)}. ${esc(a.text)}${a.observed ? ` Observed ${inr(a.observed)}; typical range ${inr(a.lo)} to ${inr(a.hi)}.` : ''} Evidence: ${a.ev.join(', ')}.</p>`).join('') || '<p>None flagged.</p>'}
  <h2>9. Unresolved questions</h2><ul>${open.map(x => `<li>${esc(x)}</li>`).join('') || '<li>None.</li>'}</ul>
  <h2>10. Evidence sources</h2>${t(['ID', 'Document', 'Location', 'Section'], e0.evidence.map(x => [esc(x.id), esc(e0.D[x.doc].name), locOf(x), esc(x.section)]))}
  <h2>11. Confidence notes</h2><p>Mean extraction confidence is ${rp.avg}%. Scores combine the number of supporting sources, agreement between them and extraction quality; they are estimates, not statistical certainty. ${rp.reviewed} of ${e0.evidence.length} evidence items have been reviewed by a human.${rp.synthetic ? ' All data in this report is synthetic.' : ''}</p>`;
}
const csvCell = v => '"' + String(v ?? '').replace(/"/g, '""') + '"';
function evidenceCSV() { const e0 = I(); return ['id,document,location,section,type,confidence,importance,entities,text,review_status,note'].concat(e0.evidence.map(x => [x.id, e0.D[x.doc].name, locOf(x), x.section, x.type, x.conf, x.importance, x.entities.map(i => e0.E[i].name).join('; '), x.text, evH(x.id).status, evH(x.id).note].map(csvCell).join(','))).join('\n'); }
function reportJSON(rp) { const e0 = I(); return JSON.stringify({ investigation: e0.label, synthetic: e0.synthetic, generated: rp.generated, summary: rp.summary, documents: e0.docs.map(({ pagesText, ...d }) => d), entities: e0.entities.map(e => ({ id: e.id, name: e.name, type: e.type, mentions: e.mentions, documents: e.docIds })), evidence: e0.evidence.map(({ flags, ...x }) => x), relationships: e0.relationships, events: e0.events, contradictions: e0.contradictions, anomalies: e0.anomalies, gaps: e0.gaps, review: hv() }, null, 2); }
async function saveFile(name, data) {
  try { if (window.claude && claude.use) { const d = await claude.use('downloads'); if (d) { await d.save({ filename: name, data }); return; } } } catch (e) { if (e && e.code === 'declined') return; }
  try { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([data])); a.download = name; document.body.appendChild(a); a.click(); a.remove(); toast('Downloaded ' + name); }
  catch (e) { try { await navigator.clipboard.writeText(data); toast('Downloads are unavailable here. Copied to clipboard instead.'); } catch (e2) { toast('Downloads are unavailable in this view.'); } }
}
const REPORT_CSS = 'body{font-family:Georgia,serif;max-width:860px;margin:30px auto;color:#1a2233;line-height:1.55;padding:0 20px}h2{font-size:17px;border-bottom:1px solid #ccd;padding-bottom:3px;margin-top:22px}table{border-collapse:collapse;width:100%;font-size:13px}td,th{border:1px solid #ccd;padding:5px 8px;text-align:left;vertical-align:top}.note{background:#eef2fa;padding:8px 12px;font-size:13px}';
V.reports = () => {
  const e0 = I(); if (!e0.docs.length) return ph('Reports', 'Generate an investigation report.') + needDocs();
  if (S.genBusy) return ph('Reports', 'Assembling the report…') + '<div class="panel"><p class="sm mut">Collecting findings, evidence and sources…</p><div class="skel" style="width:90%"></div><div class="skel" style="width:70%"></div><div class="skel" style="width:80%"></div></div>';
  if (!S.report) return ph('Investigation report', 'Eleven sections: overview, documents, findings, evidence, relationships, timeline, contradictions, anomalies, open questions, sources and confidence notes.') + empty('No report yet', 'Generate a report from the current evidence, including your review decisions.', '<button class="btn pri" data-act="genreport">Generate investigation report</button>');
  return `${ph('Investigation report', 'Generated from the current evidence and review state.', '<div class="row"><button class="btn sm" data-act="dl" data-k="html">Download report (HTML)</button><button class="btn sm" data-act="dl" data-k="json">JSON</button><button class="btn sm" data-act="dl" data-k="csv">Evidence CSV</button><button class="btn sm" data-act="print">Print or save as PDF</button><button class="btn sm ghost" data-act="genreport">Regenerate</button></div>')}<div class="sheet">${reportHTML(S.report)}</div>`;
};
