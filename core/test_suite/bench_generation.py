import time
import os
from test_suite.test_config import TestConfig
from engine.agents.orchestrator import PipelineOrchestrator

def run_generation_benchmarks():
    TestConfig.print_header("Document Generation Benchmark")
    orchestrator = PipelineOrchestrator()
    
    test_cases = [
        "Bail application under BNS 103 for High Court",
        "Criminal complaint for theft and cheating in District Court",
        "Civil suit for breach of contract"
    ]
    
    results = {}
    
    for idx, prompt in enumerate(test_cases, 1):
        TestConfig.print_step(f"Benchmarking Document {idx}...")
        start_time = time.time()
        
        # This will test generation capability using the system defaults (router selects tier)
        result = orchestrator.process_request(prompt)
        
        end_time = time.time()
        time_taken = round(end_time - start_time, 2)
        
        TestConfig.print_step(f"Generated Document {idx} in {time_taken} seconds.")
        
        results[f"doc_{idx}"] = {
            "prompt": prompt,
            "time_seconds": time_taken,
            "bns_corrections": len(result.get("statute_corrections", [])),
            "output_length": len(result.get("output", "")),
            "pdf_generated": result.get("pdf_path") is not None
        }
    
    avg_time = round(sum(r["time_seconds"] for r in results.values()) / len(results), 2)
    TestConfig.print_success(f"Average generation time: {avg_time} seconds per document.")
    
    results["average_time"] = avg_time
    TestConfig.save_result("bench_generation", results)

if __name__ == '__main__':
    run_generation_benchmarks()
