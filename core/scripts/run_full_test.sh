#!/bin/bash

# Configuration
PROJECT_ROOT="/mnt/d/nyaya ai"
PYTHON_BIN="$PROJECT_ROOT/core/nyaya-env/bin/python3"
TEST_SCRIPT="$PROJECT_ROOT/core/scripts/full_system_test.py"

# Colors for terminal
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${PURPLE}─────────────────────────────────────────────────────────────────────────────${NC}"
echo -e "${CYAN}                NYAYA AI ENGINE - END-TO-END VERIFICATION               ${NC}"
echo -e "${PURPLE}─────────────────────────────────────────────────────────────────────────────${NC}"

# Check if environment exists
if [ ! -f "$PYTHON_BIN" ]; then
    echo -e "${RED}[ERROR] Environment not found at $PYTHON_BIN${NC}"
    echo -e "${YELLOW}[TIP] Run the consolidation command first: cd \"/mnt/d/nyaya ai\" && python3 -m venv core/nyaya-env${NC}"
    exit 1
fi

echo -e "${BLUE}[1/3] Setting up environment variables...${NC}"
export PYTHONPATH="$PROJECT_ROOT"

echo -e "${BLUE}[2/3] Checking structural dependencies (PyMuPDF, ReportLab)...${NC}"
"$PYTHON_BIN" -m pip install -q -r "$PROJECT_ROOT/core/requirements.txt" PyMuPDF sqlalchemy reportlab

echo -e "${BLUE}[3/3] Launching Full System Simulation...${NC}"
echo ""

# Execute the python test script
"$PYTHON_BIN" "$TEST_SCRIPT"

echo ""
echo -e "${PURPLE}─────────────────────────────────────────────────────────────────────────────${NC}"
echo -e "${GREEN}    VERIFICATION PIPELINE COMPLETE. ALL ASSETS STORED IN D:/NYAYA AI/CORE/DATA${NC}"
echo -e "${PURPLE}─────────────────────────────────────────────────────────────────────────────${NC}"
