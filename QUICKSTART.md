# 📚 Quick Reference Guide

## 🚀 Fastest Startup (One Command)

```bash
# PowerShell (Windows)
.\start.ps1

# Bash (Mac/Linux)
./start.sh

# Or manually
docker-compose up
```

---

## 📊 Common Commands

### Start Services
```bash
# Start all services in background
docker-compose up -d

# Start and watch logs
docker-compose up

# Rebuild images and start
docker-compose up --build
```

### Stop Services
```bash
# Stop containers (keeps data)
docker-compose stop

# Stop and remove containers
docker-compose down

# Stop and remove everything including volumes
docker-compose down -v
```

### View Status
```bash
# List running containers
docker-compose ps

# View logs
docker-compose logs

# Watch logs in real-time
docker-compose logs -f

# Logs for specific service
docker-compose logs -f backend
```

---

## 🗄️ Database Management

### Connect to Database
```bash
# Using psql
psql -h localhost -U malamia -d malamia_db

# Password: malamia_secret
```

### Run Migrations
```bash
# From root directory (with Docker running)
docker-compose exec backend npm run db:migrate

# Or manually in terminal
cd backend && npm run db:migrate
```

### Seed Database
```bash
docker-compose exec backend npm run db:seed
```

### View Database with Prisma Studio
```bash
docker-compose exec backend npm run db:studio
```

### Reset Database
```bash
# Remove volume to reset (delete all data)
docker-compose down -v
docker-compose up
```

---

## 👤 User Management

### View All Admins
```bash
docker-compose exec backend node scripts/list-admins.js
```

### Reset Admin Password
```bash
docker-compose exec backend node scripts/reset-password.js <email> <password>

# Example
docker-compose exec backend node scripts/reset-password.js htovoadmin@gmail.com admin123456
```

### Promote User to Admin
```bash
docker-compose exec backend node scripts/promote-admin.js <email>
```

---

## 🧹 Cleanup

### Remove Unused Containers
```bash
docker container prune
```

### Remove Unused Images
```bash
docker image prune
```

### Remove Everything (careful!)
```bash
docker system prune
```

---

## 🔍 Debugging

### Check Service Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f postgres
docker-compose logs -f backoffice
```

### Execute Commands in Container
```bash
# Run npm commands in backend
docker-compose exec backend npm list

# Check backend health
docker-compose exec backend npm run build

# Connect to database from backend container
docker-compose exec backend psql $DATABASE_URL
```

### Rebuild Specific Service
```bash
docker-compose up --build backend
docker-compose up --build backoffice
```

---

## 📱 Mobile Testing

### Get Your Computer's IP
```powershell
# PowerShell
ipconfig | findstr "IPv4"

# Or use this specific IP
# Used in: mobile/src/services/api.ts
# And: mobile/src/screens/admin/AdminProductsScreen.tsx
```

### Update Mobile API URLs
Edit files:
- `mobile/src/services/api.ts` → `getBackendUrl()`
- `mobile/src/screens/admin/AdminProductsScreen.tsx` → `getBackofficeUrl()`

Change `localhost` to your IP (e.g., `192.168.0.3`)

### Start Mobile
```bash
cd mobile
npm install
npm start

# Scan QR code with Expo Go app
```

---

## 🌐 Accessing Services

| Service | Local | IP-based |
|---------|-------|----------|
| Backoffice Admin | http://localhost:5173 | http://192.168.0.3:5173 |
| Backend API | http://localhost:3001 | http://192.168.0.3:3001 |
| Database | localhost:5432 | 192.168.0.3:5432 |

---

## 💡 Tips

1. **Keep a terminal open** showing logs while developing
2. **Use `.env` file** to customize ports without editing docker-compose.yml
3. **Rebuild when code changes** in backend or backoffice aren't reflected
4. **Check port availability** before starting: `netstat -ano | findstr "3001"`
5. **Database backups** - volumes are stored in `postgres_data/`

---

## 📞 Troubleshooting

### "Port already in use"
```bash
# Find what's using the port
netstat -ano | findstr "5173"

# Or change port in .env
BACKOFFICE_PORT=5174
```

### "Cannot connect to database"
```bash
# Check postgres container is running
docker-compose ps

# View postgres logs
docker-compose logs postgres

# Restart postgres
docker-compose restart postgres
```

### "Backend won't start"
```bash
# Check logs
docker-compose logs backend

# Rebuild
docker-compose up --build backend

# Check dependencies
docker-compose exec backend npm list
```

---

## 🔗 Links

- [Deployment Guide](./DEPLOYMENT.md)
- [Backend README](./backend/README.md)
- [Backoffice README](./backoffice/README.md)
- [Mobile README](./mobile/README.md)
- [Role-Based Access Guide](./ROLE_BASED_ACCESS_GUIDE.md)
