"""
backend/main.py
=================
Nyaya AI — Legal Intelligence Platform Entry Point

Fully offline, privacy-first Indian Legal Intelligence Platform.
All inference runs locally. Zero data leaves the machine.

Usage:
  Interactive:  python backend/main.py
  One-shot:     python backend/main.py --oneshot
  Status:       python backend/main.py --status

Hardware Safety:
  VRAM ceiling: 4 GB (200 MB safety buffer)
  Flash attention: enabled
  Session wipe: after every request
"""

import asyncio
import json
import sys
import os
import yaml
from pathlib import Path

# ── Resolve project root ─────────────────────────────────────────────────────
# main.py is at  <project>/backend/main.py
# Project root = <project>/
PROJECT_ROOT = Path(__file__).resolve().parent.parent
os.chdir(PROJECT_ROOT)
sys.path.insert(0, str(PROJECT_ROOT))

from engine.tiers.model_manager import TieredModelManager
from engine.inference.kv_cache import SparseKVCache
from engine.agents.orchestrator import PipelineOrchestrator
from engine.clara.oracle import ClaraOracle
from engine.aether.link import AetherLink
from engine.memory.conversation import ConversationMemory


BANNER = r"""
 ███╗   ██╗██╗   ██╗ █████╗ ██╗   ██╗ █████╗      █████╗ ██╗
 ████╗  ██║╚██╗ ██╔╝██╔══██╗╚██╗ ██╔╝██╔══██╗    ██╔══██╗██║
 ██╔██╗ ██║ ╚████╔╝ ███████║ ╚████╔╝ ███████║    ███████║██║
 ██║╚██╗██║  ╚██╔╝  ██╔══██║  ╚██╔╝  ██╔══██║    ██╔══██║██║
 ██║ ╚████║   ██║   ██║  ██║   ██║   ██║  ██║    ██║  ██║██║
 ╚═╝  ╚═══╝   ╚═╝   ╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝    ╚═╝  ╚═╝██║
                                                              ╚═╝
  Indian Legal Intelligence Platform — Fully Offline
  Zero-Knowledge Architecture | AES-256 | 4GB VRAM Guard
"""


def load_config() -> dict:
    """Load configuration from nyaya_config.yaml or config.yaml."""
    for config_name in ["nyaya_config.yaml", "config.yaml"]:
        config_path = PROJECT_ROOT / config_name
        if config_path.exists():
            with open(config_path, 'r') as f:
                cfg = yaml.safe_load(f)
                print(f"[Config] Loaded: {config_path}", file=sys.stderr)
                return cfg or {}

    # Default config
    print("[Config] No config file found — using defaults", file=sys.stderr)
    return {
        "llama_server_bin": "./BitNet/build/bin/llama-server",
        "cpu_threads": 4,
        "idle_timeout": 300,
        "models": {
            "fast": {
                "path": "./models/fast/model.gguf",
                "gpu_layers": 99,
                "context_len": 2048,
            },
            "balanced": {
                "path": "./models/balanced/model.gguf",
                "gpu_layers": 99,
                "context_len": 4096,
            },
            "deep": {
                "path": "./models/deep/model.gguf",
                "gpu_layers": 0,
                "context_len": 4096,
            },
        },
        "legal": {
            "headnote_db": "./data/headnotes.db",
            "legal_docs_dir": "./data/legal_docs",
            "output_dir": "./output",
        },
    }


async def main():
    oneshot = "--oneshot" in sys.argv
    status_only = "--status" in sys.argv

    # ── Banner ────────────────────────────────────────────────────────────────
    print(BANNER, file=sys.stderr, flush=True)
    print("  Initializing Nyaya AI...\n", file=sys.stderr, flush=True)

    # ── Load config ───────────────────────────────────────────────────────────
    config = load_config()

    # ── Initialize components ─────────────────────────────────────────────────
    print("[Init] Model Manager (3-tier, 4GB VRAM ceiling)...", file=sys.stderr)
    model_mgr = TieredModelManager(config)

    print("[Init] KV Cache (INT8, 512 tokens)...", file=sys.stderr)
    kv = SparseKVCache()

    print("[Init] Conversation Memory...", file=sys.stderr)
    memory_path = str(PROJECT_ROOT / "data" / "conversation.json")
    memory = ConversationMemory(memory_path)
    memory.clear()  # Ensure strict session wipe / Zero-Knowledge on restart

    print("[Init] Legal Knowledge Oracle (InLegalBERT)...", file=sys.stderr)
    oracle_db = config.get("legal", {}).get("headnote_db", str(PROJECT_ROOT / "nyaya_legal.db"))
    clara = ClaraOracle(db_path=oracle_db)

    print("[Init] Legal Orchestrator...", file=sys.stderr)
    orchestrator = Orchestrator(
        model_manager=model_mgr,
        kv_cache=kv,
        memory=memory,
        clara=clara,
        config=config,
    )

    # ── Index legal documents if directory exists ────────────────────────────
    legal_docs_dir = config.get("legal", {}).get("legal_docs_dir", "./data/legal_docs")
    if Path(legal_docs_dir).exists():
        print(f"[Init] Indexing legal documents from {legal_docs_dir}...", file=sys.stderr)
        clara.crawl(legal_docs_dir)

    # ── Status check mode ─────────────────────────────────────────────────────
    if status_only:
        status = {
            "engine": "nyaya_ai",
            "version": "1.0.0",
            "model_manager": model_mgr.status(),
            "oracle": clara.stats(),
            "memory": memory.stats(),
        }
        print(json.dumps(status, indent=2, default=str))
        return

    # ── Start model server ────────────────────────────────────────────────────
    print("[Init] Starting model server...", file=sys.stderr)
    await model_mgr.startup()

    # ── Launch NyayaLink ──────────────────────────────────────────────────────
    print("[Init] Nyaya AI ready — accepting legal queries", file=sys.stderr, flush=True)

    link = AetherLink(orchestrator, oneshot=oneshot, memory=memory)

    try:
        await link.run()
    except KeyboardInterrupt:
        print("\n[Shutdown] Nyaya AI shutting down...", file=sys.stderr)
    finally:
        await model_mgr.shutdown()
        memory.flush()
        print("[Shutdown] All resources released. Goodbye.", file=sys.stderr)


if __name__ == "__main__":
    asyncio.run(main())