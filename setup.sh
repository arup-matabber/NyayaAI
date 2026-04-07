#!/bin/bash
# =============================================================================
# Nyaya AI — Production Setup Script
# Handles: Linux, macOS, WSL (Ubuntu/Debian/Fedora/Arch)
# Usage:   chmod +x setup.sh && ./setup.sh
# Reset:   ./setup.sh --reset
# =============================================================================

set -euo pipefail

# ── Colors ───────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; DIM='\033[2m'; NC='\033[0m'

ok()   { echo -e "${GREEN}  ✔${NC}  $1"; }
warn() { echo -e "${YELLOW}  ⚠${NC}  $1"; }
err()  { echo -e "${RED}  ✗  ERROR:${NC} $1"; exit 1; }
info() { echo -e "${CYAN}  →${NC}  $1"; }
step() { echo -e "\n${BOLD}${CYAN}[ $1 ]${NC}"; }
hr()   { echo -e "${DIM}──────────────────────────────────────────────${NC}"; }

# ── Banner ────────────────────────────────────────────────────────────────────
clear
echo ""
echo -e "${BOLD}${CYAN}  Nyaya AI — Setup Script${NC}"
echo -e "${DIM}  Indian Legal Intelligence Platform${NC}"
hr
echo ""

# ── Reset flag ────────────────────────────────────────────────────────────────
RESET=false
for arg in "$@"; do
  [[ "$arg" == "--reset" ]] && RESET=true
done

if $RESET; then
  warn "--reset flag detected. Removing virtualenv, node_modules, and database..."
  rm -rf core/nyaya-env core/data/*.sqlite client/node_modules
  ok "Reset complete. Starting fresh."
fi

# ── OS Detection ──────────────────────────────────────────────────────────────
step "Detecting environment"

OS="unknown"
PKG=""
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
  if grep -qi microsoft /proc/version 2>/dev/null; then
    OS="wsl"; info "Environment: WSL (Windows Subsystem for Linux)"
  else
    OS="linux"; info "Environment: Linux"
  fi
  # Detect package manager
  if command -v apt-get &>/dev/null; then PKG="apt"
  elif command -v dnf &>/dev/null;     then PKG="dnf"
  elif command -v pacman &>/dev/null;  then PKG="pacman"
  fi
elif [[ "$OSTYPE" == "darwin"* ]]; then
  OS="mac"; info "Environment: macOS"
elif [[ "$OSTYPE" == "msys"* ]] || [[ "$OSTYPE" == "cygwin"* ]]; then
  OS="windows_git"
  warn "Detected Windows Git Bash. Some features may work differently."
  warn "For best results on Windows, run this script inside WSL."
else
  warn "Unknown OS: $OSTYPE — proceeding anyway."
fi

# ── Python check ──────────────────────────────────────────────────────────────
step "Checking Python"

PYTHON=""
for cmd in python3.12 python3.11 python3.10 python3 python; do
  if command -v "$cmd" &>/dev/null; then
    VER=$("$cmd" -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')" 2>/dev/null || echo "0.0")
    MAJOR=$(echo "$VER" | cut -d. -f1)
    MINOR=$(echo "$VER" | cut -d. -f2)
    if [[ "$MAJOR" -ge 3 && "$MINOR" -ge 10 ]]; then
      PYTHON="$cmd"; ok "Python $VER found at: $(command -v $cmd)"; break
    fi
  fi
done

if [[ -z "$PYTHON" ]]; then
  err "Python 3.10+ is required.\n  $(
    case $PKG in
      apt) echo 'Install: sudo apt install python3.11 python3.11-venv';;
      dnf) echo 'Install: sudo dnf install python3.11';;
      pacman) echo 'Install: sudo pacman -S python';;
      *) echo 'Download: https://www.python.org/downloads/';;
    esac)"
fi

# Check pip
if ! "$PYTHON" -m pip --version &>/dev/null; then
  warn "pip not found. Attempting to install..."
  case $PKG in
    apt) sudo apt-get install -y python3-pip || err "Failed to install pip. Try: sudo apt install python3-pip";;
    dnf) sudo dnf install -y python3-pip || err "failed";;
    pacman) sudo pacman -S python-pip --noconfirm || err "failed";;
    *) curl -sS https://bootstrap.pypa.io/get-pip.py | "$PYTHON" || err "pip install failed";;
  esac
fi
ok "pip available"

# Check venv module
if ! "$PYTHON" -m venv --help &>/dev/null; then
  warn "venv module missing. Attempting to install..."
  case $PKG in
    apt) sudo apt-get install -y python3-venv || err "Install manually: sudo apt install python3-venv";;
    *) err "venv not available. Install python3-venv for your OS.";;
  esac
fi
ok "venv module available"

# ── Node.js check ─────────────────────────────────────────────────────────────
step "Checking Node.js"

if ! command -v node &>/dev/null; then
  err "Node.js 18+ is required.\n  Install: https://nodejs.org\n  Or via nvm: curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash"
fi

NODE_VER=$(node -e "console.log(process.version.slice(1).split('.')[0])" 2>/dev/null || echo "0")
if [[ "$NODE_VER" -lt 18 ]]; then
  err "Node.js 18+ required. You have v$NODE_VER. Upgrade at https://nodejs.org"
fi
ok "Node.js v$(node --version | tr -d v) found"

if ! command -v npm &>/dev/null; then
  err "npm not found. It should come with Node.js. Try reinstalling Node.js."
fi
ok "npm v$(npm --version) found"

# ── Tesseract ────────────────────────────────────────────────────────────────
step "Checking Tesseract OCR"

if command -v tesseract &>/dev/null; then
  ok "Tesseract: $(tesseract --version 2>&1 | head -1)"
else
  warn "Tesseract not found — OCR fallback for scanned PDFs will be unavailable."
  info "Auto-installing Tesseract..."
  INSTALLED_TESS=false
  case $PKG in
    apt)
      sudo apt-get install -y tesseract-ocr 2>/dev/null && INSTALLED_TESS=true || true;;
    dnf)
      sudo dnf install -y tesseract 2>/dev/null && INSTALLED_TESS=true || true;;
    pacman)
      sudo pacman -S tesseract tesseract-data-eng --noconfirm 2>/dev/null && INSTALLED_TESS=true || true;;
  esac
  if $INSTALLED_TESS && command -v tesseract &>/dev/null; then
    ok "Tesseract installed automatically"
  else
    warn "Could not auto-install Tesseract. Install manually:"
    echo "    Ubuntu/WSL: sudo apt install tesseract-ocr"
    echo "    macOS:      brew install tesseract"
    echo "    Fedora:     sudo dnf install tesseract"
    echo "  Engine will work without it (PyMuPDF handles native PDFs)."
  fi
fi

# ── Python virtual environment ────────────────────────────────────────────────
step "Setting up Python virtual environment"

VENV_DIR="core/nyaya-env"
if [[ -d "$VENV_DIR" ]]; then
  info "Virtualenv exists at $VENV_DIR — skipping creation."
else
  info "Creating virtual environment..."
  "$PYTHON" -m venv "$VENV_DIR" || err "Failed to create virtual environment. Is python3-venv installed?"
  ok "Virtual environment created at $VENV_DIR"
fi

# Activate
if [[ -f "$VENV_DIR/bin/activate" ]]; then
  # shellcheck disable=SC1090
  source "$VENV_DIR/bin/activate"
elif [[ -f "$VENV_DIR/Scripts/activate" ]]; then
  # shellcheck disable=SC1090
  source "$VENV_DIR/Scripts/activate"
else
  err "Could not find virtualenv activation script. Try running with --reset."
fi
ok "Virtual environment activated"

# Upgrade pip inside venv
info "Upgrading pip..."
pip install --upgrade pip --quiet 2>&1 | tail -1 || warn "pip upgrade failed — continuing anyway"

# ── Python dependencies ────────────────────────────────────────────────────────
step "Installing Python dependencies"

install_pkg() {
  local desc="$1"; shift
  info "Installing $desc..."
  if pip install "$@" --quiet 2>&1; then
    ok "$desc installed"
  else
    warn "Failed to install $desc. Some features may be unavailable."
    warn "Manual install: pip install $*"
  fi
}

install_pkg "FastAPI server stack" fastapi "uvicorn[standard]" python-multipart
install_pkg "SQLAlchemy ORM" sqlalchemy
install_pkg "PDF processing" PyMuPDF reportlab Pillow
install_pkg "HTTP clients" httpx aiohttp pyyaml

# OCR
install_pkg "Tesseract Python bindings" pytesseract || true

# Embeddings (optional — large, skip if slow)
info "Installing ONNX embeddings (optional, may take a moment)..."
pip install onnxruntime onnx tokenizers huggingface-hub --quiet 2>&1 | tail -1 || \
  warn "ONNX packages skipped — embedding search unavailable."

# Encryption
install_pkg "Cryptography" cryptography

# Telegram bot (optional)
pip install "python-telegram-bot>=20.0" --quiet 2>&1 | tail -1 || \
  warn "Telegram bot package skipped (optional)."

ok "All Python packages installed"

# ── Directories ───────────────────────────────────────────────────────────────
step "Creating required directories"

for dir in data/uploads core/output core/models core/data; do
  mkdir -p "$dir"
  ok "  $dir"
done

# ── Database ──────────────────────────────────────────────────────────────────
step "Initializing database"

python - <<'PYEOF'
import sys
sys.path.insert(0, '.')
try:
    from core.engine.db.database import Base, engine
    from core.engine.db import models
    Base.metadata.create_all(bind=engine)
    print("  Database tables created at core/data/nyaya_db.sqlite")
except Exception as e:
    print(f"  WARNING: DB init failed: {e}")
    print("  This is non-fatal — DB will be created on first server start.")
PYEOF
ok "Database ready"

# ── Frontend ──────────────────────────────────────────────────────────────────
step "Installing frontend dependencies"

cd client

if [[ -d "node_modules" ]]; then
  info "node_modules exists — running npm install to sync..."
fi

# Use ci if lock file exists for reproducible installs
if [[ -f "package-lock.json" ]]; then
  npm ci --silent 2>&1 || npm install --silent 2>&1 || err "npm install failed. Check your Node.js version (need 18+)."
else
  npm install --silent 2>&1 || err "npm install failed."
fi
cd ..
ok "Frontend dependencies installed"

# ── Verify imports ────────────────────────────────────────────────────────────
step "Verifying installation"

python - <<'PYEOF'
import sys
sys.path.insert(0, '.')
failures = []
checks = [
    ("fastapi",        "FastAPI server"),
    ("uvicorn",        "Uvicorn ASGI server"),
    ("sqlalchemy",     "SQLAlchemy ORM"),
    ("fitz",           "PyMuPDF (PDF parsing)"),
    ("reportlab",      "ReportLab (PDF generation)"),
    ("PIL",            "Pillow (image processing)"),
    ("cryptography",   "Cryptography"),
]
for module, name in checks:
    try:
        __import__(module)
        print(f"  \033[32m✔\033[0m  {name}")
    except ImportError:
        failures.append(name)
        print(f"  \033[31m✗\033[0m  {name} — MISSING")
if failures:
    print(f"\n  WARNING: {len(failures)} package(s) missing: {', '.join(failures)}")
    print("  Run: pip install " + " ".join(f.lower().split()[0] for f in failures))
else:
    print("\n  All critical packages verified.")
PYEOF

# ── Optional: LLM instructions ───────────────────────────────────────────────
hr
echo ""
echo -e "${BOLD}  LOCAL LLM SETUP (Optional — for AI-quality generation)${NC}"
echo ""
echo "  Without a local LLM, Nyaya uses structured template generation."
echo "  For full AI output, run llama.cpp on your machine:"
echo ""
echo -e "${DIM}  # 1. Build llama.cpp${NC}"
echo "     git clone https://github.com/ggerganov/llama.cpp && cd llama.cpp"
echo "     make -j4                      # CPU"
echo "     make LLAMA_CUBLAS=1 -j4       # NVIDIA GPU"
echo ""
echo -e "${DIM}  # 2. Download a model (pick one based on your VRAM):${NC}"
echo "     # 4GB VRAM → Mistral 7B Q4:"
echo "     wget https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.2-GGUF/resolve/main/mistral-7b-instruct-v0.2.Q4_K_M.gguf -O core/models/model.gguf"
echo "     # 8GB VRAM → Mistral 7B Q8:"
echo "     wget https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.2-GGUF/resolve/main/mistral-7b-instruct-v0.2.Q8_0.gguf -O core/models/model.gguf"
echo ""
echo -e "${DIM}  # 3. Start the server:${NC}"
echo "     ./llama-server -m core/models/model.gguf -ngl 35 --port 8088   # GPU"
echo "     ./llama-server -m core/models/model.gguf --port 8088           # CPU"
echo ""
hr

# ── Final summary ─────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}${GREEN}  Setup complete!${NC}"
echo ""
echo -e "${BOLD}  HOW TO RUN:${NC}"
echo ""
echo "  Terminal 1 — Engine Server:"
echo -e "    ${CYAN}source core/nyaya-env/bin/activate && python -m core.engine.server${NC}"
echo ""
echo "  Terminal 2 — Frontend:"
echo -e "    ${CYAN}cd client && npm run dev${NC}"
echo ""
echo "  Browser:"
echo -e "    ${CYAN}http://localhost:5173${NC}"
echo ""
echo "  Troubleshooting:"
echo "    ./setup.sh --reset    # Wipe and reinstall everything"
echo ""
hr
