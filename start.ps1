# Malamia Application Startup Script (PowerShell for Windows)
# This script starts all services: PostgreSQL, Backend, and Backoffice

$ErrorActionPreference = "Stop"

function Write-Header {
    param([string]$text)
    Write-Host ""
    Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║         🌸 Malamia Application Startup Script 🌸        ║" -ForegroundColor Cyan
    Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
}

function Write-Success {
    param([string]$text)
    Write-Host $text -ForegroundColor Green
}

function Write-Info {
    param([string]$text)
    Write-Host $text -ForegroundColor Cyan
}

function Write-Warning {
    param([string]$text)
    Write-Host $text -ForegroundColor Yellow
}

Write-Header

# Check if Docker is running
Write-Info "🔍 Checking Docker..."
try {
    docker info > $null
} catch {
    Write-Warning "⚠️  Docker is not running. Please start Docker Desktop."
    exit 1
}

Write-Success "✅ Docker is running"

# Get script directory
$ScriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptPath

Write-Info "`n📦 Starting Docker Compose Services..."
Write-Host "   • PostgreSQL Database (port 5432)"
Write-Host "   • Backend API (port 3001)"
Write-Host "   • Backoffice Admin (port 5173)"
Write-Host ""

docker-compose up

Write-Host ""
Write-Success "✅ Services started!"

Write-Info "`n🌐 Available at:"
Write-Host "   📊 Backoffice Admin: " -NoNewline
Write-Host "http://localhost:5173" -ForegroundColor Green
Write-Host "   🔌 Backend API:      " -NoNewline
Write-Host "http://localhost:3001/api" -ForegroundColor Green
Write-Host "   🗄️  Database:         " -NoNewline
Write-Host "localhost:5432" -ForegroundColor Green

Write-Info "`n👤 Default Credentials:"
Write-Host "   Email:    htovoadmin@gmail.com"
Write-Host "   Password: admin123456"

Write-Info "`n📱 Mobile App (Expo):"
Write-Host "   Terminal: cd mobile && npm start"
Write-Host "   Then scan QR code with Expo Go app"

Write-Info "`n🔍 View Logs:"
Write-Host "   All services:  docker-compose logs -f"
Write-Host "   Specific:      docker-compose logs -f <backend|backoffice|postgres>"

Write-Info "`n🛑 Stop Services:"
Write-Host "   docker-compose down"

Write-Warning "`n💡 Tip: Keep this terminal open to see logs"
Write-Host "═══════════════════════════════════════════════════════`n"
