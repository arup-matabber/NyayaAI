import os
import sys
import json
import psutil
from datetime import datetime
from pathlib import Path

# Setup paths
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.insert(0, PROJECT_ROOT)

RESULTS_DIR = os.path.join(os.path.dirname(__file__), 'results')
os.makedirs(RESULTS_DIR, exist_ok=True)

class TestConfig:
    @staticmethod
    def print_header(title):
        print(f"\n\033[96m{'='*80}\033[0m")
        print(f"\033[1m{' '*((80-len(title))//2)}{title}{' '*((80-len(title))//2)}\033[0m")
        print(f"\033[96m{'='*80}\033[0m\n")

    @staticmethod
    def print_step(step_name):
        print(f"\033[94m[*] {step_name}\033[0m")

    @staticmethod
    def print_success(msg):
        print(f"\033[92m[+] PASS: {msg}\033[0m")

    @staticmethod
    def print_failure(msg):
        print(f"\033[91m[-] FAIL: {msg}\033[0m")
        
    @staticmethod
    def print_warning(msg):
        print(f"\033[93m[!] WARN: {msg}\033[0m")

    @staticmethod
    def save_result(test_id, result_dict):
        result_dict["timestamp"] = datetime.now().isoformat()
        result_dict["test_id"] = test_id
        
        filepath = os.path.join(RESULTS_DIR, f"{test_id.lower()}_result.json")
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(result_dict, f, indent=4)
        TestConfig.print_step(f"Saved {test_id} results to {filepath}")

    @staticmethod
    def format_status(passed, failed):
        if failed == 0 and passed > 0:
            return "\033[92mPASS\033[0m"
        elif passed == 0 and failed == 0:
            return "\033[93mSKIPPED\033[0m"
        else:
            return f"\033[91mFAIL ({failed} failed)\033[0m"

    @staticmethod
    def get_hardware_info():
        info = {
            "os": os.name,
            "cpu_cores": psutil.cpu_count(logical=True),
            "ram_total_gb": round(psutil.virtual_memory().total / (1024**3), 2),
            "ram_available_gb": round(psutil.virtual_memory().available / (1024**3), 2),
        }
        
        has_gpu = False
        try:
            import GPUtil
            gpus = GPUtil.getGPUs()
            if gpus:
                info["gpu_model"] = gpus[0].name
                info["vram_total_mb"] = gpus[0].memoryTotal
                info["vram_free_mb"] = gpus[0].memoryFree
                has_gpu = True
        except ImportError:
            pass
            
        if not has_gpu:
            info["gpu_model"] = "None detected (or GPUtil missing)"
            info["vram_total_mb"] = 0
            info["vram_free_mb"] = 0
            
        return info

def ensure_env():
    """Ensure environment paths are set up correctly for tests."""
    pass
