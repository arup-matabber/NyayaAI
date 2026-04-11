import time
from test_suite.test_config import TestConfig
from engine.tiers.router import ModelRouter

def run_tier_benchmarks():
    TestConfig.print_header("Tier Performance & Switch Benchmark")
    
    # We will simulate the router picking tiers based on complexity
    # We only test the routing speed since the ModelServer may not be running locally
    # If the user has strict inference testing, this script should measure actual generation 
    # but that might be heavy, so we at least test the ModelRouter complexity scoring logic.
    
    config = {"models": {"fast": {"path": "dummy"}, "balanced": {"path": "dummy"}, "deep": {"path": "dummy"}}}
    
    results = {}
    
    test_prompts = [
        ("fix the bug", "fast"), # expected fast
        ("implement authentication api endpoint", "balanced"), # expected balanced
        ("design the entire project architecture from scratch", "deep"), # expected deep
    ]
    
    router = ModelRouter(config)
    
    for prompt, expected in test_prompts:
        score = router.score_complexity(prompt)
        tier = router.pick_tier(prompt)
        TestConfig.print_step(f"Prompt: '{prompt}' -> Tier: {tier} (Score: {score}/10)")
        results[prompt] = {"expected": expected, "actual": tier, "score": score}
        
    TestConfig.save_result("bench_tier_compare", results)

if __name__ == '__main__':
    run_tier_benchmarks()
