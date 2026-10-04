/* ===== Derived indexes + local rule-based analysis for uploaded text/CSV =====
   Same output schema as DEMO, so a backend pipeline (FastAPI + LLM) can replace analyze(). */
const reEsc = s => s.replace(/[.*+?^${}()|[\]\\\/]/g,'\\$&');
const WORDS = ['zero','one','two','three','four','five','six','seven','eight','nine','ten'];
const nw = n => WORDS[n] || String(n);
const inr = n => '₹' + Number(n).toLocaleString('en-IN');
const MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const fmtDate = iso => { const d = new Date(iso + 'T00:00:00Z'); return d.getUTCDate() + ' ' + MON[d.getUTCMonth()] + ' ' + d.getUTCFullYear(); };

function derive(I) {
  I.E = Object.fromEntries(I.entities.map(e => [e.id, e]));
  I.EV = Object.fromEntries(I.evidence.map(e => [e.id, e]));
  I.D = Object.fromEntries(I.docs.map(d => [d.id, d]));
  I._layout = null;
  const evByEnt = new Map(), relByEnt = new Map(), push = (m, k, v) => { const a = m.get(k); if (!a) m.set(k, [v]); else if (a[a.length - 1] !== v) a.push(v); };
  I.evidence.forEach(x => x.entities.forEach(id => push(evByEnt, id, x)));
  I.relationships.forEach(r => { push(relByEnt, r.s, r); push(relByEnt, r.t, r); });
  I.entities.forEach(e => {
    const als = [...e.aliases].sort((a, b) => b.length - a.length).map(reEsc);
    e.re = als.length ? new RegExp(als.join('|'), 'gi') : null;
    const evs = evByEnt.get(e.id) || [];
    e.evIds = evs.map(x => x.id);
    e.docIds = [...new Set(evs.map(x => x.doc))];
    e.mentions = evs.reduce((n, x) => n + ((x.text.match(e.re) || []).length || 1), 0);
    e.rels = relByEnt.get(e.id) || [];
    e.related = [...new Set(e.rels.map(r => r.s === e.id ? r.t : r.s))];
    e.confScore = Math.min(98, 60 + e.mentions * 4 + e.docIds.length * 5);
  });
  const fc = new Set(), fa = new Set(), fg = new Set();
  I.contradictions.forEach(c => { c.a.forEach(i => fc.add(i)); c.b.forEach(i => fc.add(i)); });
  I.anomalies.forEach(a => a.ev.forEach(i => fa.add(i)));
  I.gaps.forEach(g => g.ev.forEach(i => fg.add(i)));
  I.evidence.forEach(x => {
    x.flags = [];
    if (fc.has(x.id)) x.flags.push('contradiction');
    if (fa.has(x.id)) x.flags.push('anomaly');
    if (fg.has(x.id)) x.flags.push('gap');
  });
  return I;
}

function confInfo(I, score, evIds) {
  const docs = new Set(evIds.map(id => I.EV[id] && I.EV[id].doc).filter(Boolean));
  const n = docs.size;
  const label = score >= 85 ? 'High' : score >= 65 ? 'Medium' : 'Low';
  const why = n >= 3 ? `this finding is supported by ${nw(n)} independent documents`
    : n === 2 ? 'two documents support it, but they have not been independently verified'
    : 'it rests on a single document';
  return { label, n, text: `${label} confidence because ${why}.`,
    note: 'Estimate combining source count, agreement between sources, and extraction confidence. It is not a statistical certainty.' };
}

/* ---------- local analyzer ---------- */
const MONTHS = 'Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec';
const RX = {
  money: /(?:₹|Rs\.?\s?|INR\s?|\$|€)\s?\d[\d,]*(?:\.\d+)?(?:\s?(?:lakh|crore|million|k)\b)?/gi,
  date: new RegExp(`\\b\\d{1,2}\\s(?:${MONTHS})[a-z]*\\.?,?\\s\\d{4}\\b|\\b(?:${MONTHS})[a-z]*\\.?\\s\\d{1,2},?\\s\\d{4}\\b|\\b\\d{4}-\\d{2}-\\d{2}\\b`, 'gi'),
  email: /[\w.+-]+@[\w-]+\.[\w.-]+/g,
  phone: /(?:\+\d{1,3}[\s-]?)?\b\d{5}[\s-]?\d{5}\b/g,
  ref: /\b(?:TRF|INV|PO|REF|TXN|CASE)[-\s]?\d{3,}\b/g,
  org: /\b(?:[A-Z][\w&]+\s){1,3}(?:Ltd|Pvt Ltd|Inc|LLC|Corp|Systems|Consulting|Infrastructure|Bank|Group|Technologies|Partners)\b/g,
  person: /\b(?:Mr|Ms|Mrs|Dr)\.?\s[A-Z][a-z]+(?:\s[A-Z][a-z]+)?|\b[A-Z][a-z]{2,}\s[A-Z][a-z]{2,}\b/g
};
const NOT_PEOPLE = new RegExp(`^(?:${MONTHS}|January|February|March|April|June|July|August|September|October|November|December|The|This|That|From|Dear|Total|Payment|Debit|Credit|Please|Page)\\b`);
const NEG = /\b(no|never|denied|did not|had not|not any|without)\b/i;

function normMoney(s) {
  const m = s.replace(/[^\d.,a-z]/gi, '').toLowerCase();
  let v = parseFloat(m.replace(/,/g, '').replace(/[a-z]+$/, '')) || 0;
  if (/lakh/.test(s.toLowerCase())) v *= 1e5; else if (/crore/.test(s.toLowerCase())) v *= 1e7;
  else if (/million/.test(s.toLowerCase())) v *= 1e6; else if (/\dk\b/i.test(s)) v *= 1e3;
  return v;
}
function parseDate(s) {
  const t = Date.parse(s.replace(/(\d)(st|nd|rd|th)/, '$1') + ' UTC');
  return isNaN(t) ? null : new Date(t).toISOString().slice(0, 10);
}

function analyze(files, name) {
  const I = { key: 'mine', label: name || 'My investigation', synthetic: false, docs: [], entities: [], evidence: [], relationships: [], events: [], contradictions: [], anomalies: [], gaps: [] };
  const entIdx = new Map(), entById = new Map();
  const getEnt = (nm, type) => {
    const k = type + '|' + nm.toLowerCase();
    if (!entIdx.has(k)) { const e = { id: 'x' + entIdx.size, name: nm, type, aliases: [nm] }; entIdx.set(k, e); I.entities.push(e); entById.set(e.id, e); }
    return entIdx.get(k);
  };
  files.forEach((f, di) => {
    const docId = 'D' + (di + 1);
    const pages = []; for (let i = 0; i < f.text.length; i += 1800) pages.push(f.text.slice(i, i + 1800));
    I.docs.push({ id: docId, name: f.name, type: f.ext.toUpperCase(), pages: pages.length || 1, unit: 'Page', size: f.size, meta: 'Uploaded in this session', pagesText: pages });
    pages.forEach((pt, pi) => {
      const parts = f.ext === 'csv' ? pt.split(/\n/) : pt.split(/(?<=[.!?])\s+|\n{2,}/);
      parts.map(s => s.trim()).filter(s => s.length > 12).forEach(s => {
        const ents = [];
        const add = (re, type, cleaner) => { (s.match(re) || []).forEach(m => { const v = cleaner ? cleaner(m) : m.trim(); if (v) ents.push(getEnt(v, type).id); }); };
        add(RX.money, 'Money'); add(RX.date, 'Date'); add(RX.email, 'ID'); add(RX.phone, 'ID'); add(RX.ref, 'ID');
        add(RX.org, 'Organization', m => m.replace(/^(?:The|From|To)\s/, '').trim());
        add(RX.person, 'Person', m => (NOT_PEOPLE.test(m) || /(Systems|Consulting|Infrastructure|Ltd|Bank|Group|Corp|Inc|LLC|Technologies|Partners)$/.test(m)) ? null : m.trim());
        const uniq = [...new Set(ents)];
        if (!uniq.length) return;
        const types = uniq.map(i => entById.get(i).type);
        const money = (s.match(RX.money) || []).map(normMoney).filter(Boolean);
        const type = /@/.test(s) || /^(from|to|subject):/i.test(s) ? 'Communication'
          : (money.length && types.includes('Date')) ? 'Transaction'
          : /\b(stated|said|claimed|denied|told|recalled)\b/i.test(s) ? 'Statement'
          : money.length ? 'Report figure' : 'Mention';
        const d = (s.match(RX.date) || []).map(parseDate).find(Boolean);
        I.evidence.push({ id: 'E-' + String(I.evidence.length + 1).padStart(3, '0'), doc: docId, page: pi + 1, section: 'Extracted passage', type,
          text: s.slice(0, 400), entities: uniq, conf: Math.min(90, 55 + uniq.length * 6), importance: uniq.length >= 4 || money.length ? 'High' : uniq.length >= 2 ? 'Medium' : 'Low',
          tags: ['auto-extracted'], amount: money.length ? Math.max(...money) : undefined, date: d });
      });
    });
  });
  // entity aliases for people/orgs: short surname forms are not guessed. Keep exact strings only.
  // relationships: co-mention of person/org entities within one passage
  const rel = new Map();
  I.evidence.forEach(x => {
    const po = x.entities.filter(i => ['Person', 'Organization'].includes(entById.get(i).type));
    for (let a = 0; a < po.length; a++) for (let b = a + 1; b < po.length; b++) {
      const k = po[a] + '>' + po[b]; if (!rel.has(k)) rel.set(k, { s: po[a], t: po[b], ev: [] }); rel.get(k).ev.push(x.id);
    }
    const txMoney = x.entities.filter(i => entById.get(i).type === 'Money');
    if (x.type === 'Transaction') po.forEach(p => txMoney.forEach(m => { const k = p + '>' + m; if (!rel.has(k)) rel.set(k, { s: p, t: m, ev: [], type: 'Appears with amount' }); rel.get(k).ev.push(x.id); }));
  });
  [...rel.values()].forEach((r, i) => I.relationships.push({ id: 'R-' + String(i + 1).padStart(2, '0'), s: r.s, t: r.t, type: r.type || 'Co-mentioned', ev: [...new Set(r.ev)], conf: Math.min(80, 50 + r.ev.length * 8) }));
  // events
  I.evidence.filter(x => x.date).sort((a, b) => a.date.localeCompare(b.date)).forEach(x => I.events.push({
    id: 'EV-' + String(I.events.length + 1).padStart(3, '0'), date: x.date, desc: x.text.length > 140 ? x.text.slice(0, 137) + '…' : x.text, ev: [x.id], entities: x.entities.filter(i => entById.get(i).type !== 'Date'), kind: x.type === 'Statement' ? 'claim' : 'fact' }));
  // anomalies: amount outliers (IQR) + duplicates
  const tx = I.evidence.filter(x => x.amount);
  if (tx.length >= 4) {
    const v = tx.map(x => x.amount).sort((a, b) => a - b), q = p => v[Math.floor((v.length - 1) * p)];
    const iqr = q(.75) - q(.25), top = q(.75) + 1.5 * iqr; let restAmts = null;
    tx.filter(x => x.amount > top && iqr > 0).forEach(x => {
      const rest = restAmts || (restAmts = tx.filter(y => y.amount <= top).map(y => y.amount));
      I.anomalies.push({ id: 'A-' + String(I.anomalies.length + 1).padStart(2, '0'), title: 'Amount above the typical range', observed: x.amount, lo: rest.reduce((m, v) => Math.min(m, v), Infinity), hi: rest.reduce((m, v) => Math.max(m, v), -Infinity), ev: [x.id], conf: 70,
        text: `${inr(x.amount)} is higher than the other amounts found in this document set.`, caution: 'Unusual size alone is not evidence of wrongdoing.' });
    });
  }
  const seen = new Map();
  I.evidence.forEach(x => { const k = x.text.toLowerCase().replace(/\W+/g, ' ').trim(); if (seen.has(k)) I.anomalies.push({ id: 'A-' + String(I.anomalies.length + 1).padStart(2, '0'), title: 'Duplicate or near-identical passage', ev: [seen.get(k), x.id], conf: 90, text: 'The same passage appears more than once in the document set.', caution: 'May be a repeated export rather than a repeated event.' }); else seen.set(k, x.id); });
  const evByEntA = new Map(); I.evidence.forEach(x => x.entities.forEach(id => { const a = evByEntA.get(id); if (!a) evByEntA.set(id, [x]); else if (a[a.length - 1] !== x) a.push(x); }));
  const posCache = new Map();
  // heuristic contradictions: negated statement vs non-negated evidence sharing 2+ people/orgs
  I.evidence.filter(x => NEG.test(x.text) && x.type === 'Statement').forEach(neg => {
    const po = neg.entities.filter(i => ['Person', 'Organization'].includes(entById.get(i).type)); if (po.length < 2) return;
    const pk = po.join('>'); let pos = posCache.get(pk);
    if (!pos) { pos = []; for (const y of (evByEntA.get(po[0]) || [])) { if (po.every(p => y.entities.includes(p)) && !NEG.test(y.text)) { pos.push(y); if (pos.length === 3) break; } } posCache.set(pk, pos); } /* a negated passage can never be its own counter-evidence; only three are shown */
    if (pos.length) I.contradictions.push({ id: 'C-' + String(I.contradictions.length + 1).padStart(2, '0'), type: 'Claim vs evidence (heuristic)', severity: 'Medium', conf: 62, a: [neg.id], b: pos.map(p => p.id).slice(0, 3),
      title: 'Negated statement vs. passages linking the same parties', conflict: 'A statement uses negation about parties that other passages mention together. This is a rule-based flag, not a reasoned finding.', caution: 'Requires human verification. Full contradiction reasoning needs the backend LLM pipeline.', next: ['Read both passages in context'],
      chain: [['Finding', 'Possible inconsistency'], ['Claim', neg.text.slice(0, 90)], ['Evidence', neg.id + ' against ' + pos.map(p => p.id).slice(0, 3).join(', ')], ['Source', I.docs.find(d => d.id === neg.doc).name], ['Location', 'Page ' + neg.page]] });
  });
  // gaps: referenced documents with no matching file name
  const KEYS = ['invoice', 'receipt', 'confirmation', 'minutes', 'agreement', 'contract', 'report', 'letter', 'statement'];
  I.evidence.forEach(x => KEYS.forEach(k => {
    const m = new RegExp(`\\b(?:attached|enclosed|see|per|referenced|as per|signed)\\b[^.]{0,40}\\b${k}\\b`, 'i');
    if (m.test(x.text) && !I.docs.some(d => d.name.toLowerCase().includes(k)) && !I.gaps.some(g => g.expected === k))
      I.gaps.push({ id: 'G-' + String(I.gaps.length + 1).padStart(2, '0'), title: `Referenced ${k} not found`, severity: 'Medium', ev: [x.id], expected: k, text: `A passage refers to a ${k}, but no uploaded file name matches it.`, next: `Search for the ${k}.` });
  }));
  return derive(I);
}
