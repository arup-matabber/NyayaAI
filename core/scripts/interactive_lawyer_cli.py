#!/usr/bin/env python3
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from core.engine.db.database import SessionLocal, engine, Base
from core.engine.db.models import User, Case, CaseLog
from core.engine.agents.orchestrator import PipelineOrchestrator
from core.engine.memory_retrieval import MemoryManager

def clear_screen():
    os.system('cls' if os.name == 'nt' else 'clear')

BANNER = """\033[96m
    _   __                           ___    ____
   / | / /_  ______ ___  ______     /   |  /  _/
  /  |/ / / / / __ `/ / / / __ \   / /| |  / /  
 / /|  / /_/ / /_/ / /_/ / /_/ /  / ___ |_/ /   
/_/ |_/\\__, /\\__,_/\\__, /\\__,_/  /_/  |_/___/   
      /____/      /____/                        
\033[0m\033[1;95m   ▶ THE HARDWARE-OPTIMIZED LEGAL ENGINE ◀\033[0m
"""

def main_loop():
    clear_screen()
    print(BANNER)
    print("\033[90m================================================================================\033[0m")
    print("                      \033[1;36mINTERACTIVE TERMINAL SANDBOX\033[0m                     ")
    print("\033[90m================================================================================\033[0m\n")
    
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    mm = MemoryManager()
    orchestrator = PipelineOrchestrator()
    
    # 1. Login / Case Context
    lawyer = db.query(User).filter_by(email="interactive@nyaya.ai").first()
    if not lawyer:
        lawyer = User(email="interactive@nyaya.ai", role="lawyer")
        db.add(lawyer)
        db.commit()
        
    print(f"\033[32m[SYSTEM] Evaluator Node Activated: {lawyer.email}\033[0m")
    case_name = input("\033[1;33m[?] Enter a Case Title (e.g. 'State vs Malhotra'): \033[0m")
    
    case = db.query(Case).filter_by(title=case_name).first()
    if not case:
        case = Case(title=case_name, user_id=lawyer.id)
        db.add(case)
        db.commit()
        print(f"\033[92m[+] New Case Created -> ID: {case.id}\033[0m")
    else:
        print(f"\033[92m[+] Existing Case Mounted -> ID: {case.id}\033[0m")
        memory = mm.retrieve_long_term_memory(case.id)
        print(f"\n\033[93m--- LONG TERM MEMORY RESTORED [{len(memory)} bytes mapped] ---\033[0m")
        if len(memory) > 0:
            print("Previous Prompts Logged in DB:")
            print("\033[3m" + memory[:500] + "...\033[0m\n")

    print("\n\033[96mYou are now inside the Live Nyaya Terminal. Type 'exit' to cleanly close DB.\033[0m")
    print("\033[36mTry: 'Write a Bail Application for John accused of IPC 302'\033[0m\n")

    while True:
        try:
            print("\n\033[1;32m" + "-"*60 + "\033[0m")
            print("\033[1;36mLawyer Prompt (Paste your text. Type 'SUBMIT' on a new line to run, or 'EXIT'):\033[0m")
            
            lines = []
            while True:
                line = input()
                if line.strip().upper() == 'SUBMIT':
                    break
                if line.strip().lower() in ['exit', 'quit']:
                    lines = ["EXIT"]
                    break
                lines.append(line)
                
            prompt = "\n".join(lines).strip()
            
            if prompt == 'EXIT':
                print("Closing Encrypted SQLite Connection. VRAM purged.")
                break
                
            if len(prompt) == 0:
                continue

            print("\n" + "-"*60)
            
            # Write to Memory DB explicitly
            mm.append_interaction(case.id, prompt)
            
            # Execute Pipeline
            result = orchestrator.process_request(prompt, case_id=case.id)
            
            print("\n\033[92m--- GENERATION RESULT ---\033[0m")
            if "pdf_path" in result:
                print(f"PDF Successfully Rendered to: \033[1;36m{result['pdf_path']}\033[0m")
                print("Open this file directly in your system to view the A4 Court geometry!\n")
            else:
                print(result.get("text", ""))
                
            print("-" * 60)

        except KeyboardInterrupt:
            print("\nClosing Data Layer...")
            break

    db.close()

if __name__ == "__main__":
    main_loop()
