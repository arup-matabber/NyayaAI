#!/bin/bash

# start_engine.sh
# Description: Activates the virtual environment and starts the Nyaya AI FastAPI engine.

GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}===================================================================${NC}"
echo -e "${GREEN}                BOOTING NYAYA AI ENGINE SERVER                 ${NC}"
echo -e "${BLUE}===================================================================${NC}"

# Navigate to script's directory securely
cd "$(dirname "$0")" || { echo -e "${RED}[ERROR] Failed to navigate to directory${NC}"; exit 1; }

export PYTHONPATH="$(pwd)"

if [ ! -d "core/nyaya-env" ]; then
    echo -e "${RED}[ERROR] Virtual environment 'core/nyaya-env' not found!${NC}"
    echo "Please execute './setup.sh' to initialize the environment."
    exit 1
fi

echo -e "${BLUE}[+] Activating virtual environment...${NC}"
if [ -f "core/nyaya-env/Scripts/activate" ]; then
    source core/nyaya-env/Scripts/activate
elif [ -f "core/nyaya-env/bin/activate" ]; then
    source core/nyaya-env/bin/activate
else
    echo -e "${RED}[ERROR] Activation script not found inside nyaya-env!${NC}"
    exit 1
fi

echo -e "${GREEN}[+] Starting FastAPI Engine...${NC}"
echo -e "${BLUE}Note: The Engine will automatically proxy the local LLMs via the WSL Bridge.${NC}"
python -m core.engine.server
