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
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for the local PostgreSQL database)
- [Expo CLI](https://docs.expo.dev/get-started/installation/): `npm i -g expo-cli`
- A [Cloudinary](https://cloudinary.com/) account (image uploads)
- A [Firebase](https://firebase.google.com/) project (push notifications)

### Install & Run

```bash
# 1. Install all workspace dependencies
npm install

# 2. Configure environment variables
cp backend/.env.example backend/.env
# → fill in JWT secret, Cloudinary & Firebase credentials
# → DATABASE_URL is pre-filled for the Docker Compose database below

# 3. Start the database
docker compose up -d

# 4. Run DB migrations
cd backend && npx prisma migrate dev --name init

# 5. Start everything in separate terminals
cd backend    && npm run dev        # API on http://localhost:3001
cd backoffice && npm run dev        # Backoffice on http://localhost:5173
cd mobile     && npm start          # Expo dev server
```

### Database (Docker)

The `docker-compose.yml` at the repo root runs **PostgreSQL 16** locally.

| | |
|---|---|
| Host | `localhost:5432` |
| Database | `malamia_db` |
| User | `malamia` |
| Password | `malamia_secret` |

```bash
docker compose up -d      # start (data persists in Docker volume)
docker compose stop       # stop (data is kept)
docker compose down -v    # destroy including all data
```

> The `DATABASE_URL` in `backend/.env` is already set to these credentials.

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
