# 🎬 Movie Review System — Full-Stack MERN

A production-ready, resume-level Movie Review platform with role-based access (Admin & User), Redis caching, BullMQ email queues, Cloudinary image uploads, and JWT authentication.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Node.js + Express (ES Modules) |
| Database | MongoDB + Mongoose |
| Auth | JWT (access token 15m + refresh token 7d in httpOnly cookie) |
| Cache | Redis + ioredis |
| Queue | BullMQ |
| Email | Nodemailer |
| Uploads | Multer + Cloudinary |
| Validation | Zod |
| API Docs | Swagger UI (OpenAPI 3.0) |
| HTTP Client | Axios + TanStack Query |
| Charts | Recharts |

---

## 📁 Project Structure

```
movie-review-app/
├── client/          # React + Vite frontend
└── server/          # Node + Express backend
```

---

## ⚙️ Environment Variables

Copy `.env.example` → `.env` in the `server/` directory and fill in:

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 5000) |
| `NODE_ENV` | `development` or `production` |
| `MONGO_URI` | MongoDB connection string |
| `ACCESS_TOKEN_SECRET` | JWT access token secret (random string) |
| `REFRESH_TOKEN_SECRET` | JWT refresh token secret (random string) |
| `ACCESS_TOKEN_EXPIRES` | Access token TTL (default: `15m`) |
| `REFRESH_TOKEN_EXPIRES` | Refresh token TTL (default: `7d`) |
| `REDIS_URL` | Redis connection URL (default: `redis://localhost:6379`) |
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `SMTP_HOST` | SMTP server host (e.g. `smtp.gmail.com`) |
| `SMTP_PORT` | SMTP port (e.g. `587`) |
| `SMTP_USER` | SMTP username / email |
| `SMTP_PASS` | SMTP password / app password |
| `CLIENT_URL` | Frontend URL (default: `http://localhost:5173`) |

---

## 🚀 Setup & Run

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Redis (local or cloud)

### 1. Install Dependencies

```bash
# Server
cd server && npm install

# Client
cd ../client && npm install
```

### 2. Configure Environment

```bash
cp .env.example server/.env
# Edit server/.env with your values
```

### 3. Seed Database

```bash
cd server && npm run seed
# Creates: 5 genres, 10 movies, 1 admin user
# Admin: admin@moviereview.com / Admin@123
```

### 4. Run Development Servers

```bash
# Terminal 1 — Backend
cd server && npm run dev

# Terminal 2 — Frontend
cd client && npm run dev

# Terminal 3 — Email Worker (optional, requires Redis)
cd server && npm run worker
```

### 5. Access the App

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| API | http://localhost:5000/api |
| Swagger Docs | http://localhost:5000/api/docs |
| Health Check | http://localhost:5000/api/health |

---

## 🔑 Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@moviereview.com | Admin@123 |

---

## 📡 API Endpoints

### Auth (`/api/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Register new user |
| POST | `/login` | Login, returns JWT |
| POST | `/refresh-token` | Refresh access token |
| POST | `/logout` | Logout, clear cookie |
| POST | `/forgot-password` | Send reset email |
| POST | `/reset-password/:token` | Reset password |

### Movies (`/api/movies`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | Public | List movies (paginated, filterable) |
| GET | `/:id` | Public | Single movie + reviews |
| GET | `/top-rated` | Public | Top rated (Redis cached 10min) |
| GET | `/trending` | Public | Trending (Redis cached 5min) |
| POST | `/` | Admin | Create movie + poster upload |
| PUT | `/:id` | Admin | Update movie |
| DELETE | `/:id` | Admin | Delete movie |

### Reviews (`/api/reviews`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/` | User | Submit review (5/hour rate limit) |
| PUT | `/:id` | Owner | Edit own review |
| DELETE | `/:id` | Owner/Admin | Delete review |
| POST | `/:id/like` | User | Toggle like |
| GET | `/my-reviews` | User | Get own reviews |
| PATCH | `/:id/flag` | Admin | Flag/unflag review |

### Users (`/api/users`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/profile` | User | Get profile |
| PUT | `/profile` | User | Update profile + avatar |
| POST | `/watchlist/:movieId` | User | Toggle watchlist |
| GET | `/watchlist` | User | Get watchlist |

### Admin (`/api/admin`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/stats` | Platform stats |
| GET | `/users` | Paginated user list |
| PATCH | `/users/:id/ban` | Toggle user ban |
| GET | `/reviews/flagged` | Flagged reviews |
| GET | `/analytics` | 6-month analytics |

---

## 🏗️ Architecture Highlights

- **JWT Auth**: Short-lived access tokens (15m) + long-lived refresh tokens in httpOnly cookies. Auto-refresh on 401 via Axios interceptor.
- **Redis Caching**: Top-rated and trending movies cached for 10min/5min respectively. Cache invalidated on any movie mutation.
- **BullMQ**: Email jobs queued for welcome emails, password resets, and review notifications. Worker runs as a separate process.
- **Zod Validation**: All request bodies validated before reaching controllers.
- **RBAC**: Role middleware factory `requireRole('admin')` applied to admin routes.
- **Cloudinary**: Multer memory storage → stream upload. Old images deleted on update/delete.
- **Rating Recalculation**: MongoDB aggregation recomputes average rating after every review change.
