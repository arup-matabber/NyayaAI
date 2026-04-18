import sys
import os
import time
import random
from datetime import datetime

# Setup paths
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

import fitz
from core.engine.db.database import SessionLocal, engine, Base
from core.engine.db.models import User, Case, PDFArtifact
from core.engine.agents.orchestrator import PipelineOrchestrator

def clear_screen():
    os.system('cls' if os.name == 'nt' else 'clear')

def status_log(msg, level="INFO"):
    colors = {"INFO": "\033[94m", "SUCCESS": "\033[92m", "HEAVY": "\033[95m"}
    reset = "\033[0m"
    timestamp = datetime.now().strftime("%H:%M:%S")
    print(f"{colors.get(level, '')}[{timestamp}] [{level}] {msg}{reset}")

def generate_massive_dummy_pdf(output_path: str):
    doc = fitz.open()
    for i in range(10):
        page = doc.new_page()
        page.insert_textbox(fitz.Rect(50, 50, 550, 800), "HEAVY LEGALESE...\n" * 50, fontsize=10)
    doc.save(output_path)
    doc.close()

def run_heavy_integration():
    clear_screen()
    print("\n\033[96m=================================================================\033[0m")
    print("\033[1m     NYAYA AI v1.0: 4-BRANCH ORCHESTRATOR PIPELINE VERIFICATION   \033[0m")
    print("\033[96m=================================================================\033[0m\n")
    
    pdf_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data", "Integration_Evidence.pdf"))
    if not os.path.exists(os.path.dirname(pdf_path)): os.makedirs(os.path.dirname(pdf_path))
    generate_massive_dummy_pdf(pdf_path)

    Base.metadata.create_all(bind=engine)
    
    orchestrator = PipelineOrchestrator()
    sample_prompt = "Draft a bail application for Cheating under IPC 420 based on the attached evidence."
    
    status_log("Feeding heavy request into Orchestrator Control Node...", "HEAVY")
    
    result = orchestrator.process_request(sample_prompt, file_attachment=pdf_path)
    
    print("\n\033[92m~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\033[0m")
    print(f"\033[1m  PIPELINE MEGA-TEST COMPLETE. RESULT A4 PDF: {result.get('pdf_path', 'NONE')} \033[0m")
    print("\033[92m~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\033[0m\n")

if __name__ == "__main__":
    run_heavy_integration()
