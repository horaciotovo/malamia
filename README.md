# Malamia — Premium Mobile Commerce Platform

A full-stack mobile commerce solution with a customer-facing React Native app and a separate web admin backoffice.

## Brand
- **Colors**: Black & Pink
- **Style**: Modern, elegant, premium, feminine

## Architecture

```
malamia/
├── mobile/              # React Native (Expo) — Customer iOS & Android app
├── backoffice/          # React + Vite — Web Admin Panel
├── backend/             # Node.js + Express + Prisma — REST API
└── docker-compose.yml   # PostgreSQL 16 via Docker
```

## Quick Start

### Prerequisites
- Node.js >= 18
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (running)
- [Expo CLI](https://docs.expo.dev/get-started/installation/): `npm i -g expo-cli`
- A [Cloudinary](https://cloudinary.com/) account (image uploads)
- A [Firebase](https://firebase.google.com/) project (push notifications)

### Deploy the App (2 steps)

#### Step 1: Start Backend + Database + Backoffice
```bash
# From project root
docker-compose up --build
```

This starts:
- 🗄️ **PostgreSQL** database (port 5432)
- 🔌 **Backend API** (port 3001) — http://localhost:3001/api
- 📊 **Backoffice Admin** (port 5173) — http://localhost:5173

**First time only:** Database will auto-migrate and seed sample data.

#### Step 2: Start Mobile App (in new terminal)
```bash
cd mobile
npm install  # if needed
npm start
```

Then:
1. Scan the **QR code** with **Expo Go** app on your phone
2. Login with default credentials:
   - Email: `htovoadmin@gmail.com`
   - Password: `admin123456`

---

### That's it! 🎉

| Service | URL | Status |
|---------|-----|--------|
| 📊 Backoffice | http://localhost:5173 | Running in Docker |
| 🔌 Backend API | http://localhost:3001/api | Running in Docker |
| 📱 Mobile App | Scan QR code | Running locally |
| 🗄️ Database | localhost:5432 | Running in Docker |

---

### Configuration

**First time setup:**
```bash
# Copy env template (optional)
cp .env.example .env

# Add your Cloudinary & Firebase credentials to:
# backend/.env (for image uploads and push notifications)
```

**Stop all services:**
```bash
docker-compose down
```

**View logs:**
```bash
docker-compose logs -f
```

### Database (Docker)

The `docker-compose.yml` runs **PostgreSQL 16** automatically.

| Property | Value |
|---|---|
| Host | `localhost:5432` |
| Database | `malamia_db` |
| User | `malamia` |
| Password | `malamia_secret` |

**Database commands:**
```bash
# View all running services
docker-compose ps

# Access database with psql
docker-compose exec postgres psql -U malamia -d malamia_db

# View data with Prisma Studio
docker-compose exec backend npm run db:studio

# Seed database with sample data
docker-compose exec backend npm run db:seed

# Reset database (delete all data)
docker-compose down -v
docker-compose up
```

---

### User Management

**List all admin users:**
```bash
docker-compose exec backend node scripts/list-admins.js
```

**Reset admin password:**
```bash
docker-compose exec backend node scripts/reset-password.js <email> <password>
# Example:
docker-compose exec backend node scripts/reset-password.js htovoadmin@gmail.com admin123456
```

**Promote user to admin:**
```bash
docker-compose exec backend node scripts/promote-admin.js <email>
```

---

## Tech Stack

### Mobile App (React Native / Expo)
| Tech | Purpose |
|---|---|
| Expo ~51 | Cross-platform toolchain |
| React Navigation 6 | Stack + Tab navigation |
| Zustand 4 | State management |
| Axios | HTTP client |
| Expo Notifications | Push notifications |
| Expo Linear Gradient | Premium UI gradients |
| React Native Reanimated 3 | Smooth animations |

### Backoffice (React web)
| Tech | Purpose |
|---|---|
| React 18 + Vite | UI + build |
| React Router 6 | Routing |
| Zustand | State management |
| Axios | HTTP client |
| Tailwind CSS | Styling |
| Recharts | Analytics charts |

### Backend (Node.js)
| Tech | Purpose |
|---|---|
| Express 4 | REST framework |
| Prisma 5 | ORM |
| PostgreSQL | Primary database |
| JWT | Authentication |
| bcrypt | Password hashing |
| Multer + Cloudinary | Image uploads |
| Firebase Admin | Push notifications |

---

## Features

### Customer Mobile App
- Authentication (login / register)
- Home screen with hero banner & featured products
- Product catalog with search & category filters
- Product detail with image gallery
- Shopping cart
- Order placement & history
- User profile
- Push notifications inbox
- Loyalty points dashboard & leaderboard

### Admin Backoffice
- Secure admin login
- Dashboard with KPIs
- Product management (create / edit / delete + image upload)
- Price updates (triggers push notification automatically)
- Customer list with points & purchase history
- Push notification center (manual sends)
- Loyalty & ranking management

---

## Data Models

### User
```ts
{ id, email, firstName, lastName, phone, avatar, role, loyaltyPoints, createdAt }
```

### Product
```ts
{ id, name, description, price, compareAtPrice, categoryId, images[], stock, isPublished, isFeatured, tags[], createdAt }
```

### Order
```ts
{ id, userId, items[], totalAmount, status, createdAt }
```

### Loyalty Transaction
```ts
{ id, userId, points, reason, orderId, createdAt }
```

### Notification
```ts
{ id, title, body, type, data, isRead, createdAt }
```

---

## API Overview

Base: `http://localhost:3001/api`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Customer register |
| POST | `/auth/login` | Customer login |
| POST | `/auth/admin/login` | Admin login |
| GET | `/products` | List products |
| POST | `/products` | Create product (admin) |
| PUT | `/products/:id` | Update product (admin) |
| DELETE | `/products/:id` | Delete product (admin) |
| GET/POST | `/cart` | Cart operations |
| POST | `/orders` | Place order |
| GET | `/loyalty/my-points` | User points |
| GET | `/loyalty/leaderboard` | Top clients |
| POST | `/notifications/send` | Send push (admin) |

---

## Folder Structure

```
mobile/src/
├── components/ui/     # Reusable primitive components
├── components/        # Feature components (ProductCard, CartItem, …)
├── navigation/        # React Navigation setup
├── screens/           # One folder per feature
├── services/          # API calls, notifications
├── store/             # Zustand stores
├── theme/             # Colors, typography, spacing
└── types/             # Shared TypeScript interfaces

backoffice/src/
├── components/        # Layout, Sidebar, Header, ui/
├── pages/             # One folder per admin module
├── services/          # API calls
├── store/             # Auth store
└── types/             # Shared interfaces

backend/src/
├── middleware/        # Auth, upload, error handler
├── routes/            # Express routers
├── services/          # Business logic
└── types/             # Shared interfaces
```

---

## Phased Implementation Plan

### Phase 1 — Foundation (Week 1–2)
- [x] Project scaffold & monorepo setup
- [x] Database schema & Prisma migrations
- [x] Auth endpoints (register, login, JWT refresh)
- [x] Product CRUD endpoints
- [x] Mobile: auth screens, navigation shell

### Phase 2 — Core Commerce (Week 3–4)
- [x] Product catalog & detail screens
- [x] Cart & order endpoints
- [x] Cart & checkout flow in mobile
- [x] Backoffice: product management + image upload

### Phase 3 — Loyalty & Notifications (Week 5)
- [x] Loyalty points engine
- [x] Leaderboard endpoint
- [x] Push notification service
- [x] Mobile: loyalty screen, notifications inbox
- [x] Backoffice: notification center

### Phase 4 — Polish & Ship (Week 6)
- [ ] Animations, loading states, error states
- [ ] Performance optimisation
- [ ] E2E QA on iOS & Android
- [ ] Backoffice analytics dashboard
- [ ] App Store / Play Store submission prep

---

## License
Private — Malamia © 2026
