import os
import sys

from test_suite.test_config import TestConfig

def run_environment_benchmarks():
    TestConfig.print_header("Hardware & Environment Benchmark")
    hw_info = TestConfig.get_hardware_info()
    
    TestConfig.print_step(f"OS: {hw_info['os']}")
    TestConfig.print_step(f"CPU Cores: {hw_info['cpu_cores']}")
    TestConfig.print_step(f"RAM: {hw_info['ram_available_gb']} GB Free / {hw_info['ram_total_gb']} GB Total")
    
    TestConfig.print_step(f"GPU Model: {hw_info['gpu_model']}")
    TestConfig.print_step(f"VRAM: {hw_info['vram_free_mb']} MB Free / {hw_info['vram_total_mb']} MB Total")
    
    # Validation against Nyaya AI spec (Max 4GB VRAM ceiling, 3896 MB usable)
    valid_vram = hw_info['vram_total_mb'] >= 3896 if hw_info['gpu_model'] != "None detected (or GPUtil missing)" else False
    if hw_info['gpu_model'] == "None detected (or GPUtil missing)":
        TestConfig.print_warning("No GPU detected via GPUtil. Heavy models will use CPU fallback.")
    elif valid_vram:
        TestConfig.print_success("GPU VRAM meets 4GB capacity requirement.")
    else:
        TestConfig.print_warning(f"VRAM {hw_info['vram_total_mb']} MB is below the expected 4GB ceiling specification.")

    TestConfig.save_result("bench_env", hw_info)

if __name__ == '__main__':
    run_environment_benchmarks()
