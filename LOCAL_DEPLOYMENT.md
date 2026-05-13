# 📱 Local Deployment with iPhone Access

This guide helps you deploy Malamia **locally** with **full iPhone access** over your local network (LAN).

## 📋 Prerequisites

- Docker Desktop installed and running
- Your iPhone/device on the **same WiFi network** as your development machine
- Ports 80, 443, 3001, 5432 available on your machine

---

## 🚀 Step 1: Find Your Machine's Local IP Address

Your machine needs a **stable local IP** for iPhone access.

### Windows (PowerShell)
```powershell
ipconfig
```
Look for "IPv4 Address" under your active network connection (usually like `192.168.x.x` or `10.0.x.x`)

### Mac/Linux (Terminal)
```bash
# macOS
ifconfig | grep "inet " | grep -v 127.0.0.1

# Linux
ip addr show | grep "inet "
```

**Example Output:** `192.168.0.3` or `192.168.1.100`

> ⚠️ **Important:** Use this IP throughout the following steps. Replace `192.168.0.3` with your actual IP.

---

## 🔧 Step 2: Configure Environment Variables

1. **Copy the template:**
   ```bash
   copy .env.local.template .env.local
   # or on Mac/Linux:
   # cp .env.local.template .env.local
   ```

2. **Edit `.env.local`** and replace `192.168.0.3` with **your actual IP address**:
   ```bash
   # Update these lines:
   ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3001,https://localhost,http://YOUR_IP,http://YOUR_IP:80
   VITE_API_URL=http://YOUR_IP/api
   MOBILE_API_URL=http://YOUR_IP/api
   ```

3. **Load the environment:**
   ```bash
   # PowerShell (Windows)
   . .\.env.local
   # Or manually add variables to docker-compose.local.yml
   ```

---

## 🐳 Step 3: Start All Services with Docker Compose

Run this command from the project root:

```bash
docker-compose -f docker-compose.yml -f docker-compose.local.yml up -d
```

**What this does:**
- ✅ Starts PostgreSQL (database)
- ✅ Starts Express Backend API (port 3001)
- ✅ Starts Vite Backoffice (port 5173)
- ✅ Starts Caddy Reverse Proxy (ports 80, 443)

**Check status:**
```bash
docker-compose ps
```

**View logs:**
```bash
docker-compose logs -f backend
docker-compose logs -f backoffice
docker-compose logs -f caddy
```

---

## 📱 Step 4: Access from iPhone

### Option A: Web App (Backoffice) on iPhone Safari

1. **Open Safari on your iPhone**
2. **Navigate to:** `http://YOUR_IP`
   - Example: `http://192.168.0.3`
3. **Login** with test credentials (from your seed data)
4. You should see the backoffice dashboard

> ℹ️ For HTTPS, use `https://YOUR_IP` (may show certificate warning - tap "Continue" on iPhone)

### Option B: Mobile App (Expo) on iPhone

If you have an Expo/React Native mobile app:

1. **Update mobile API URL:**
   - Edit `mobile/src/services/api.ts`
   - Change: `return 'http://YOUR_IP:3001/api'`

2. **Start Expo server:**
   ```bash
   cd mobile
   npm install
   npm start
   ```

3. **Scan QR code** with your iPhone camera or Expo Go app

---

## 🔗 Quick Reference URLs

| Service | Local | Network |
|---------|-------|---------|
| Backoffice Web | http://localhost:5173 | http://YOUR_IP |
| Backend API | http://localhost:3001/api | http://YOUR_IP/api |
| Database | localhost:5432 | Not accessible from network |

---

## 🛑 Stopping Services

```bash
# Stop all services
docker-compose -f docker-compose.yml -f docker-compose.local.yml down

# Stop and remove data
docker-compose -f docker-compose.yml -f docker-compose.local.yml down -v
```

---

## 🐛 Troubleshooting

### iPhone Can't Reach Server
- ✅ Confirm both devices are on the **same WiFi network**
- ✅ Check your firewall isn't blocking port 80/443
- ✅ Verify the IP address is correct: `ipconfig` on Windows
- ✅ Try `http://YOUR_IP` without HTTPS first

### Backend Returns CORS Error
- Check `ALLOWED_ORIGINS` includes your IP
- Restart backend: `docker-compose restart backend`
- Verify `.env.local` is loaded

### Database Connection Error
- Check PostgreSQL is healthy: `docker-compose ps postgres`
- Verify DATABASE_URL is correct
- Check disk space: `docker system df`

### Caddy Not Routing Correctly
- Check Caddyfile syntax: `docker-compose logs caddy`
- Verify backend/backoffice are running: `docker-compose ps`
- Restart caddy: `docker-compose restart caddy`

### Performance/Slow Response
- Check Docker desktop RAM allocation (give it 4GB+ if available)
- Run `docker-compose logs backend` to check for errors
- Try accessing from Windows browser first to isolate network issues

---

## 🚨 Important Security Notes

⚠️ **This setup is for LOCAL DEVELOPMENT ONLY**

- ❌ Don't expose to the internet
- ❌ Don't use default database passwords in production
- ⚠️ Self-signed HTTPS certificates will show warnings
- ⚠️ Check your firewall rules if opening ports

---

## 📚 Additional Resources

- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [Caddy Configuration](https://caddyserver.com/docs/quick-start)
- [Expo Documentation](https://docs.expo.dev/)

