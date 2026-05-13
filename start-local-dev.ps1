#!/usr/bin/env pwsh
# start-local-dev.ps1 - Easy setup for local iPhone access

Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "  Malamia Local Dev Setup with iPhone" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Get local IP
Write-Host "[*] Finding your machine's local IP address..." -ForegroundColor Yellow
$ipInfo = ipconfig | Select-String -Pattern "IPv4 Address"
$ipLine = $ipInfo[0] -split ": "
$localIp = $ipLine[-1].Trim()

if (-not $localIp) {
    Write-Host "[ERROR] Could not find local IP address" -ForegroundColor Red
    Write-Host "        Run 'ipconfig' manually and find your IPv4 Address" -ForegroundColor Gray
    exit 1
}

Write-Host "[OK] Found IP: $localIp" -ForegroundColor Green
Write-Host ""

# Step 2: Create/Update .env.local
Write-Host "[*] Creating .env.local..." -ForegroundColor Yellow

# Build the env file content with proper escaping
$envLines = @(
    "# Auto-generated for local development",
    "# Generated IP: $localIp",
    "",
    "BACKEND_PORT=3001",
    'DATABASE_URL=postgresql://malamia:malamia_secret@postgres:5432/malamia_db?schema=public&sslmode=disable',
    "NODE_ENV=development",
    "JWT_SECRET=dev_secret_key_change_in_production",
    "JWT_REFRESH_SECRET=dev_refresh_secret_key_change_in_production",
    "CLOUDINARY_CLOUD_NAME=",
    "CLOUDINARY_API_KEY=",
    "CLOUDINARY_API_SECRET=",
    "FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json",
    "",
    "ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3001,http://localhost:80,https://localhost,http://${localIp},http://${localIp}:80,http://${localIp}:3001,http://${localIp}:5173",
    "",
    "BACKOFFICE_PORT=5173",
    "VITE_API_URL=http://${localIp}/api",
    "",
    "DB_USER=malamia",
    "DB_PASSWORD=malamia_secret",
    "DB_NAME=malamia_db",
    "DB_PORT=5432",
    "",
    "MOBILE_API_URL=http://${localIp}/api"
)

$envLines -join [Environment]::NewLine | Out-File -FilePath ".env.local" -Encoding UTF8 -Force
Write-Host "[OK] Created .env.local" -ForegroundColor Green
Write-Host ""

# Step 3: Inform about mobile setup
Write-Host "[INFO] Mobile App Setup (Optional)" -ForegroundColor Cyan
Write-Host "       If using Expo/React Native, update mobile/src/services/api.ts:" -ForegroundColor Gray
Write-Host "       return 'http://${localIp}:3001/api';" -ForegroundColor Gray
Write-Host ""

# Step 4: Start services
Write-Host "[*] Starting Docker services..." -ForegroundColor Yellow
Write-Host "    Command: docker-compose -f docker-compose.yml -f docker-compose.local.yml up -d" -ForegroundColor Gray
Write-Host ""

docker-compose -f docker-compose.yml -f docker-compose.local.yml up -d

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Failed to start Docker services" -ForegroundColor Red
    Write-Host "        Make sure Docker Desktop is running" -ForegroundColor Gray
    exit 1
}

Write-Host ""
Write-Host "[OK] Services started! Waiting for startup..." -ForegroundColor Green
Start-Sleep -Seconds 3

# Check status
Write-Host ""
Write-Host "[STATUS] Service Status:" -ForegroundColor Cyan
docker-compose ps

Write-Host ""
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "          SUCCESS! Ready to use!" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "[MOBILE] Access from iPhone:" -ForegroundColor Green
Write-Host "         Open Safari and go to: http://${localIp}" -ForegroundColor White
Write-Host ""
Write-Host "[LOCAL] Local access:" -ForegroundColor Green
Write-Host "        Backoffice: http://localhost:5173" -ForegroundColor White
Write-Host "        API: http://localhost:3001/api" -ForegroundColor White
Write-Host ""
Write-Host "[DOCS] Documentation:" -ForegroundColor Cyan
Write-Host "       See LOCAL_DEPLOYMENT.md for detailed instructions" -ForegroundColor Gray
Write-Host ""
Write-Host "[STOP] To stop services:" -ForegroundColor Yellow
Write-Host "       docker-compose -f docker-compose.yml -f docker-compose.local.yml down" -ForegroundColor Gray
Write-Host ""
