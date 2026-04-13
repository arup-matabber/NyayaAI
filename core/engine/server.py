"""
Nyaya AI Engine Server — Direct Frontend Connection
No middleware. The engine IS the server.
Run: python -m core.engine.server
"""
import sys
import os

# Fix Windows terminal encoding FIRST before any prints
if sys.platform == "win32":
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")

import json
import asyncio
import shutil
import traceback

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, FileResponse
from pydantic import BaseModel
from typing import Optional
from contextlib import asynccontextmanager
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, PROJECT_ROOT)

from core.engine.db.database import Base, engine as db_engine, SessionLocal
from core.engine.db.models import Case, User
from core.engine.agents.orchestrator import PipelineOrchestrator
from core.engine.agents.router import LegalRouter
from core.engine.agents.flaw_detector import FlawDetector
from core.engine.ocr_pipeline import LayoutAwareOCR
from core.engine.memory_retrieval import MemoryManager

# ─── App Global State ─────────────────────────────────────────────
model_manager = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global model_manager
    from core.engine.tiers.model_manager import TieredModelManager
    
    # Configure the models to match the user's machine
    config = {
        "llama_server_bin": os.path.join(PROJECT_ROOT, "core", "BitNet", "build", "bin", "llama-server"),
        "models": {
            "fast": {"path": os.path.join(PROJECT_ROOT, "core", "models", "fast", "model.gguf")},
            "balanced": {"path": os.path.join(PROJECT_ROOT, "core", "models", "balanced", "model.gguf")},
            "deep": {"path": os.path.join(PROJECT_ROOT, "core", "models", "deep", "model.gguf")}
        }
    }
    try:
        model_manager = TieredModelManager(config)
        # Run startup in the background so we don't block API boot while llama-server loads
        asyncio.create_task(model_manager.startup())
    except Exception as e:
        print(f"[!] Warning: Failed to boot TieredModelManager: {e}", file=sys.stderr)
    
    yield
    
    # Kill the llama-server subprocesses on exit
    if model_manager:
        await model_manager.shutdown()

# ─── App ──────────────────────────────────────────────────────────
app = FastAPI(title="Nyaya AI Engine", version="3.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=db_engine)

# ─── Shared engine instances ──────────────────────────────────────
router_engine = LegalRouter()
flaw_engine = FlawDetector()
ocr_engine = LayoutAwareOCR(use_marker=True)

# ─── Pydantic models ─────────────────────────────────────────────
class ChatRequest(BaseModel):
    prompt: str
    case_id: Optional[int] = None

class AnalyzeRequest(BaseModel):
    text: str
    context: Optional[str] = ""

class RouteRequest(BaseModel):
    prompt: str

# ─── Health ───────────────────────────────────────────────────────
@app.get("/")
def health():
    return {"status": "Nyaya AI Engine Running", "version": "3.0.0"}

# ─── Cases ────────────────────────────────────────────────────────
@app.get("/api/cases")
def list_cases():
    db = SessionLocal()
    try:
        cases = db.query(Case).order_by(Case.updated_at.desc()).all()
        return {"cases": [{"id": c.id, "title": c.title, "modified": c.updated_at.strftime("%b %d")} for c in cases]}
    finally:
        db.close()

# ─── Upload (OCR) ────────────────────────────────────────────────
UPLOAD_DIR = os.path.join(PROJECT_ROOT, "data", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/api/upload")
async def upload_document(file: UploadFile = File(...)):
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    loop = asyncio.get_running_loop()
    result = await loop.run_in_executor(None, ocr_engine.process_pdf, file_path)
    return result

# ─── Route (classify + complexity + BNS mappings) ────────────────
@app.post("/api/route")
def route_prompt(req: RouteRequest):
    return router_engine.route_request(req.prompt)

# ─── Analyze (flaw detection) ────────────────────────────────────
@app.post("/api/analyze")
def analyze_flaws(req: AnalyzeRequest):
    result_json = flaw_engine.analyze_document(req.text, req.context or "")
    return json.loads(result_json)

# ─── Chat / Stream ────────────────────────────────────────────────
@app.post("/api/chat/stream")
async def stream_generation(req: ChatRequest):
    print(f"\n[ENGINE] >>> prompt: {req.prompt[:80]}", flush=True)

    async def event_generator():
        # ── 1. Resolve / create case ────────────────────────────
        try:
            db = SessionLocal()
            case_id = req.case_id
            if not case_id:
                user = db.query(User).filter_by(id=1).first()
                if not user:
                    user = User(id=1, email="engine@nyaya.ai", role="lawyer")
                    db.add(user)
                    db.commit()
                title = (req.prompt[:40] + "...") if len(req.prompt) > 40 else req.prompt
                case = Case(title=title, user_id=1)
                db.add(case)
                db.commit()
                db.refresh(case)
                case_id = case.id
            db.close()
        except Exception as e:
            print(f"[ENGINE] DB error: {e}", flush=True)
            yield f"data: {json.dumps({'type': 'error', 'content': f'DB error: {e}'})}\n\n"
            return

        yield f"data: {json.dumps({'type': 'init', 'case_id': case_id})}\n\n"
        print(f"[ENGINE] case_id={case_id}", flush=True)

        # ── 2. Set up asyncio.Queue bridged from thread ──────────
        #   call_soon_threadsafe() is the ONLY safe way to push
        #   data from a background thread into the async event loop.
        loop = asyncio.get_running_loop()
        aio_queue: asyncio.Queue = asyncio.Queue()

        def stream_callback(chunk: str):
            """Called by the orchestrator thread. Pushes to async queue safely."""
            loop.call_soon_threadsafe(aio_queue.put_nowait, chunk)

        # ── 3. Run orchestrator in thread ────────────────────────
        result_container = {}
        error_container = {}

        def run_pipeline():
            try:
                print("[ENGINE] Orchestrator starting...", flush=True)
                try:
                    mm = MemoryManager()
                    mm.append_interaction(case_id, req.prompt)
                except Exception:
                    pass  # Memory errors are non-fatal

                orch = PipelineOrchestrator()
                result = orch.process_request(
                    req.prompt, case_id,
                    stream_callback=stream_callback
                )
                result_container["data"] = result
                print(f"[ENGINE] Done. pdf={result.get('pdf_path', 'none')}", flush=True)
            except Exception as exc:
                tb = traceback.format_exc()
                error_container["error"] = str(exc)
                error_container["tb"] = tb
                print(f"[ENGINE] CRASH: {exc}\n{tb}", flush=True)
            finally:
                # Always signal done, even on crash
                loop.call_soon_threadsafe(aio_queue.put_nowait, None)

        future = loop.run_in_executor(None, run_pipeline)

        # ── 4. Stream tokens from asyncio.Queue ──────────────────
        total_chars = 0
        while True:
            try:
                # Wait up to 60s for next token
                item = await asyncio.wait_for(aio_queue.get(), timeout=60.0)
            except asyncio.TimeoutError:
                print("[ENGINE] Queue timeout — aborting stream", flush=True)
                break

            if item is None:
                break  # Sentinel — orchestrator finished

            total_chars += len(item)
            yield f"data: {json.dumps({'type': 'token', 'content': item})}\n\n"

        await future  # Ensure thread is done
        print(f"[ENGINE] Streamed {total_chars} chars", flush=True)

        # ── 5. Handle crash ───────────────────────────────────────
        if error_container:
            yield f"data: {json.dumps({'type': 'error', 'content': error_container['error']})}\n\n"
            return

        # ── 6. Send metadata ──────────────────────────────────────
        result = result_container.get("data") or {}
        metadata = {
            "pdf_path": result.get("pdf_path", ""),
            "doc_type": result.get("doc_type", ""),
            "flaws": result.get("flaws", []),
            "route_info": result.get("route_info", {}),
            "complexity": result.get("complexity", 0),
        }
        yield f"data: {json.dumps({'type': 'metadata', 'content': metadata})}\n\n"
        yield f"data: {json.dumps({'type': 'done'})}\n\n"
        print("[ENGINE] <<< Response complete", flush=True)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive", "X-Accel-Buffering": "no"},
    )

# ─── PDF download ─────────────────────────────────────────────────
@app.get("/api/documents/{filename}")
async def download_pdf(filename: str):
    pdf_dir = os.path.join(PROJECT_ROOT, "core", "output")
    pdf_path = os.path.join(pdf_dir, filename)
    if os.path.exists(pdf_path):
        return FileResponse(
            pdf_path,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"inline; filename={filename}",
                "Access-Control-Allow-Origin": "*",
            }
        )
    return {"error": "PDF not found"}

# ─── Entry point ──────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    # Set UTF-8 for Windows terminals
    if sys.platform == "win32":
        import io
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")
    print("\n===========================================")
    print("   Nyaya AI Engine Server v3.0")
    print("   Direct Frontend Connection Active")
    print("===========================================\n")
    uvicorn.run(app, host="0.0.0.0", port=8000)
