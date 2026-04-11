import os
import time
import asyncio
from test_suite.test_config import RESULTS_DIR
from engine.agents.orchestrator import PipelineOrchestrator
from engine.main import load_config
from engine.tiers.model_manager import TieredModelManager

async def run_real_world_generation():
    print("Initializing Model Manager with installed local models...")
    config = load_config()
    manager = TieredModelManager(config)
    await manager.startup()

    orchestrator = PipelineOrchestrator()
    
    scenarios = [
        {
            "title": "BNS 103 Murder Bail",
            "prompt": "Draft a regular bail application before the High Court for my client Rahul. He is charged with murder under IPC 302 (which routing should fix to BNS 103). The client has no prior criminal record and is the primary breadwinner of his family."
        },
        {
            "title": "BNS 318 Cheating Complaint",
            "prompt": "File a criminal complaint before the local Magistrate for cheating and dishonesty under IPC 420. The accused sold my client fake land titles in Delhi."
        },
        {
            "title": "Civil Breach of Contract",
            "prompt": "Draft a civil suit for breach of contract. The defendant company failed to deliver 500 laptops after receiving advanced payment of 20 lakh rupees."
        }
    ]
    
    output_md = os.path.join(RESULTS_DIR, "generation_demo_run.md")
    
    md_content = f"# Real-World E2E Generation Demonstration\n\n"
    
    for i, scenario in enumerate(scenarios, 1):
        print(f"Processing Scenario {i}: {scenario['title']}")
        start_time = time.time()
        
        result = orchestrator.process_request(scenario['prompt'], 100+i)
        
        time_taken = round(time.time() - start_time, 2)
        
        md_content += f"## Scenario {i}: {scenario['title']}\n"
        md_content += f"**Input Prompt:**\n> {scenario['prompt']}\n\n"
        md_content += f"**Time Taken:** {time_taken} seconds\n"
        
        bns = result.get('statute_corrections', [])
        md_content += f"**BNS Corrections Intercepted:**\n"
        if not bns:
            md_content += "> None\n\n"
        else:
            for b in bns:
                md_content += f"> Replaced '{b['ipc']}' with statutory mapping '{b['bns']}'\n"
            md_content += "\n"
        
        flaws = result.get('flaw_log', {}).get('flaws', [])
        md_content += f"**Algorithmic Critique Flaws Found:** {len(flaws)}\n\n"
        if flaws:
            for f in flaws:
                md_content += f"- [{f['severity']}] {f['type']}\n"
            md_content += "\n"
            
        md_content += f"**PDF Generated:** `{result.get('pdf_path')}`\n\n"
        
        md_content += f"### Fully Generated Raw Draft Text\n\n"
        md_content += f"```text\n{result.get('output', 'Error: No output generated')}\n```\n\n"
        md_content += hr_divider()
        
    with open(output_md, 'w', encoding='utf-8') as f:
        f.write(md_content)
        
    print(f"Shutting down Model Server...")
    await manager.shutdown()
    print(f"DONE. Actual generated legal drafts saved literally to: {output_md}")

def hr_divider():
    return "---\n\n"

if __name__ == '__main__':
    asyncio.run(run_real_world_generation())
