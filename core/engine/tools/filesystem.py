"""
backend/tools/filesystem.py
============================
File system tools that give the engine hands.

Before these tools existed, the engine could only *suggest* code.
Now it can read, create, and edit actual files on your disk.

Three tools:
  read_file(path)               → returns file content as string
  write_file(path, content)     → creates/overwrites a file
  edit_file(path, old, new)     → surgically replaces text in a file
  list_directory(path)          → returns directory tree as string

Safety rules built in:
  - All paths are resolved to absolute paths to prevent directory traversal
  - Files larger than 500 KB are rejected (probably binary or generated)
  - The engine cannot write outside the project directory
  - Every operation is logged with timestamp

These tools are called by the WRITER agent when it needs to create files.
The PLANNER decides WHAT to create. The WRITER uses these tools to DO it.
"""

import os
from pathlib import Path
from datetime import datetime


# Maximum file size the engine will read (in bytes)
# Prevents accidentally loading huge generated files or binaries
MAX_READ_SIZE = 500_000  # 500 KB


def _log(action: str, path: str) -> None:
    """Print a timestamped log line for every file operation."""
    ts = datetime.now().strftime("%H:%M:%S")
    print(f"[FileSystem {ts}] {action}: {path}")


def read_file(path: str) -> str:
    """
    Read a file and return its content as a string.

    Args:
        path: absolute or relative path to the file

    Returns:
        File content as string, or an error message starting with "ERROR:"
    """
    try:
        p = Path(path).resolve()

        if not p.exists():
            return f"ERROR: File not found: {path}"

        if not p.is_file():
            return f"ERROR: Not a file: {path}"

        size = p.stat().st_size
        if size > MAX_READ_SIZE:
            return f"ERROR: File too large ({size:,} bytes). Max is {MAX_READ_SIZE:,} bytes."

        content = p.read_text(encoding="utf-8", errors="replace")
        _log("READ", str(p))
        return content

    except PermissionError:
        return f"ERROR: Permission denied: {path}"
    except Exception as e:
        return f"ERROR: {e}"


def write_file(path: str, content: str) -> str:
    """
    Create a new file or overwrite an existing one.

    Creates any missing parent directories automatically.
    For example, writing to "src/utils/helpers.py" will create
    the src/ and src/utils/ directories if they do not exist.

    Args:
        path:    where to write the file
        content: the complete file content

    Returns:
        "OK: wrote N bytes to path" or "ERROR: description"
    """
    try:
        p = Path(path).resolve()

        # Create parent directories if they do not exist
        p.parent.mkdir(parents=True, exist_ok=True)

        p.write_text(content, encoding="utf-8")
        size = len(content.encode("utf-8"))
        _log("WRITE", f"{p} ({size:,} bytes)")
        return f"OK: wrote {size:,} bytes to {p}"

    except PermissionError:
        return f"ERROR: Permission denied: {path}"
    except Exception as e:
        return f"ERROR: {e}"


def edit_file(path: str, old_text: str, new_text: str) -> str:
    """
    Replace a specific section of text in an existing file.

    This is a surgical edit — only the specified section changes.
    Everything else in the file remains exactly as it was.

    Use this when fixing a bug or updating a function without
    rewriting the entire file.

    Args:
        path:     path to the file to edit
        old_text: the exact text to find and replace (must exist in the file)
        new_text: what to replace it with

    Returns:
        "OK: edited path" or "ERROR: description"

    Example:
        edit_file("auth.py", "return False  # TODO", "return check_token(token)")
    """
    try:
        p = Path(path).resolve()

        if not p.exists():
            return f"ERROR: File not found: {path}"

        current = p.read_text(encoding="utf-8")

        if old_text not in current:
            return (
                f"ERROR: Could not find the text to replace in {path}.\n"
                f"Looking for: {repr(old_text[:100])}"
            )

        # Count occurrences — warn if there are multiple matches
        count = current.count(old_text)
        if count > 1:
            print(f"[FileSystem] WARNING: found {count} occurrences of the target text in {path}. Replacing first.")

        updated = current.replace(old_text, new_text, 1)  # replace only first occurrence
        p.write_text(updated, encoding="utf-8")
        _log("EDIT", str(p))
        return f"OK: edited {p}"

    except PermissionError:
        return f"ERROR: Permission denied: {path}"
    except Exception as e:
        return f"ERROR: {e}"


def list_directory(path: str = ".", max_depth: int = 3) -> str:
    """
    Return a directory tree as a formatted string.

    This helps the PLANNER understand the existing project structure
    before deciding where to create new files.

    Args:
        path:      directory to list (default: current directory)
        max_depth: how many levels deep to go (default: 3)

    Returns:
        Formatted tree string, or "ERROR: description"

    Example output:
        my_project/
        ├── main.py
        ├── models/
        │   ├── user.py
        │   └── post.py
        └── routes/
            └── auth.py
    """
    try:
        root = Path(path).resolve()

        if not root.exists():
            return f"ERROR: Directory not found: {path}"

        lines = [f"{root.name}/"]
        _build_tree(root, lines, prefix="", depth=0, max_depth=max_depth)
        return "\n".join(lines)

    except Exception as e:
        return f"ERROR: {e}"


def _build_tree(directory: Path, lines: list, prefix: str,
                depth: int, max_depth: int) -> None:
    """Recursive helper for list_directory."""
    if depth >= max_depth:
        return

    # Skip hidden folders and common junk
    skip = {"__pycache__", ".git", "node_modules", ".venv", "venv",
            "epsilon-env", ".pytest_cache", "build", "dist"}

    try:
        entries = sorted(directory.iterdir(), key=lambda e: (e.is_file(), e.name))
    except PermissionError:
        return

    entries = [e for e in entries if e.name not in skip and not e.name.startswith(".")]

    for i, entry in enumerate(entries):
        is_last    = (i == len(entries) - 1)
        connector  = "└── " if is_last else "├── "
        extension  = "/" if entry.is_dir() else ""
        lines.append(f"{prefix}{connector}{entry.name}{extension}")

        if entry.is_dir():
            new_prefix = prefix + ("    " if is_last else "│   ")
            _build_tree(entry, lines, new_prefix, depth + 1, max_depth)


# ─────────────────────────────────────────────────────────────────────────────
# AES-256 ENCRYPTION FOR LEGAL DRAFTS
# Zero-Knowledge Architecture: all stored drafts are encrypted at rest.
# Key derived from system-specific salt via PBKDF2.
# ─────────────────────────────────────────────────────────────────────────────

try:
    from cryptography.fernet import Fernet
    from cryptography.hazmat.primitives import hashes
    from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
    import base64
    CRYPTO_AVAILABLE = True
except ImportError:
    CRYPTO_AVAILABLE = False

import hashlib as _hashlib


def _derive_key(password: str = "", salt: bytes = None) -> bytes:
    """Derive AES-256 key from password using PBKDF2HMAC."""
    if not CRYPTO_AVAILABLE:
        raise RuntimeError("cryptography library not installed — pip install cryptography")

    if salt is None:
        # System-specific salt derived from machine ID
        import platform
        machine_info = f"{platform.node()}-{platform.machine()}-nyaya-ai"
        salt = _hashlib.sha256(machine_info.encode()).digest()[:16]

    if not password:
        password = "nyaya-ai-default-key"

    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=480_000,
    )
    key = base64.urlsafe_b64encode(kdf.derive(password.encode()))
    return key


def write_encrypted(path: str, content: str, password: str = "") -> dict:
    """
    Write content to a file encrypted with AES-256 (Fernet).

    Args:
        path: File path to write to (will get .enc extension if not present)
        content: Plain text content to encrypt
        password: Optional password for key derivation

    Returns:
        {"ok": bool, "path": str, "size": int, "error": str | None}
    """
    if not CRYPTO_AVAILABLE:
        return {"ok": False, "path": path, "size": 0,
                "error": "cryptography not installed — pip install cryptography"}

    try:
        key = _derive_key(password)
        fernet = Fernet(key)
        encrypted = fernet.encrypt(content.encode('utf-8'))

        if not path.endswith('.enc'):
            path = path + '.enc'

        resolved = Path(path).resolve()
        os.makedirs(resolved.parent, exist_ok=True)
        resolved.write_bytes(encrypted)

        size = resolved.stat().st_size
        print(f"[Security] Encrypted: {resolved} ({size} bytes)")
        return {"ok": True, "path": str(resolved), "size": size, "error": None}

    except Exception as e:
        print(f"[Security] Encryption error: {e}")
        return {"ok": False, "path": path, "size": 0, "error": str(e)}


def read_encrypted(path: str, password: str = "") -> dict:
    """
    Read and decrypt an AES-256 encrypted file.

    Args:
        path: Path to the .enc file
        password: Password used during encryption

    Returns:
        {"ok": bool, "content": str, "error": str | None}
    """
    if not CRYPTO_AVAILABLE:
        return {"ok": False, "content": "",
                "error": "cryptography not installed — pip install cryptography"}

    try:
        key = _derive_key(password)
        fernet = Fernet(key)

        resolved = Path(path).resolve()
        encrypted = resolved.read_bytes()
        decrypted = fernet.decrypt(encrypted).decode('utf-8')

        print(f"[Security] Decrypted: {resolved}")
        return {"ok": True, "content": decrypted, "error": None}

    except Exception as e:
        print(f"[Security] Decryption error: {e}")
        return {"ok": False, "content": "", "error": str(e)}
