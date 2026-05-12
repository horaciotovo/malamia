# 🚀 Malamia - Easy Deployment Guide

This guide will help you deploy and run the entire Malamia application stack with minimal setup.

## Quick Start (2 minutes)

### Option 1: Docker Compose (Recommended) 🐳

**Prerequisites:**
- Docker Desktop installed and running
- Port 3001, 5173, 5432 available

**One Command to Start Everything:**

```bash
# Navigate to project root
cd malamia

# Start all services (PostgreSQL, Backend, Backoffice)
docker-compose up

# Or run in background
docker-compose up -d
```

That's it! Your app will be available at:
- **Backoffice Admin:** http://localhost:5173
- **Backend API:** http://localhost:3001/api
- **Database:** localhost:5432

---

### Option 2: Local Development (Manual) 🖥️

If you prefer to run services locally without Docker:

#### Step 1: Start PostgreSQL Database
```bash
# Using Docker
docker run --name postgres -e POSTGRES_PASSWORD=malamia_secret -e POSTGRES_DB=malamia_db -p 5432:5432 -d postgres:16-alpine
```

#### Step 2: Start Backend (in Terminal 1)
```bash
cd backend
npm install
npm run dev
```

Backend runs on: `http://localhost:3001`

#### Step 3: Start Backoffice (in Terminal 2)
```bash
cd backoffice
npm install
npm start
```

Backoffice runs on: `http://localhost:5173`

#### Step 4: Start Mobile (in Terminal 3)
```bash
cd mobile
npm install
npm start
```

Mobile runs with Expo - scan QR code with Expo Go app

---

## 📱 Mobile App (Expo Go) Setup

1. **Install Expo Go** on your phone (iOS/Android)
2. **Scan QR Code** from terminal running `npm start` in mobile folder
3. Login with: `htovoadmin@gmail.com` / `admin123456`

> **Note:** For testing on mobile devices/emulators, update `mobile/src/services/api.ts` to use your computer's IP instead of `localhost`

---

## 🔧 Environment Variables

### Backend (`.env`)
Already configured with defaults. Key variables:
```
DATABASE_URL=postgresql://malamia:malamia_secret@localhost:5432/malamia_db
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
```

### Backoffice
Uses `VITE_API_URL` environment variable (defaults to `http://localhost:3001/api`)

---

## 🛑 Stopping Services

### Docker Compose:
```bash
# Stop all containers
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### Local Services:
- Press `Ctrl+C` in each terminal

---

## 🗄️ Database Commands

### Run Migrations:
```bash
cd backend
npm run db:migrate
```

### Seed Database:
```bash
cd backend
npm run db:seed
```

### View Database with Prisma Studio:
```bash
cd backend
npm run db:studio
```

### Reset Admin Password:
```bash
cd backend
node scripts/reset-password.js <email> <new-password>
```

Example:
```bash
node scripts/reset-password.js htovoadmin@gmail.com admin123456
```

---

## 👥 Admin Credentials

Default admin user (created during seed):
- **Email:** `htovoadmin@gmail.com`
- **Password:** `admin123456`

List all admins:
```bash
cd backend
node scripts/list-admins.js
```

Promote user to admin:
```bash
cd backend
node scripts/promote-admin.js <email>
```

---

## 🐛 Troubleshooting

### Backend won't start
```bash
cd backend
npm install
npm run build
npm run db:generate
```

### Backoffice shows blank page
1. Check browser console for errors
2. Ensure backend is running on port 3001
3. Clear browser cache: `Cmd+Shift+Delete` (Chrome/Firefox)

### Mobile app can't connect
1. Update `mobile/src/services/api.ts` with your computer's IP (check with `ipconfig`)
2. Reload Expo app
3. Ensure backend is running

### Database connection error
```bash
# Check if PostgreSQL container is running
docker ps | grep postgres

# Or restart
docker-compose restart postgres
```

---

## 📋 Project Structure

```
malamia/
├── backend/          # Express API (port 3001)
├── backoffice/       # React Admin Panel (port 5173)
├── mobile/           # React Native Expo App
├── docker-compose.yml
└── README.md
```

---

## 🚢 Production Deployment

For production, you'll want to:
1. Use environment-specific `.env` files
2. Add reverse proxy (Nginx)
3. Enable HTTPS/SSL
4. Set up database backups
5. Configure cloud storage (Cloudinary)
6. Set up monitoring & logging

See `DEPLOYMENT_PRODUCTION.md` for detailed production setup.

---

## 📞 Support

If you encounter issues:
1. Check logs: `docker-compose logs -f <service-name>`
2. Verify all ports are available
3. Ensure Docker Desktop is running
4. Check network connectivity

Happy deploying! 🎉
