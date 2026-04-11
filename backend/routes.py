import json
import asyncio
import os
import sys
import threading
import queue
from fastapi import APIRouter, UploadFile, File
from fastapi.responses import StreamingResponse, FileResponse
from pydantic import BaseModel
from typing import Optional
import shutil

from core.engine.agents.orchestrator import PipelineOrchestrator
from core.engine.memory_retrieval import MemoryManager
from core.engine.db.database import SessionLocal
from core.engine.db.models import Case, User, Document
from core.engine.ocr_pipeline import LayoutAwareOCR

router = APIRouter()

class ThreadSafeStdout:
    def __init__(self, original_stdout):
        self.original_stdout = original_stdout
        self.local = threading.local()

    def set_queue(self, q):
        self.local.q = q

    def clear_queue(self):
        if hasattr(self.local, 'q'):
            del self.local.q

    def write(self, message):
        self.original_stdout.write(message)
        if hasattr(self.local, 'q') and self.local.q is not None:
            # Strip ANSI escape codes to ensure clean trigger matching
            import re
            clean_msg = re.sub(r'\x1b\[[0-9;]*m', '', message)
            
            # Filter internal orchestrator logs to keep UI clean
            drop_triggers = ["[ORCHESTRATOR]", "Task Classification:", "[WARN]", "[+]", "Running Algorithmic", "->", "FALLBACK"]
            if any(t in clean_msg for t in drop_triggers):
                self.local.skip_newline = True
                return
            if getattr(self.local, 'skip_newline', False) and message.strip() == "":
                self.local.skip_newline = False
                return
            
            self.local.skip_newline = False
            self.local.q.put(message)

    def flush(self):
        self.original_stdout.flush()

    def isatty(self):
        if hasattr(self.original_stdout, "isatty"):
            return self.original_stdout.isatty()
        return False

if not isinstance(sys.stdout, ThreadSafeStdout):
    sys.stdout = ThreadSafeStdout(sys.stdout)

class GenerationRequest(BaseModel):
    case_id: Optional[int] = None
    prompt: str

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "uploads")
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    ocr = LayoutAwareOCR(use_marker=True)
    result = await asyncio.get_event_loop().run_in_executor(None, ocr.process_pdf, file_path)
    
    return result

@router.get("/cases")
def list_cases():
    db = SessionLocal()
    try:
        cases = db.query(Case).order_by(Case.updated_at.desc()).all()
        return {"cases": [{"id": c.id, "title": c.title, "modified": c.updated_at.strftime("%b %d")} for c in cases]}
    finally:
        db.close()

@router.post("/chat/stream")
async def stream_generation(req: GenerationRequest):
    async def event_generator():
        try:
            db = SessionLocal()
            case_id = req.case_id
            if not case_id:
                user = db.query(User).filter_by(id=1).first()
                if not user:
                    user = User(id=1, email="interactive@nyaya.ai", role="lawyer")
                    db.add(user)
                    db.commit()
                title = req.prompt[:30] + "..." if len(req.prompt) > 30 else req.prompt
                case = Case(title=title, user_id=1)
                db.add(case)
                db.commit()
                db.refresh(case)
                case_id = case.id
            db.close()

            yield f"data: {json.dumps({'type': 'init', 'case_id': case_id})}\n\n"
            await asyncio.sleep(0.01)

            orchestrator = PipelineOrchestrator()
            mm = MemoryManager()
            mm.append_interaction(case_id, req.prompt)

            q = queue.Queue()
            
            def run_orchestrator():
                try:
                    sys.stdout.set_queue(q)
                    return orchestrator.process_request(req.prompt, case_id)
                finally:
                    sys.stdout.clear_queue()
                    q.put(None) # Sentinel to close the stream

            loop = asyncio.get_event_loop()
            task = loop.run_in_executor(None, run_orchestrator)

            # Read from queue as it chunks
            while True:
                try:
                    chunk = await loop.run_in_executor(None, q.get, True, 0.1)
                    if chunk is None:
                        break
                    
                    # Drain the queue to batch tokens and prevent UI freezes
                    while not q.empty():
                        try:
                            next_chunk = q.get_nowait()
                            if next_chunk is None:
                                q.put(None)
                                break
                            chunk += next_chunk
                        except queue.Empty:
                            break

                    if chunk:
                        yield f"data: {json.dumps({'type': 'token', 'content': chunk})}\n\n"
                except queue.Empty:
                    if task.done():
                        break

            result = await task
            
            yield f"data: {json.dumps({'type': 'metadata', 'content': {'pdf_path': result.get('pdf_path', ''), 'doc_type': result.get('doc_type', ''), 'flaws': result.get('flaws', []), 'route_info': result.get('route_info', {})}})}\n\n"
            yield f"data: {json.dumps({'type': 'done'})}\n\n"

        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'content': str(e)})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive"},
    )

@router.get("/documents/{filename}")
async def download_pdf(filename: str):
    pdf_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "core", "output")
    pdf_path = os.path.join(pdf_dir, filename)
    if os.path.exists(pdf_path):
        return FileResponse(pdf_path, media_type="application/pdf", filename=filename)
    return {"error": "PDF not found"}
