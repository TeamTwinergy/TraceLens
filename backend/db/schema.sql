-- TraceLens PostgreSQL schema (Supabase compatible). Each investigation is an isolated evidence universe.
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE users (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), email text UNIQUE NOT NULL, created_at timestamptz DEFAULT now());
CREATE TABLE investigations (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), owner_id uuid REFERENCES users ON DELETE CASCADE, title text NOT NULL, synthetic boolean DEFAULT false, created_at timestamptz DEFAULT now());
CREATE TABLE documents (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), investigation_id uuid NOT NULL REFERENCES investigations ON DELETE CASCADE, filename text NOT NULL, mime text, size_bytes bigint, status text DEFAULT 'uploaded', created_at timestamptz DEFAULT now());
CREATE TABLE document_pages (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), document_id uuid NOT NULL REFERENCES documents ON DELETE CASCADE, page_no int NOT NULL, text text, ocr boolean DEFAULT false, UNIQUE (document_id, page_no));
CREATE TABLE chunks (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), investigation_id uuid NOT NULL REFERENCES investigations ON DELETE CASCADE, document_id uuid NOT NULL REFERENCES documents ON DELETE CASCADE, page_no int, section text, text text NOT NULL, embedding vector(1536));
CREATE INDEX chunks_embedding_idx ON chunks USING hnsw (embedding vector_cosine_ops);
CREATE INDEX chunks_fts_idx ON chunks USING gin (to_tsvector('english', text));
CREATE TABLE entities (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), investigation_id uuid NOT NULL REFERENCES investigations ON DELETE CASCADE, name text NOT NULL, type text NOT NULL, aliases text[] DEFAULT '{}', confidence real);
CREATE TABLE evidence (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), investigation_id uuid NOT NULL REFERENCES investigations ON DELETE CASCADE, chunk_id uuid REFERENCES chunks, document_id uuid REFERENCES documents, page_no int, section text, evidence_type text, text text NOT NULL, confidence real, importance text, tags text[] DEFAULT '{}', review_status text, review_note text);
CREATE TABLE entity_mentions (entity_id uuid REFERENCES entities ON DELETE CASCADE, evidence_id uuid REFERENCES evidence ON DELETE CASCADE, PRIMARY KEY (entity_id, evidence_id));
CREATE TABLE relationships (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), investigation_id uuid NOT NULL REFERENCES investigations ON DELETE CASCADE, source_entity uuid REFERENCES entities, target_entity uuid REFERENCES entities, relationship_type text, evidence_ids uuid[], confidence real, manual boolean DEFAULT false);
CREATE TABLE events (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), investigation_id uuid NOT NULL REFERENCES investigations ON DELETE CASCADE, event_date date, description text, entity_ids uuid[], evidence_ids uuid[], confidence real);
CREATE TABLE claims (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), investigation_id uuid NOT NULL REFERENCES investigations ON DELETE CASCADE, evidence_id uuid REFERENCES evidence, claim_text text, polarity text);
CREATE TABLE contradictions (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), investigation_id uuid NOT NULL REFERENCES investigations ON DELETE CASCADE, claim_a uuid REFERENCES claims, claim_b uuid REFERENCES claims, evidence_a uuid[], evidence_b uuid[], contradiction_type text, severity text, confidence real, resolved boolean DEFAULT false, note text);
CREATE TABLE anomalies (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), investigation_id uuid NOT NULL REFERENCES investigations ON DELETE CASCADE, title text, detail jsonb, evidence_ids uuid[], confidence real);
CREATE TABLE chat_sessions (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), investigation_id uuid NOT NULL REFERENCES investigations ON DELETE CASCADE, created_at timestamptz DEFAULT now());
CREATE TABLE chat_messages (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), session_id uuid NOT NULL REFERENCES chat_sessions ON DELETE CASCADE, role text, content jsonb, created_at timestamptz DEFAULT now());
CREATE TABLE reports (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), investigation_id uuid NOT NULL REFERENCES investigations ON DELETE CASCADE, body jsonb, created_at timestamptz DEFAULT now());
-- Isolation: enable row level security and scope every table by investigations.owner_id in production.
