@echo off
REM Malamia Application Commands (Windows Batch)
REM Usage: cmd.bat [command] [arguments]

if "%1"=="" (
    goto help
)

if "%1"=="up" goto up
if "%1"=="down" goto down
if "%1"=="logs" goto logs
if "%1"=="build" goto build
if "%1"=="reset-db" goto reset-db
if "%1"=="seed" goto seed
if "%1"=="migrate" goto migrate
if "%1"=="admin-list" goto admin-list
if "%1"=="admin-promote" goto admin-promote
if "%1"=="admin-reset-password" goto admin-reset-password
if "%1"=="help" goto help

echo Unknown command: %1
goto help

:help
echo.
echo  ^╔════════════════════════════════════════════════════════^╗
echo  ^║          ^(c^) Malamia Project Commands - Windows         ^║
echo  ^║                                                          ^║
echo  ^║  Usage: cmd.bat [command] [arguments]                   ^║
echo  ^╚════════════════════════════════════════════════════════^╝
echo.
echo  Commands:
echo.
echo    General:
echo      up                   Start all services
echo      down                 Stop all services
echo      logs                 Show logs from all services
echo      build                Rebuild all containers
echo.
echo    Database:
echo      migrate              Run database migrations
echo      seed                 Seed database with sample data
echo      reset-db             Reset database ^(WARNING: deletes data^)
echo.
echo    Admin Users:
echo      admin-list           List all admin users
echo      admin-promote EMAIL  Promote user to admin
echo      admin-reset-password EMAIL PASSWORD  Reset admin password
echo.
echo  Examples:
echo    cmd.bat up
echo    cmd.bat admin-promote user@example.com
echo    cmd.bat admin-reset-password htovoadmin@gmail.com admin123456
echo.
goto :eof

:up
echo.
echo [*] Starting services...
docker-compose up -d
echo [+] Services started
echo     Backoffice: http://localhost:5173
echo     Backend API: http://localhost:3001
goto :eof

:down
echo.
echo [*] Stopping services...
docker-compose down
echo [+] Services stopped
goto :eof

:logs
echo.
echo [*] Showing logs...
docker-compose logs -f
goto :eof

:build
echo.
echo [*] Building containers...
docker-compose up --build -d
echo [+] Containers built and started
goto :eof

:migrate
echo.
echo [*] Running migrations...
docker-compose exec backend npm run db:migrate
goto :eof

:seed
echo.
echo [*] Seeding database...
docker-compose exec backend npm run db:seed
goto :eof

:reset-db
echo.
echo [!] WARNING: This will delete all database data!
set /p confirm="Are you sure? (y/N): "
if /i "%confirm%"=="y" (
    echo [*] Resetting database...
    docker-compose down -v
    docker-compose up -d
    timeout /t 10
    docker-compose exec backend npm run db:migrate
    docker-compose exec backend npm run db:seed
    echo [+] Database reset complete
) else (
    echo [*] Cancelled
)
goto :eof

:admin-list
echo.
echo [*] Listing admin users...
docker-compose exec backend node scripts/list-admins.js
goto :eof

:admin-promote
if "%2"=="" (
    echo Error: Email not specified
    echo Usage: cmd.bat admin-promote user@example.com
    goto :eof
)
echo.
echo [*] Promoting user to admin...
docker-compose exec backend node scripts/promote-admin.js %2
goto :eof

:admin-reset-password
if "%2"=="" (
    echo Error: Email not specified
    echo Usage: cmd.bat admin-reset-password email@example.com password123
    goto :eof
)
if "%3"=="" (
    echo Error: Password not specified
    echo Usage: cmd.bat admin-reset-password email@example.com password123
    goto :eof
)
echo.
echo [*] Resetting password...
docker-compose exec backend node scripts/reset-password.js %2 %3
goto :eof

:eof
