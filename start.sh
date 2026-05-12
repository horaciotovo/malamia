#!/bin/bash
# Malamia Application Startup Script
# This script starts all services: PostgreSQL, Backend, and Backoffice

set -e

RESET='\033[0m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${RESET}"
echo -e "${BLUE}║         🌸 Malamia Application Startup Script 🌸        ║${RESET}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${RESET}"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo -e "${YELLOW}⚠️  Docker is not running. Please start Docker Desktop.${RESET}"
  exit 1
fi

# Change to script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo -e "\n${BLUE}📦 Starting Docker Compose Services...${RESET}"
echo "   • PostgreSQL Database (port 5432)"
echo "   • Backend API (port 3001)"
echo "   • Backoffice Admin (port 5173)"

docker-compose up -d

echo -e "\n${GREEN}✅ Services started!${RESET}"
echo -e "\n${BLUE}🌐 Available at:${RESET}"
echo "   📊 Backoffice Admin: ${GREEN}http://localhost:5173${RESET}"
echo "   🔌 Backend API:      ${GREEN}http://localhost:3001/api${RESET}"
echo "   🗄️  Database:         ${GREEN}localhost:5432${RESET}"

echo -e "\n${BLUE}👤 Default Credentials:${RESET}"
echo "   Email:    htovoadmin@gmail.com"
echo "   Password: admin123456"

echo -e "\n${BLUE}📱 Mobile App (Expo):${RESET}"
echo "   Terminal: cd mobile && npm start"
echo "   Then scan QR code with Expo Go app"

echo -e "\n${BLUE}🔍 View Logs:${RESET}"
echo "   All services:  docker-compose logs -f"
echo "   Specific:      docker-compose logs -f <backend|backoffice|postgres>"

echo -e "\n${BLUE}🛑 Stop Services:${RESET}"
echo "   docker-compose down"

echo -e "\n${YELLOW}💡 Tip: Keep this terminal open to see logs${RESET}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${RESET}\n"

# Keep showing logs
docker-compose logs -f
