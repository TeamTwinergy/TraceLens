# TraceLens

### Investigate documents. Follow the evidence.

<p align="center">
  <img src="frontend/assets/logo-full.png" alt="TraceLens Logo" width="360">
</p>

<p align="center">
  <strong>Turn documents into evidence. Turn evidence into insight.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/ALGOTHON'26-ALG--AI--02-7C3AED?style=for-the-badge" alt="ALGOTHON 26">
  <img src="https://img.shields.io/badge/AI-Document%20Investigation-8B5CF6?style=for-the-badge" alt="Document Investigation">
  <img src="https://img.shields.io/badge/Frontend-Vanilla%20JS-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript">
  <img src="https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI">
</p>

<p align="center">
  <a href="#-live-demo">Live Demo</a> •
  <a href="#-the-problem">Problem</a> •
  <a href="#-our-solution">Solution</a> •
  <a href="#-features">Features</a> •
  <a href="#-how-it-works">How It Works</a> •
  <a href="#-architecture">Architecture</a> •
  <a href="#-getting-started">Get Started</a> •
  <a href="#-deployment">Deployment</a>
</p>

---

## 🔴 Live Demo

### Frontend

**Live Application:**
https://tracelens-frontend-ten.vercel.app/

### Backend

**FastAPI Backend:**
https://tracelens-api-rfm0.onrender.com

### API Documentation

**Interactive API Docs:**
https://tracelens-api-rfm0.onrender.com/api/docs

### Health Check

**Backend Health:**
https://tracelens-api-rfm0.onrender.com/api/health

---

# 🔎 What is TraceLens?

**TraceLens is an evidence-driven document investigation platform that transforms scattered files into a connected, explorable investigation.**

When information is spread across contracts, emails, statements, invoices, financial records, and other documents, important connections can remain hidden.

TraceLens brings those pieces together through:

* Entity extraction and relationship mapping
* Interactive evidence graphs
* Contradiction and anomaly detection
* Chronological event reconstruction
* Evidence gap identification
* Source-linked investigator chat
* Explainable investigation reports
* Human-in-the-loop review

Instead of simply generating a summary, TraceLens helps investigators understand:

> **What was found, why it matters, and exactly where the supporting evidence exists.**

Every finding should lead back to evidence. Every conclusion remains open to human verification.

---

# 🎯 The Problem

## ALG-AI-02 — Intelligent Document Investigator

Investigating a large collection of documents is time-consuming and error-prone.

A relevant statement may be buried in one file, a related payment may appear in another, and a conflicting date may exist somewhere else.

Reading documents individually makes it difficult to identify the bigger picture.

Traditional document tools often focus on summarizing individual files, while investigations require connections across the entire collection.

### The challenge

* Important information is scattered across multiple documents.
* Relationships between people, organizations, dates, and amounts are difficult to discover.
* Contradictory statements can go unnoticed.
* Missing supporting records are difficult to identify.
* Findings are difficult to verify without source-level references.
* Large document collections become increasingly difficult to review manually.

### The real problem

**The challenge is not simply understanding documents. It is connecting evidence across them.**

---

# 💡 Our Solution

TraceLens treats a document collection as a connected evidence system rather than a collection of isolated files.

```text
Documents
    ↓
Evidence
    ↓
Entities
    ↓
Relationships
    ↓
Events
    ↓
Findings
    ↓
Investigation
```

The system extracts useful information, connects related evidence, identifies potential inconsistencies and gaps, and presents findings alongside their supporting sources.

## What makes TraceLens different?

| Traditional Document Tool     | TraceLens                         |
| ----------------------------- | --------------------------------- |
| Summarizes individual files   | Investigates document collections |
| Presents isolated information | Connects entities and evidence    |
| Answers questions             | Provides source-linked answers    |
| Hides relationships           | Visualizes an evidence graph      |
| Focuses on summaries          | Focuses on investigation          |
| Produces conclusions          | Supports human verification       |

TraceLens is designed as an **investigation companion**, not an autonomous judge.

---

# ✨ Features

## 01 — Interactive Evidence Graph

Explore relationships between people, organizations, documents, events, dates, and amounts through a visual graph.

* Drag, zoom, and pan
* Search nodes
* Filter by entity type
* Highlight relationships
* Follow connections
* Inspect supporting evidence

---

## 02 — Contradiction Detection

Identify potentially conflicting claims across documents.

Each finding can include:

* Related claims
* Source references
* Explanation of the potential conflict
* Severity
* Confidence information
* Suggested verification steps

TraceLens highlights potential conflicts without automatically deciding which source is correct.

---

## 03 — Evidence Gap Analyzer

Identify potentially missing supporting records referenced by available documents.

For example:

```text
Invoice
   ↓
Payment
   ↓
Delivery Confirmation
   ↓
❌ Not found in available documents
```

This helps investigators identify evidence that may require further collection.

---

## 04 — Investigation Timeline

Reconstruct a chronological view of dated events and examine how different records relate to one another.

The timeline can bring together:

* Documents
* Transactions
* Communications
* Events
* Dates
* Related entities

---

## 05 — Entity Intelligence

Explore consolidated information about important entities.

Entity profiles can include:

* Mention counts
* Related documents
* Connected entities
* Associated events
* Related amounts
* Evidence references

---

## 06 — Cited Investigator Chat

Ask questions about the available investigation evidence.

Example:

```text
What evidence connects Rajiv Mehta to Orion Systems?
```

TraceLens searches the available investigation data and provides an answer with relevant source references when evidence is available.

When sufficient evidence is unavailable, the system does not treat an unsupported conclusion as established fact.

---

## 07 — Human-in-the-Loop Review

Investigators remain in control of the final interpretation.

They can:

* Verify findings
* Dismiss irrelevant results
* Flag evidence
* Add notes
* Add tags
* Create manual entity links
* Review supporting passages
* Mark contradictions as resolved

---

## 08 — Investigation Reports

Generate and export investigation results in:

* HTML
* JSON
* CSV
* Print-ready PDF

Reports can contain findings, entities, relationships, timeline events, contradictions, evidence references, and investigation notes.

---

## 09 — Presentation Mode

A guided investigation experience makes it easier to demonstrate the complete workflow during presentations and reviews.

The investigation can be presented as:

```text
Case
 ↓
Documents
 ↓
Evidence
 ↓
Entities
 ↓
Relationships
 ↓
Findings
 ↓
Verification
```

---

## 10 — Synthetic Investigation

Explore **Orion Procurement Review**, a fictional investigation containing precomputed findings.

The synthetic case demonstrates the complete investigation experience without requiring real confidential documents.

---

# ⚙️ How It Works

TraceLens follows an evidence-first workflow that takes investigators from raw documents to connected findings.

```text
        📄 DOCUMENTS
             │
             ▼
     ┌─────────────────┐
     │ Upload & Import │
     └────────┬────────┘
              │
              ▼
     ┌─────────────────┐
     │ Text Extraction │
     └────────┬────────┘
              │
              ▼
     ┌─────────────────────┐
     │ Evidence & Entities │
     │    Identification   │
     └──────────┬──────────┘
                │
                ▼
       ┌────────────────┐
       │   Connections  │
       │   & Relations  │
       └───────┬────────┘
               │
       ┌───────┼────────┐
       ▼       ▼        ▼
    Timeline  Graph   Findings
       │       │        │
       └───────┼────────┘
               ▼
       ┌────────────────┐
       │ Investigation  │
       │    Workspace   │
       └───────┬────────┘
               │
        ┌──────┼───────┐
        ▼      ▼       ▼
      Chat   Review   Reports
```

### 1. Upload Documents

Investigators add the documents relevant to the case.

The document collection becomes the evidence base for the investigation.

### 2. Extract Content

TraceLens extracts usable text from supported documents, including PDF, DOCX, TXT, and CSV content. OCR can be used when configured for image-based documents.

### 3. Identify Evidence

The system identifies useful information such as:

* People
* Organizations
* Dates
* Amounts
* Claims
* Events
* Document references

### 4. Connect Related Information

Related entities and evidence are connected to form an investigation network.

For example:

```text
Rajiv Mehta
      │
      ├──── works with ────► Orion Systems
      │
      ├──── appears in ────► Contract.pdf
      │
      └──── involved in ───► Payment #1042
```

These connections form the foundation of the Evidence Graph.

### 5. Explore the Investigation

The connected evidence is presented through multiple investigation views:

* Evidence Graph
* Timeline
* Entity Intelligence
* Findings
* Evidence Gaps
* Investigator Chat

### 6. Investigate Across Documents

Investigators can follow relationships across the collection rather than manually opening every file.

```text
Person
  ↓
Organization
  ↓
Transaction
  ↓
Document
  ↓
Evidence
```

### 7. Ask Questions

Investigator Chat allows users to ask questions about the available evidence.

Answers are based on the investigation data and can include source references.

### 8. Verify Evidence

Important findings can be traced back to their supporting sources.

```text
Finding
   ↓
Claim
   ↓
Evidence Reference
   ↓
Source Document
   ↓
Supporting Passage
```

### 9. Review Findings

Investigators can add notes, tags, flags, manual links, and resolution status while reviewing findings.

### 10. Generate Reports

After reviewing the investigation, findings can be exported into structured reports.

The complete workflow is:

```text
UPLOAD
   ↓
EXTRACT
   ↓
IDENTIFY
   ↓
CONNECT
   ↓
EXPLORE
   ↓
INVESTIGATE
   ↓
VERIFY
   ↓
REVIEW
   ↓
REPORT
```

---

# 🖥️ Product Experience

TraceLens is organized around an investigation workspace rather than a conventional chatbot.

Core areas include:

* Landing page
* Investigation dashboard
* Document workspace
* Evidence graph
* Entity intelligence
* Contradiction analysis
* Investigation timeline
* Evidence gaps
* Investigator Chat
* Investigation reports
* Presentation mode

### Recommended Screenshots

* Landing page
* Investigation dashboard
* Document upload
* Evidence graph
* Entity details
* Contradiction findings
* Timeline
* Investigator Chat with citations
* Evidence gap analysis
* Generated report

---

# 🏗️ Architecture

```text
                         TRACELENS
                             |
              +--------------+--------------+
              |                             |
          FRONTEND                       BACKEND
           Vercel                         Render
              |                             |
       HTML / CSS / JS                  FastAPI
              |                             |
      +-------+-------+            +--------+--------+
      |       |       |            |        |        |
    Views   Graph   Chat       Upload   Extraction Retrieval
      |       |       |            |        |        |
      +-------+-------+            +--------+--------+
              |                             |
              |                       Extracted Text
              |                             |
              +-------------+---------------+
                            |
                   Structured Evidence
                            |
              +-------------+-------------+
              |             |             |
            Graph        Timeline      Findings
              |             |             |
              +-------------+-------------+
                            |
                       Human Review
                            |
                       Export Report
```

---

# 🧩 Frontend

The frontend is built using:

* HTML5
* CSS3
* Vanilla JavaScript
* JavaScript modules
* Custom SVG visualization
* Browser LocalStorage

The application is lightweight and does not require a frontend framework.

---

# ⚡ Backend

The backend is implemented using:

* Python
* FastAPI
* Uvicorn
* Pydantic
* Document extraction
* Retrieval functionality
* Authentication support

### Production Backend

```text
https://tracelens-api-rfm0.onrender.com
```

### API Documentation

```text
https://tracelens-api-rfm0.onrender.com/api/docs
```

---

# 🛠️ Tech Stack

| Category            | Technology              |
| ------------------- | ----------------------- |
| Frontend            | HTML5, CSS3, JavaScript |
| Visualization       | Custom SVG Graph        |
| Backend             | Python 3.12, FastAPI    |
| API Server          | Uvicorn                 |
| Validation          | Pydantic                |
| Document Processing | PyMuPDF, python-docx    |
| OCR                 | Optional pytesseract    |
| Authentication      | PBKDF2-SHA256, HMAC     |
| Local Persistence   | Browser LocalStorage    |
| Testing             | Python unittest         |
| Frontend Deployment | Vercel                  |
| Backend Deployment  | Render                  |
| Version Control     | Git & GitHub            |

---

# 📁 Project Structure

```text
TraceLens/
│
├── frontend/
│   ├── index.html
│   ├── config.js
│   ├── vercel.json
│   ├── assets/
│   │   └── logo-full.png
│   └── src/
│       ├── data.js
│       ├── analyze.js
│       ├── core.js
│       ├── views.js
│       ├── graph.js
│       ├── chat.js
│       └── main.js
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── validation.py
│   │   ├── extract.py
│   │   └── retrieval.py
│   │
│   ├── tests/
│   ├── db/
│   │   └── schema.sql
│   ├── requirements.txt
│   └── Dockerfile
│
├── demo_data/
│   └── orion_case.json
│
├── docs/
│   ├── ARCHITECTURE.md
│   └── DEMO_SCRIPT.md
│
├── .env.example
├── render.yaml
├── vercel.json
└── README.md
```

---

# 🚀 Getting Started

## Prerequisites

### Frontend

* Modern web browser
* Python 3 or another static file server

### Backend

* Python 3.10+
* Tesseract OCR for image-based OCR when required

---

## 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/TraceLens.git
cd TraceLens
```

---

## 2. Run the Frontend

```bash
cd frontend
python -m http.server 5173
```

Open:

```text
http://localhost:5173
```

---

## 3. Run the Backend

Open another terminal:

```bash
cd backend
python -m venv .venv
```

### Windows

```bash
.venv\Scripts\activate
```

### macOS / Linux

```bash
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start the API:

```bash
uvicorn app.main:app --reload --port 8000
```

The API will be available at:

```text
http://localhost:8000
```

API documentation:

```text
http://localhost:8000/api/docs
```

---

# 🔧 Frontend Configuration

Configure the backend URL in:

```text
frontend/config.js
```

For local development:

```javascript
window.TRACELENS_API_URL = "http://localhost:8000";
```

For production:

```javascript
window.TRACELENS_API_URL = "https://tracelens-api-rfm0.onrender.com";
```

---

# 🌐 Deployment

TraceLens uses:

* **Vercel** for the frontend
* **Render** for the FastAPI backend

## Frontend — Vercel

### Production URL

```text
https://tracelens-frontend-ten.vercel.app/
```

The frontend is deployed as a static web application.

### Deployment

1. Import the repository into Vercel.
2. Set the root directory to `frontend`.
3. Use the static/other framework preset.
4. Leave the build command empty when no build step is required.
5. Deploy.

---

# Backend — Render

### Production URL

```text
https://tracelens-api-rfm0.onrender.com
```

The backend runs as a FastAPI service.

## Production Endpoints

| Endpoint          | Purpose                       |
| ----------------- | ----------------------------- |
| `/`               | Backend root                  |
| `/api/health`     | Health check                  |
| `/api/docs`       | Interactive API documentation |
| `/api/auth/login` | Authentication login          |

### Root Endpoint

```text
https://tracelens-api-rfm0.onrender.com/
```

Expected response:

```json
{
  "detail": "Not Found"
}
```

This is normal because the backend does not serve a webpage at the root path.

### Health Endpoint

```text
https://tracelens-api-rfm0.onrender.com/api/health
```

Returns the backend health/status information.

### API Documentation

```text
https://tracelens-api-rfm0.onrender.com/api/docs
```

Provides an interactive list of the available FastAPI endpoints.

### Login Endpoint

```text
https://tracelens-api-rfm0.onrender.com/api/auth/login
```

Opening this URL directly in a browser returns:

```json
{
  "detail": "Method Not Allowed"
}
```

This is expected because the endpoint requires a form submission rather than a browser `GET` request.

---

# 🔗 Production Architecture

```text
                  USER
                    |
                    ▼
        ┌──────────────────────┐
        │      TraceLens       │
        │      Frontend        │
        │       Vercel         │
        └──────────┬───────────┘
                   |
                   | API Requests
                   ▼
        ┌──────────────────────┐
        │      TraceLens       │
        │       Backend        │
        │       FastAPI        │
        │       Render         │
        └──────────┬───────────┘
                   |
          ┌────────┼────────┐
          ▼        ▼        ▼
      Extraction Retrieval  Auth
```

---

# 🔐 Privacy & Security

TraceLens follows a privacy-conscious investigation workflow.

Key principles include:

* Local document analysis where supported
* Server-side secrets are not exposed to the frontend
* Authentication support through the backend
* Browser-based persistence for review notes
* Evidence references associated with investigation findings
* Synthetic data for the demonstration case

### Security Considerations

A production deployment handling sensitive investigations would require:

* Strong server-side authentication
* Proper authorization
* Persistent user isolation
* Encrypted storage
* Secure session management
* Audit logging
* Secure document storage
* Additional access-control policies

TraceLens is a hackathon/prototype investigation platform and should not be treated as a production forensic or legal system.

---

# 🧪 Testing

Backend tests cover:

* File validation
* Unsupported uploads
* Empty uploads
* Upload size restrictions
* TXT extraction
* CSV extraction
* DOCX extraction
* Corrupt DOCX handling
* Retrieval with citations
* Amount filtering
* Insufficient-evidence responses

### Run Tests

```bash
cd backend
python -m unittest discover -s tests -t .
```

### Recorded Development Result

```text
9 backend unit tests passed
```

Frontend logic was also checked using Node-based verification for page rendering, sample queries, and report exports.

The complete production workflow should still be manually verified after deployment.

---

# 📊 Evidence-First Design

TraceLens follows an evidence-first principle.

Rather than treating generated answers as authoritative, findings are connected to underlying evidence whenever possible.

```text
Finding
   ↓
Claim
   ↓
Evidence Reference
   ↓
Source Document
   ↓
Supporting Passage
```

The objective is not simply:

> **"Here is the answer."**

It is:

> **"Here is the finding, and here is the evidence supporting it."**

---

# 🧠 Explainability

TraceLens is designed around explainable investigation.

A finding can be examined through:

* What was detected
* Which entities are involved
* Which documents contain the relevant information
* Which claims are related
* Why the information may be important
* What should be verified next

This keeps the investigation experience focused on evidence rather than black-box conclusions.

---

# ⚠️ Limitations & Transparency

TraceLens currently uses deterministic and rule-based analysis in several parts of the system.

Current limitations include:

* Pattern-based entity extraction may miss or misclassify entities.
* Contradiction detection is heuristic.
* Findings require human verification.
* Some demonstration findings are precomputed.
* LLM reasoning is not connected to every investigation component.
* Embedding-based semantic retrieval is not used throughout the system.
* Investigation data and review notes may be stored locally in the browser.
* OCR processing requires the optional backend functionality.
* Graph performance is optimized for tens to low hundreds of nodes.
* The application is not an enterprise-grade legal or forensic platform.

TraceLens supports investigation and review.

It does **not** establish:

* Guilt
* Legal liability
* Criminal responsibility
* Factual certainty

Human investigators remain responsible for interpreting and verifying findings.

---

# 🔭 Future Roadmap

## AI & Retrieval

* LLM-assisted claim extraction
* Citation verification
* Semantic search
* Embedding-based retrieval
* Cross-document reasoning
* Evidence-aware AI agents

## Investigation

* Persistent investigations
* Advanced evidence versioning
* Stronger entity resolution
* More sophisticated contradiction analysis
* Advanced relationship inference

## Collaboration

* Multi-user investigations
* Shared workspaces
* Investigation audit trails
* Investigator roles and permissions

## Visualization

* Advanced graph layouts
* Larger graph support
* Relationship filtering
* Multi-hop evidence exploration
* Advanced timeline visualization

## Platform

* Automated browser testing
* Additional document formats
* Enterprise authentication
* Secure cloud document storage

---

# 🌍 Potential Impact

TraceLens can reduce the effort required to review large document collections and make important relationships easier to discover.

| Domain                  | Potential Use                              |
| ----------------------- | ------------------------------------------ |
| Auditing                | Trace transactions and supporting records  |
| Compliance              | Identify missing documentation             |
| Journalism              | Connect entities and events across sources |
| Legal Research          | Organize claims and supporting passages    |
| Business Operations     | Review contracts and procurement records   |
| Internal Investigations | Connect evidence across multiple records   |

The goal is not to replace human judgment.

The goal is to make evidence:

**Easier to discover.
Easier to connect.
Easier to verify.**

---

# 👥 Team

## Team Twinergy

| Member          | Contribution        |
| --------------- | ------------------- |
| Sreshtha Das    | Project development |
| Madhurita Ghosh | Project development |

---

# 🏆 Hackathon Context

**ALGOTHON'26**

### Problem Statement

**ALG-AI-02 — Intelligent Document Investigator**

TraceLens was developed to address the challenge of investigating information across multiple documents and connecting scattered evidence into a coherent investigation.

---

# 📜 Synthetic Dataset

The **Orion Procurement Review** investigation is fictional and synthetic.

No real-world confidential investigation data is used in the demonstration.

The synthetic dataset demonstrates:

* Document relationships
* Entity extraction
* Evidence connections
* Contradictions
* Timeline reconstruction
* Evidence gaps
* Investigator queries
* Source-linked findings

---

# 🤝 Acknowledgements

* Built for **ALGOTHON'26**
* Problem Statement: **ALG-AI-02 — Intelligent Document Investigator**
* AI-assisted development support was used during implementation.
* The final project was reviewed and developed by the team.
* The Orion Procurement Review dataset is fictional and synthetic.
* No external real-world investigation data is used in the demonstration.

---

# 🚀 Production Links

| Resource                  | Link                                               |
| ------------------------- | -------------------------------------------------- |
| 🌐 **TraceLens Frontend** | https://tracelens-frontend-ten.vercel.app/         |
| ⚡ **TraceLens Backend**   | https://tracelens-api-rfm0.onrender.com            |
| ❤️ **Backend Health**     | https://tracelens-api-rfm0.onrender.com/api/health |
| 📚 **API Documentation**  | https://tracelens-api-rfm0.onrender.com/api/docs   |

---

<p align="center">
  <strong>TraceLens</strong>
  <br>
  <em>Investigate documents. Follow the evidence.</em>
  <br><br>
  Made with purpose by Team Twinergy.
</p>
