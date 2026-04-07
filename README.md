# Nyaya AI — Indian Legal Intelligence Platform

> **Self-hosted, privacy-first AI for Indian court document drafting.**  
> Runs entirely on your machine. No cloud. No data leaves your system.

---

## What It Does

Nyaya AI is a local legal drafting engine that:

- **Drafts court-ready documents** — Bail applications, criminal complaints, civil suits, and more — properly formatted for Indian courts
- **Follows modern Indian law** — Fully updated for BNS (Bharatiya Nyaya Sanhita), BNSS, and BSA. Automatically maps deprecated IPC sections to their new BNS equivalents
- **OCR ingestion** — Upload scanned PDFs; the engine extracts text via PyMuPDF with Tesseract fallback
- **Flaw detection** — Identifies procedural defects, missing prayers, incorrect statute citations
- **Runs locally** — Engine server + React frontend, no external API calls

---

## Architecture

```
┌─────────────────────────────┐
│   React Frontend  :5173     │
│   (Vite + TailwindCSS)      │
└────────────┬────────────────┘
             │ HTTP / SSE
┌────────────▼────────────────┐
│   Engine Server  :8000      │  ◄── python -m core.engine.server
│   (FastAPI, self-contained) │
├─────────────────────────────┤
│  • PipelineOrchestrator     │
│  • LegalRouter (BNS maps)   │
│  • FlawDetector             │
│  • LayoutAwareOCR           │
│  • PDFWriter (ReportLab)    │
│  • SQLite (case memory)     │
└────────────┬────────────────┘
             │ (optional)
┌────────────▼────────────────┐
│  llama-server  :8088        │
│  (llama.cpp, local LLM)     │
└─────────────────────────────┘
```

---

## Requirements

| Requirement | Version | Notes |
|---|---|---|
| Python | 3.10+ | |
| Node.js | 18+ | For the frontend |
| Tesseract OCR | Any | Optional; needed for scanned PDFs |
| GPU / RAM | 4GB VRAM or 8GB RAM | Optional; only for local LLM |

---

## Quick Setup

### 1. Clone the repo

```bash
git clone https://github.com/your-username/nyaya-ai.git
cd nyaya-ai
```

### 2. Run the setup script

```bash
chmod +x setup.sh
./setup.sh
```

This will:
- Create a Python virtual environment at `core/nyaya-env/`
- Install all Python dependencies from `core/requirements.txt`
- Install FastAPI, Uvicorn, SQLAlchemy
- Create required directories (`data/uploads/`, `core/output/`, etc.)
- Initialize the SQLite database
- Install all Node.js frontend dependencies via `npm install`

---

## Manual Setup (Step by Step)

### Python Environment

```bash
python3 -m venv core/nyaya-env
source core/nyaya-env/bin/activate          # Linux/macOS
# core\nyaya-env\Scripts\activate           # Windows

pip install fastapi uvicorn[standard] python-multipart sqlalchemy
pip install -r core/requirements.txt
```

### Required Directories

```bash
mkdir -p data/uploads core/output core/models core/data
```

### Frontend

```bash
cd client
npm install
cd ..
```

---

## Running the App

**Terminal 1 — Engine Server:**
```bash
source core/nyaya-env/bin/activate
python -m core.engine.server
```

**Terminal 2 — Frontend:**
```bash
cd client
npm run dev
```

**Open in browser:** `http://localhost:5173`

---

## Local LLM (Optional but Recommended)

Without a local LLM, the engine uses a structured simulation fallback that still produces valid court documents. For full AI-quality generation:

### Install llama.cpp

```bash
git clone https://github.com/ggerganov/llama.cpp
cd llama.cpp
make -j4          # CPU build
# or: make LLAMA_CUBLAS=1 -j4   # CUDA/GPU build
```

### Download a model (4GB VRAM)

```bash
# Mistral 7B Q4 — recommended balance of quality/speed
wget "https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.2-GGUF/resolve/main/mistral-7b-instruct-v0.2.Q4_K_M.gguf" \
     -O core/models/model.gguf
```

### Start the LLM server

```bash
# GPU (35 layers offloaded):
./llama.cpp/llama-server -m core/models/model.gguf -ngl 35 --port 8088

# CPU only:
./llama.cpp/llama-server -m core/models/model.gguf --port 8088
```

The Nyaya engine auto-detects the LLM at `localhost:8088` and upgrades automatically.

---

## API Endpoints

The engine exposes these endpoints directly (no separate backend needed):

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/chat/stream` | SSE-streamed legal document generation |
| `POST` | `/api/upload` | PDF upload with OCR text extraction |
| `POST` | `/api/route` | Classify prompt → task type + BNS mappings |
| `POST` | `/api/analyze` | Flaw detection on existing document text |
| `GET` | `/api/cases` | List all saved cases |
| `GET` | `/api/documents/{filename}` | Download/preview a generated PDF |

---

## Project Structure

```
nyaya-ai/
├── core/
│   ├── engine/
│   │   ├── server.py          # FastAPI engine server (entry point)
│   │   ├── agents/
│   │   │   ├── orchestrator.py    # Main pipeline
│   │   │   ├── router.py          # BNS/IPC legal routing
│   │   │   ├── flaw_detector.py   # Procedural flaw checks
│   │   │   ├── legal_drafter.py   # Document construction
│   │   │   └── pdf_writer.py      # ReportLab PDF generation
│   │   ├── ocr_pipeline.py    # PyMuPDF + Tesseract OCR
│   │   ├── memory_retrieval.py # SQL-based case memory
│   │   └── db/                # SQLAlchemy models
│   ├── models/                # (gitignored) GGUF model files
│   ├── output/                # (gitignored) Generated PDFs
│   └── requirements.txt
├── client/                    # React/Vite frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Landing.jsx        # Home page
│   │   │   └── DraftingWorkspace.jsx  # Main chat + PDF preview
│   │   ├── components/
│   │   └── services/api.js    # Engine API client
│   └── package.json
├── backend/                   # (Legacy — superseded by core/engine/server.py)
├── setup.sh                   # Full setup automation
└── .gitignore
```

---

## Confidentiality

All processing happens locally on your machine:
- No prompts, case facts, or documents are sent to any external server
- Generated PDFs are stored in `core/output/` (gitignored)
- The SQLite database is stored in `core/data/` (gitignored)

---

## Legal Notice

This tool is designed to assist legal professionals. All generated documents should be reviewed by a qualified Indian advocate before filing. The engine does not provide legal advice.