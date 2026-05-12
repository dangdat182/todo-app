# ✅ Todo App — Microservices Architecture

Web app quản lý công việc với kiến trúc microservice, React frontend, Node.js backend, MongoDB và Redis.

## 🏗️ Kiến trúc

```
┌─────────────────────────────────────────────────────┐
│                     Nginx (port 80)                  │
│              Reverse Proxy / Load Balancer           │
└──────────────┬────────────────────┬─────────────────┘
               │                    │
    ┌──────────▼──────────┐  ┌──────▼────────┐
    │    API Gateway      │  │   Frontend    │
    │    (port 3000)      │  │  React+Vite   │
    └──┬──────────────┬───┘  └───────────────┘
       │              │
┌──────▼──────┐ ┌─────▼──────────┐
│Auth Service │ │  Todo Service  │
│ (port 3001) │ │  (port 3002)   │
└──────┬──────┘ └────────┬───────┘
       │                 │
┌──────▼─────────────────▼───────┐
│         MongoDB + Redis         │
└─────────────────────────────────┘
```

## 🚀 Tính năng

- ✅ **CRUD Tasks** — Thêm, sửa, xóa, hoàn thành tasks
- 🔐 **Đăng ký/Đăng nhập** — Email/Password + Google OAuth
- 🔑 **Quên mật khẩu** — Reset qua email
- 👤 **Per-user data** — Mỗi user có dữ liệu riêng biệt
- 🔗 **Chia sẻ Tasks** — Tạo link công khai cho bạn bè xem
- 🎨 **Giao diện đẹp** — Glassmorphism dark mode
- ⚡ **Redis cache** — Tốc độ cao
- 🐳 **Docker** — Dễ deploy và mở rộng

## ⚙️ Cài đặt

### 1. Clone repo và copy env
```bash
git clone https://github.com/dangdat182/todo-app.git
cd todo-app
cp .env.example .env
```

### 2. Cấu hình `.env`
```env
# JWT (bắt buộc - đổi thành chuỗi ngẫu nhiên)
JWT_SECRET=your_super_secret_key_here
JWT_REFRESH_SECRET=another_super_secret_key

# Google OAuth (đăng ký tại console.cloud.google.com)
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxx
GOOGLE_CALLBACK_URL=http://localhost/api/auth/google/callback

# Email (dùng Gmail App Password)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_app_password_16_chars
EMAIL_FROM="Todo App <your@gmail.com>"

FRONTEND_URL=http://localhost
```

### 3. Chạy với Docker Compose
```bash
docker-compose up --build
```

Truy cập: **http://localhost**

## 🛠️ Thiết lập Google OAuth

1. Vào [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới → APIs & Services → Credentials
3. Create OAuth 2.0 Client ID → Web application
4. Authorized redirect URIs: `http://localhost/api/auth/google/callback`
5. Copy Client ID và Client Secret vào `.env`

## 📧 Thiết lập Gmail App Password

1. Bật 2-Step Verification trong Google Account
2. Vào Security → App passwords
3. Tạo app password cho "Mail"
4. Dán 16 ký tự vào `EMAIL_PASS` trong `.env`

## 💻 Chạy Development (Local)

```bash
# API Gateway
cd services/api-gateway && npm install && npm run dev

# Auth Service
cd services/auth-service && npm install && npm run dev

# Todo Service
cd services/todo-service && npm install && npm run dev

# Frontend
cd frontend && npm install && npm run dev
```

## 📡 API Endpoints

### Auth (`/api/auth/`)
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/register` | Đăng ký |
| POST | `/login` | Đăng nhập |
| POST | `/logout` | Đăng xuất |
| POST | `/refresh` | Refresh token |
| POST | `/forgot-password` | Quên mật khẩu |
| POST | `/reset-password/:token` | Đặt lại mật khẩu |
| GET | `/me` | Thông tin user |
| GET | `/google` | Google OAuth |

### Todos (`/api/todos/`) — Cần xác thực
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/` | Danh sách todos |
| POST | `/` | Tạo todo |
| PUT | `/:id` | Cập nhật todo |
| DELETE | `/:id` | Xóa todo |
| DELETE | `/bulk` | Xóa nhiều todos |
| POST | `/:id/share` | Bật/tắt chia sẻ |
| GET | `/meta/stats` | Thống kê |
| GET | `/meta/categories` | Danh sách categories |
| GET | `/shared/:token` | Xem todo được chia sẻ (public) |

## 🐳 Docker Services

| Service | Port nội bộ | Mô tả |
|---------|------------|-------|
| nginx | 80 | Reverse proxy |
| api-gateway | 3000 | API routing |
| auth-service | 3001 | Authentication |
| todo-service | 3002 | Todo CRUD |
| notification-service | 3003 | Email notifications |
| mongo | 27017 | Database |
| redis | 6379 | Cache & sessions |

## 📦 Mở rộng (Scale)

```bash
# Scale todo-service lên 3 instances
docker-compose up --scale todo-service=3

# Xem logs
docker-compose logs -f todo-service
```
