#!/bin/bash

# start_frontend.sh
# Description: Starts the Nyaya AI React Client

GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}===================================================================${NC}"
echo -e "${GREEN}                 BOOTING NYAYA AI FRONTEND                     ${NC}"
echo -e "${BLUE}===================================================================${NC}"

cd "$(dirname "$0")/client" || { echo -e "${RED}[ERROR] Client directory not found!${NC}"; exit 1; }

if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}[+] Node modules not found. Installing dependencies...${NC}"
    npm install
fi

echo -e "${GREEN}[+] Starting Vite Server...${NC}"
npm run dev
