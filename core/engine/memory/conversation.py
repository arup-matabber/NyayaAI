"""
backend/memory/conversation.py
================================
Nyaya AI — Conversation Memory

Persistent JSON-backed conversation history for maintaining context
across legal queries within a session.

Features:
  - FIFO ring buffer (max_turns)
  - JSON persistence to disk
  - Context string builder for prompt injection
  - Session-level memory (wiped after engine restart)
"""

import json
import os
from pathlib import Path
from datetime import datetime


class ConversationMemory:
    """
    Stores conversation history as a list of turns in JSON format.

    Each turn is a dict: {"role": "user"|"assistant", "content": str, "timestamp": str}
    """

    def __init__(self, memory_path: str = "conversation.json", max_turns: int = 10):
        self.memory_path = str(Path(memory_path).resolve())
        self.max_turns   = max_turns
        self.turns: list[dict] = []

        self._load()

    def _load(self):
        """Load conversation history from disk."""
        try:
            if os.path.exists(self.memory_path):
                with open(self.memory_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    if isinstance(data, list):
                        self.turns = data[-self.max_turns * 2:]  # keep within limit
                        return
        except Exception as e:
            print(f"[Memory] Warning: Could not load history: {e}")

        self.turns = []

    def add(self, role: str, content: str):
        """Add a message to conversation history."""
        self.turns.append({
            "role": role,
            "content": content,
            "timestamp": datetime.now().isoformat(),
        })

        # Enforce max turns (each turn = user + assistant = 2 messages)
        max_messages = self.max_turns * 2
        if len(self.turns) > max_messages:
            self.turns = self.turns[-max_messages:]

        self.flush()

    def get_context_string(self, max_chars: int = 1500) -> str:
        """
        Build a context string from recent history for prompt injection.

        Returns formatted conversation history within max_chars limit.
        """
        if not self.turns:
            return ""

        parts = []
        total = 0

        # Work backwards from most recent
        for turn in reversed(self.turns):
            role = turn["role"].capitalize()
            content = turn["content"][:300]  # cap individual messages
            entry = f"{role}: {content}\n"

            if total + len(entry) > max_chars:
                break

            parts.insert(0, entry)
            total += len(entry)

        if not parts:
            return ""

        return "Previous conversation:\n" + "".join(parts)

    def clear(self):
        """Clear all conversation history."""
        self.turns = []
        self.flush()
        print("[Memory] Conversation history cleared")

    def flush(self):
        """Save conversation history to disk."""
        try:
            os.makedirs(os.path.dirname(self.memory_path), exist_ok=True)
            with open(self.memory_path, 'w', encoding='utf-8') as f:
                json.dump(self.turns, f, ensure_ascii=False, indent=2)
        except Exception as e:
            print(f"[Memory] Warning: Could not save history: {e}")

    def stats(self) -> dict:
        """Return memory statistics."""
        return {
            "turns": len(self.turns) // 2,
            "total_messages": len(self.turns),
            "max_turns": self.max_turns,
            "memory_path": self.memory_path,
        }
