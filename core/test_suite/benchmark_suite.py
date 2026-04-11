import sys
import unittest
from test_suite.test_config import TestConfig

def run_all_tests():
    TestConfig.print_header("NYAYA AI - COMPREHENSIVE BENCHMARK SUITE")
    
    loader = unittest.TestLoader()
    suite = unittest.TestSuite()
    
    # We will dynamically discover and add tests here
    test_modules = [
        "test_suite.test_router",
        "test_suite.test_flaw_detector",
        "test_suite.test_kv_cache",
        "test_suite.test_encryption",
        "test_suite.test_ocr_pipeline",
        "test_suite.test_clara_oracle",
        "test_suite.test_conversation_memory",
        "test_suite.test_pdf_writer",
        "test_suite.test_orchestrator"
    ]
    
    for module in test_modules:
        try:
            suite.addTests(loader.loadTestsFromName(module))
        except Exception as e:
            TestConfig.print_failure(f"Failed to load module {module}: {e}")
            
    if suite.countTestCases() > 0:
        runner = unittest.TextTestRunner(verbosity=2)
        result = runner.run(suite)
        TestConfig.print_header("TEST SUMMARY")
        print(f"Total Tests Run: {result.testsRun}")
        if result.wasSuccessful():
            TestConfig.print_success("All unit tests passed gracefully.")
        else:
            TestConfig.print_failure(f"Encountered {len(result.failures)} unit test failures and {len(result.errors)} errors.")
    else:
        TestConfig.print_warning("No unit tests found.")

    # Run Benchmark modules
    try:
        from test_suite.bench_environment import run_environment_benchmarks
        run_environment_benchmarks()
    except Exception as e:
        TestConfig.print_failure(f"Failed benchmark env: {e}")
        
    try:
        from test_suite.bench_tier_comparison import run_tier_benchmarks
        run_tier_benchmarks()
    except Exception as e:
        TestConfig.print_failure(f"Failed tier compare: {e}")
        
    try:
        from test_suite.competitive_analysis import run_competitive_analysis
        run_competitive_analysis()
    except Exception as e:
        TestConfig.print_failure(f"Failed competitive analysis: {e}")
        
    try:
        from test_suite.report_generator import generate_pdf_report
        generate_pdf_report()
    except Exception as e:
        TestConfig.print_failure(f"Failed report generation: {e}")

if __name__ == "__main__":
    run_all_tests()
