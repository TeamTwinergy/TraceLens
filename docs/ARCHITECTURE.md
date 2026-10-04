# TraceLens architecture

## Pipeline
Documents → ingestion → text extraction (OCR if needed) → chunking → entities → events → claims → relationships → embeddings → hybrid retrieval → cross-document reasoning → contradiction, anomaly and gap detection → evidence graph → investigator → report.

Every stage emits structured records (entity, evidence, relationship, event, contradiction, anomaly, gap) that carry evidence IDs. A conclusion is never stored without them, which is what makes the chain Finding → Claim → Evidence → Source → Location possible.

## What runs where today
| Layer | Status in this repository |
|---|---|
| Frontend (static, no build) | Complete. Landing, dashboard, viewer, evidence, entities, graph, timeline, contradictions, anomalies, gaps, investigator, report, presentation mode, light and dark themes. |
| Local analyzer (`frontend/src/analyze.js`) | Real, rule-based. Entities by pattern, evidence by passage, co-mention relationships, dated events, IQR amount outliers, duplicate passages, negation-based contradiction flags, referenced-but-missing documents. |
| Demo investigation (`frontend/src/data.js`, `demo_data/orion_case.json`) | Precomputed synthetic case with the same schema as the analyzer output. |
| Backend (`backend/app`) | Upload validation, PDF/DOCX/OCR extraction, hybrid retrieval with citations, demo-case API. Unit-tested modules; HTTP layer is thin. |
| LLM reasoning, embeddings, pgvector, auth | Designed (see `backend/db/schema.sql`) but not wired. Extension points below. |

## Extension points
1. **Claims and contradictions with an LLM**: replace `analyze()` output for contradictions with a pass that extracts claims per evidence item, pairs claims about the same entities, and asks the model to classify the pair. Keep the output schema; require evidence IDs in the response and drop any item that cites an unknown ID.
2. **Embeddings**: add a vector score to `retrieval.retrieve` (cosine similarity from `chunks.embedding`) and blend it with the keyword and entity scores.
3. **Answer composition**: pass only the retrieved passages to the model, require citation IDs per sentence, and fall back to the insufficient-evidence reply when none are returned.
4. **Persistence and isolation**: store records using `backend/db/schema.sql` and scope every query by `investigation_id` and owner.

## Confidence
Estimates combine number of independent documents, agreement between sources and extraction confidence, and are shown with a one-line reason. They are not statistical certainty.

## Language policy
Findings are "potential contradiction", "possible anomaly", "requires human verification". TraceLens makes no legal or criminal judgment.
