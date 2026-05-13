#!/bin/bash
# start-local-dev.sh - Easy setup for local iPhone access (Mac/Linux)

echo "╔════════════════════════════════════════════╗"
echo "║  Malamia Local Dev Setup with iPhone      ║"
echo "╚════════════════════════════════════════════╝"
echo ""

# Step 1: Get local IP
echo "📍 Finding your machine's local IP address..."

# Try different methods to get IP
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    LOCAL_IP=$(ipconfig getifaddr en0 || ipconfig getifaddr en1)
else
    # Linux
    LOCAL_IP=$(hostname -I | awk '{print $1}')
fi

if [ -z "$LOCAL_IP" ]; then
    echo "❌ Could not find local IP address"
    echo "   Run 'ifconfig' or 'ip addr show' manually"
    exit 1
fi

echo "✅ Found IP: $LOCAL_IP"
echo ""

# Step 2: Create/Update .env.local
echo "📝 Creating .env.local..."

cat > .env.local << EOF
# Auto-generated for local development
# Generated IP: $LOCAL_IP

BACKEND_PORT=3001
DATABASE_URL=postgresql://malamia:malamia_secret@postgres:5432/malamia_db?schema=public&sslmode=disable
NODE_ENV=development
JWT_SECRET=dev_secret_key_change_in_production
JWT_REFRESH_SECRET=dev_refresh_secret_key_change_in_production
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json

ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3001,http://localhost:80,https://localhost,http://$LOCAL_IP,http://$LOCAL_IP:80,http://$LOCAL_IP:3001,http://$LOCAL_IP:5173

BACKOFFICE_PORT=5173
VITE_API_URL=http://$LOCAL_IP/api

DB_USER=malamia
DB_PASSWORD=malamia_secret
DB_NAME=malamia_db
DB_PORT=5432

MOBILE_API_URL=http://$LOCAL_IP/api
EOF

echo "✅ Created .env.local"
echo ""

# Step 3: Inform about mobile setup
echo "📱 Mobile App Setup (Optional)"
echo "   If using Expo/React Native, update mobile/src/services/api.ts:"
echo "   return 'http://$LOCAL_IP:3001/api';"
echo ""

# Step 4: Start services
echo "🚀 Starting Docker services..."
echo "   Command: docker-compose -f docker-compose.yml -f docker-compose.local.yml up -d"
echo ""

docker-compose -f docker-compose.yml -f docker-compose.local.yml up -d

if [ $? -ne 0 ]; then
    echo "❌ Failed to start Docker services"
    echo "   Make sure Docker Desktop is running"
    exit 1
fi

echo ""
echo "✅ Services started! Waiting for startup..."
sleep 3

# Check status
echo ""
echo "📊 Service Status:"
docker-compose ps

echo ""
echo "╔════════════════════════════════════════════╗"
echo "║          🎉 Ready to use!                 ║"
echo "╚════════════════════════════════════════════╝"
echo ""
echo "📱 Access from iPhone:"
echo "   Open Safari and go to: http://$LOCAL_IP"
echo ""
echo "💻 Local access:"
echo "   Backoffice: http://localhost:5173"
echo "   API: http://localhost:3001/api"
echo ""
echo "📖 Documentation:"
echo "   See LOCAL_DEPLOYMENT.md for detailed instructions"
echo ""
echo "🛑 To stop services:"
echo "   docker-compose -f docker-compose.yml -f docker-compose.local.yml down"
echo ""
