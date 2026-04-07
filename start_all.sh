#!/bin/bash

# start_all.sh
# Description: Starts both the Engine and the Frontend simultaneously

GREEN='\033[0;32m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${PURPLE}===================================================================${NC}"
echo -e "${CYAN}                  STARTING FULL NYAYA AI SUITE                 ${NC}"
echo -e "${PURPLE}===================================================================${NC}"

cd "$(dirname "$0")" || exit 1

# Make scripts executable
chmod +x start_engine.sh start_frontend.sh

# Start Engine in background
echo -e "${BLUE}[1/2] Spinning up Engine Server...${NC}"
./start_engine.sh &
ENGINE_PID=$!

# Wait 3 seconds to let Engine grab Port 8000 and initialize LLM proxy
sleep 3

# Start Frontend in foreground
echo -e "${BLUE}[2/2] Spinning up React Client...${NC}"
./start_frontend.sh

# If frontend exits (user presses Ctrl+C), kill the engine gracefully
kill $ENGINE_PID
echo -e "${GREEN}[+] Shut down sequence completed.${NC}"
