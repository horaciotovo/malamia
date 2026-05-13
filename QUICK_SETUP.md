# ⚡ Quick Setup for iPhone Access (30 seconds)

## One-Command Startup (Windows)

```powershell
.\start-local-dev.ps1
```

**Done!** The script will:
1. Find your machine's IP
2. Create `.env.local` with correct settings
3. Start all services (PostgreSQL, Backend, Backoffice, Caddy)
4. Show you the IP to use

## One-Command Startup (Mac/Linux)

```bash
chmod +x start-local-dev.sh
./start-local-dev.sh
```

---

## Access Your App

### 📱 From iPhone Safari
Open Safari and go to: **`http://YOUR_IP`**
- Example: `http://192.168.0.3`

### 💻 From Your Computer
- Backoffice: http://localhost:5173
- API: http://localhost:3001/api

---

## Stop Services

```powershell
docker-compose -f docker-compose.yml -f docker-compose.local.yml down
```

---

## Troubleshooting

**iPhone can't reach the server?**
1. Both devices on same WiFi? ✓
2. Correct IP address? Run `ipconfig` and check
3. Try without HTTPS first: `http://IP` not `https://IP`

**Need help?** See [LOCAL_DEPLOYMENT.md](./LOCAL_DEPLOYMENT.md) for full guide

---

**That's it!** 🎉
