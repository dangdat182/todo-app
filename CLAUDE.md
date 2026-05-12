# Todo App — Project Summary

> **Auto-maintained by Claude Code.** Updated after every code modification.
> Last updated: 2026-05-02

---

## Architecture Overview

```
Browser
  └─ Nginx (port 80)
      ├─ /          ──> React Frontend (Vite, port 5173 in dev)
      └─ /api/*     ──> API Gateway (Express, port 3000)
                        ├─ /api/auth/*  ──> Auth Service (port 3001)
                        │                  └─ MongoDB: todo_auth
                        └─ /api/todos/* ──> Todo Service (port 3002)
                                           └─ MongoDB: todo_global + todo_user_<userId>

         Notification Service (port 3003) — async via Redis pub/sub → Nodemailer
```

### Services

| Service | Port | Responsibility |
|---|---|---|
| `nginx` | 80 | Reverse proxy, static file serving |
| `api-gateway` | 3000 | JWT verification, rate limiting, request proxying |
| `auth-service` | 3001 | Register, login, Google OAuth, password reset |
| `todo-service` | 3002 | Todo CRUD, sharing, per-user DB management |
| `notification-service` | 3003 | Redis subscriber → Nodemailer email sending |
| `mongo` | 27017 | MongoDB 6.0 |
| `redis` | 6379 | Redis 7 alpine |

---

## Tech Stack

### Frontend (`frontend/`)
- **React 18.2** + **Vite 5.0**
- **React Router DOM 6.21** — client-side routing
- **Axios 1.6** — HTTP client with auto token injection & 401 refresh
- **React Hot Toast 2.4** — notifications
- **Phosphor Icons 2.0**, **date-fns 3.0**

### Backend (all services: Node.js / Express 4.18)
- **Mongoose 8.0** — MongoDB ODM
- **JWT** (jsonwebtoken 9.0) — access tokens (15m) + refresh tokens (7d)
- **Passport 0.7** — local + Google OAuth strategies
- **bcryptjs 2.4** — password hashing
- **ioredis 5.3** — Redis client
- **Nodemailer 6.9** — email delivery
- **Helmet 7.1**, **CORS 2.8**, **express-validator 7.0**

### Infrastructure
- **Docker + Docker Compose** — containerization
- **MongoDB** — multi-database pattern (per-user isolation)
- **Redis** — token blacklisting, pub/sub, rate limiting

---

## Database Design

### Multi-database pattern

| Database | Purpose |
|---|---|
| `todo_auth` | All user accounts (auth-service) |
| `todo_global` | shareToken → userId index (todo-service) |
| `todo_user_<userId>` | Isolated todo data per user (dynamic, LRU-cached, max 200 connections) |

### Schemas

**User** (`todo_auth`)
```
name, email (unique), password (bcrypt, hidden), googleId (sparse),
avatar, isVerified, resetPasswordToken, resetPasswordExpires,
refreshTokens [String] (max 5 — device limit), timestamps
```

**Todo** (`todo_user_*`)
```
userId, title (max 200), description (max 2000), completed,
priority (low/medium/high), category, dueDate, tags [],
shareToken (unique sparse), shareEnabled, sharedWithEmails [],
timestamps
Indexes: { userId+createdAt }, { userId+completed }, { userId+category }
```

---

## Key Features

- Email/password registration & login
- Google OAuth 2.0
- Email-based password reset (1h expiry)
- Per-user MongoDB database isolation
- Todo CRUD with priority, category, due date, tags
- Todo sharing via public share tokens
- JWT access + refresh token rotation (5-device limit)
- Token blacklisting via Redis
- Rate limiting: 500 req/15min general, 100 req/15min auth
- Async email notifications via Redis pub/sub

---

## Project Structure

```
Todo_app/
├── CLAUDE.md                  # This file
├── README.md                  # Vietnamese user docs
├── SETUP.md                   # Vietnamese setup guide
├── .env / .env.example        # Environment config
├── docker-compose.yml         # 7-service orchestration
├── nginx/nginx.conf           # Reverse proxy config
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx            # Routing (PrivateRoute, GuestRoute)
│   │   ├── context/AuthContext.jsx   # Global auth state
│   │   ├── services/api.js    # Axios instance + interceptors
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── ForgotPasswordPage.jsx
│   │   │   ├── ResetPasswordPage.jsx
│   │   │   ├── DashboardPage.jsx     # Main todo UI
│   │   │   ├── SharedTodoPage.jsx    # Public share view
│   │   │   └── AuthCallbackPage.jsx  # OAuth redirect handler
│   │   └── components/
│   │       ├── TodoModal.jsx  # Create/edit todo
│   │       └── ShareModal.jsx # Share settings
│   ├── Dockerfile
│   ├── vite.config.js
│   └── nginx.conf             # Frontend container nginx
│
└── services/
    ├── api-gateway/src/index.js          # Proxy + JWT verify + rate limit
    ├── auth-service/src/
    │   ├── controllers/authController.js # All auth logic
    │   ├── models/User.js
    │   ├── routes/auth.js
    │   ├── middleware/auth.js
    │   ├── services/emailService.js      # Publishes to Redis
    │   └── config/passport.js / redis.js
    ├── todo-service/src/
    │   ├── controllers/todoController.js # CRUD + share + stats
    │   ├── models/Todo.js
    │   ├── routes/todos.js
    │   └── config/dbManager.js / globalDb.js / redis.js
    └── notification-service/src/index.js # Redis sub → send email
```

---

## Environment Variables (keys only)

```
JWT_SECRET, JWT_REFRESH_SECRET
GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL
EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, EMAIL_FROM
FRONTEND_URL
```

Docker Compose also sets:
```
NODE_ENV, PORT (per service), MONGODB_URI, MONGODB_BASE_URI,
REDIS_URL, AUTH_SERVICE_URL, TODO_SERVICE_URL, NOTIFICATION_SERVICE_URL,
JWT_EXPIRE=15m, JWT_REFRESH_EXPIRE=7d
```

---

## Running the App

```bash
# Full stack (Docker)
docker-compose up -d

# Local dev (frontend + backend services separately, only DB via Docker)
docker-compose up -d mongo redis
cd frontend && npm install && npm run dev
# start each service: cd services/<name> && npm install && npm run dev

# Logs
docker-compose logs -f <service-name>

# Stop
docker-compose down
```

---

## API Endpoints

### Auth (`/api/auth`)
| Method | Path | Description |
|---|---|---|
| POST | `/register` | Create account |
| POST | `/login` | Login, returns tokens |
| POST | `/logout` | Invalidate refresh token |
| POST | `/refresh` | Rotate refresh token |
| GET | `/google` | Start Google OAuth |
| GET | `/google/callback` | OAuth redirect handler |
| POST | `/forgot-password` | Send reset email |
| POST | `/reset-password/:token` | Reset password |
| GET | `/me` | Get current user |

### Todos (`/api/todos`)
| Method | Path | Description |
|---|---|---|
| GET | `/` | List todos (filter, search, paginate) |
| POST | `/` | Create todo |
| GET | `/:id` | Get single todo |
| PUT | `/:id` | Update todo |
| DELETE | `/:id` | Delete todo |
| POST | `/:id/share` | Enable/disable share link |
| GET | `/shared/:token` | View shared todo (public) |
| GET | `/stats` | Todo statistics |

---

## Change Log

| Date | Change |
|---|---|
| 2026-05-02 | Initial CLAUDE.md created — project in initial state |
