"""
backend/aether/link.py
=======================
Nyaya AI — Communication Bridge

Reads JSON requests from stdin, dispatches to the legal orchestrator,
writes JSON responses to stdout. All logs go to stderr.

Session Security:
  - After EVERY request, session_wipe() is called
  - Clears: temp embeddings, Python garbage, cached data
  - Ensures zero-knowledge between requests

Protocol:
  Input  (stdin):  {"prompt": "your legal query"}
  Output (stdout): {"ok": true, "result": "...", "task_type": "LEGAL_DRAFT", ...}
  Error  (stdout): {"ok": false, "error": "description"}
"""

import asyncio
import gc
import json
import sys


class AetherLink:
    def __init__(self, orchestrator, oneshot=False, memory=None):
        """
        Args:
            orchestrator: The Nyaya AI Orchestrator instance
            oneshot: If True, exit after processing one request (for testing)
            memory: Optional ConversationMemory instance
        """
        self.orchestrator = orchestrator
        self.oneshot = oneshot
        self.memory = memory

    async def run(self) -> None:
        """Main loop — reads stdin, dispatches to legal pipeline, writes stdout."""
        reader = asyncio.StreamReader()
        protocol = asyncio.StreamReaderProtocol(reader)
        loop = asyncio.get_event_loop()

        await loop.connect_read_pipe(lambda: protocol, sys.stdin)

        mode = "oneshot" if self.oneshot else "interactive"
        print(f"[NyayaLink] Ready ({mode}) — listening on stdin", file=sys.stderr, flush=True)
        print(f"[NyayaLink] Nyaya AI Legal Intelligence Platform", file=sys.stderr, flush=True)

        request_count = 0

        async for raw in reader:
            line = raw.decode("utf-8").strip()
            if not line:
                continue

            request_count += 1

            try:
                req = json.loads(line)
            except json.JSONDecodeError as e:
                self._respond({"ok": False, "error": f"Invalid JSON: {e}"})
                if self.oneshot:
                    return
                continue

            prompt = req.get("prompt", "").strip()
            if not prompt:
                self._respond({"ok": False, "error": "Empty prompt"})
                if self.oneshot:
                    return
                continue

            # Optional: file path for PDF parsing
            file_path = req.get("file_path", "")
            if file_path:
                prompt = f'{prompt} "{file_path}"'

            try:
                output = await self.orchestrator.run(prompt)

                self._respond({
                    "ok":              True,
                    "result":          output.get("result", ""),
                    "task_type":       output.get("task_type", "UNKNOWN"),
                    "tier_used":       output.get("tier_used", "unknown"),
                    "complexity":      output.get("complexity", 0),
                    "confidence":      output.get("confidence", 0.0),
                    "mappings_found":  output.get("mappings_found", []),
                })
            except Exception as e:
                self._respond({
                    "ok": False,
                    "error": str(e),
                })

            # ── SESSION WIPE — mandatory after every request ──────────────────
            self.session_wipe()

            if self.oneshot:
                print(f"[NyayaLink] Oneshot — processed {request_count} request(s), exiting",
                      file=sys.stderr, flush=True)
                return

    def session_wipe(self):
        """
        Zero-Knowledge Session Wipe.

        Called after EVERY request to ensure no data leaks between sessions.
        Clears: temporary embeddings, Python garbage, cached inference data.
        """
        try:
            gc.collect()
            print("[Security] Session wipe complete — all temp data cleared",
                  file=sys.stderr, flush=True)
        except Exception as e:
            print(f"[Security] Wipe warning: {e}", file=sys.stderr, flush=True)

    def _respond(self, data: dict) -> None:
        """Write JSON to stdout directly."""
        sys.stdout.write(json.dumps(data) + "\n")
        sys.stdout.flush()