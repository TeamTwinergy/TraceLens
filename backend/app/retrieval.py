"""Hybrid retrieval over an investigation's evidence: keyword + synonym + entity match + metadata ranking.
Answers are assembled only from retrieved passages. Embedding search plugs in at `score` (see docs/ARCHITECTURE.md)."""
import re

STOP = set("the a an of to in on for and or is are was were be by with from at as that this what which who whom where when how show find all any every me my about between connects connect connected evidence documents document mention mentioning mentioned does do did has have had it its their there than into".split())
SYN = {"payment": ["transfer", "paid", "debit", "credit", "transaction"], "payments": ["transfer", "paid", "debit", "credit", "transaction"],
       "transfer": ["payment", "debit", "credit", "paid"], "approval": ["approved", "granted"], "contract": ["agreement", "procurement"],
       "denied": ["stated", "never"], "email": ["message", "from"], "delivery": ["delivered", "confirmation"]}
NUM = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"]


def amount_threshold(q: str):
    m = re.search(r"(?:above|over|more than|greater than|exceeding|>)\s*(?:₹|rs\.?|inr|\$)?\s*([\d.,]+)\s*(lakhs?|crores?|k|thousand|million)?", q, re.I)
    if not m:
        return None
    try:
        v = float(m.group(1).replace(",", ""))
    except ValueError:
        return None
    u = (m.group(2) or "").lower()
    mult = 1e5 if u.startswith("lakh") else 1e7 if u.startswith("crore") else 1e3 if u in ("k", "thousand") else 1e6 if u == "million" else 1
    return v * mult


def retrieve(case: dict, q: str, k: int = 6) -> dict:
    ents = {e["id"]: e for e in case["entities"]}
    lq = q.lower()
    thr = amount_threshold(q)
    matched = [e for e in case["entities"] if e["type"] != "Date" and any(len(a) > 2 and a.lower() in lq for a in e["aliases"])]
    toks = [t for t in re.split(r"[^a-z0-9₹]+", lq) if len(t) > 2 and t not in STOP]
    ent_tokens = {t for e in matched for a in e["aliases"] for t in re.split(r"[^a-z0-9₹]+", a.lower())}
    kw = [t for t in toks if t not in ent_tokens]
    syn = [s for t in toks for s in SYN.get(t, [])]
    hits = []
    for x in case["evidence"]:
        tx = x["text"].lower()
        if thr is not None:
            if x.get("amount", 0) > thr:
                hits.append((1 + x["amount"] / 1e7, x))
            continue
        s = sum(t in tx for t in kw) * 1.5 + sum(t in tx for t in syn) * 0.4 + sum(e["id"] in x["entities"] for e in matched) * 2
        if s:
            hits.append((s + x["conf"] / 200 + (0.3 if x["importance"] == "High" else 0), x))
    if len(matched) >= 2:
        both = [h for h in hits if sum(e["id"] in h[1]["entities"] for e in matched) >= 2]
        hits = both or hits
    hits.sort(key=lambda h: -h[0])
    return {"hits": [h[1] for h in hits[:k]], "matched": matched, "threshold": thr, "candidates": len(hits)}


def answer(case: dict, question: str) -> dict:
    """Return a structured, citation-bearing answer, or an explicit insufficient-evidence reply."""
    docs = {d["id"]: d for d in case["docs"]}
    r = retrieve(case, question)
    if not r["hits"]:
        return {"status": "insufficient", "lead": "I couldn't find sufficient evidence in the uploaded documents.", "citations": [], "note": "Try naming a person, organization or amount."}
    hits = r["hits"]
    ids = [h["id"] for h in hits]
    n_docs = len({h["doc"] for h in hits})
    lead = f"I found {len(hits)} relevant evidence item{'s' if len(hits) > 1 else ''} across {n_docs} document{'s' if n_docs > 1 else ''}."
    note = "These passages are listed as found. No contradiction was detected among them."
    for c in case["contradictions"]:
        b = [i for i in c["b"] if i in ids]
        a = [i for i in c["a"] if i in ids]
        if len(a) + len(b) >= 2 and b and a:
            note = (f"{NUM[min(len(b), 10)].capitalize()} source{'s' if len(b) > 1 else ''} indicate the activity, while {NUM[min(len(a), 10)]} "
                    f"statement{'s' if len(a) > 1 else ''} conflict{'' if len(a) > 1 else 's'} with it. This creates a potential contradiction ({c['id']}) requiring verification.")
            break
    cites = [{"evidence_id": h["id"], "document": docs[h["doc"]]["name"], "page": h["page"], "section": h["section"], "text": h["text"]} for h in hits]
    return {"status": "ok", "lead": lead, "citations": cites, "note": note}
