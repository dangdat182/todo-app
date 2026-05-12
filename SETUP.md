# Hướng dẫn cấu hình & chạy Todo App

> Stack: React · Node.js · MongoDB · Redis · Docker · Microservices

---

## Yêu cầu hệ thống

| Phần mềm | Phiên bản tối thiểu | Tải về |
|---|---|---|
| Docker Desktop | 4.x | https://www.docker.com/products/docker-desktop |
| Node.js *(chỉ cần nếu chạy local)* | 20.x LTS | https://nodejs.org |
| Git | bất kỳ | https://git-scm.com |

> **Chạy bằng Docker là cách nhanh nhất** — không cần cài Node.js, MongoDB, Redis thủ công.

---

## Bước 1 — Tạo file `.env`

Sao chép file mẫu:

```bash
cp .env.example .env
```

Mở `.env` và điền đầy đủ các giá trị theo hướng dẫn bên dưới.

---

## Bước 2 — Cấu hình JWT Secret

Mở `.env`, thay hai dòng sau bằng chuỗi ngẫu nhiên dài ≥ 32 ký tự:

```env
JWT_SECRET=thay_bang_chuoi_ngau_nhien_it_nhat_32_ky_tu_bat_ky
JWT_REFRESH_SECRET=thay_bang_chuoi_khac_cung_it_nhat_32_ky_tu
```

**Cách tạo nhanh trên terminal:**

```bash
# Linux / macOS
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"

# Windows PowerShell
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Chạy lệnh 2 lần, lấy 2 chuỗi khác nhau cho `JWT_SECRET` và `JWT_REFRESH_SECRET`.

---

## Bước 3 — Cấu hình Google OAuth (Đăng nhập Google)

### 3.1 — Tạo Google Cloud Project

1. Truy cập **https://console.cloud.google.com/**
2. Nhấn **"Select a project"** → **"New Project"**
3. Đặt tên project (ví dụ: `todo-app`) → **"Create"**

### 3.2 — Bật Google OAuth API

1. Menu trái → **"APIs & Services"** → **"Library"**
2. Tìm **"Google+ API"** → **"Enable"**  
   *(hoặc tìm "Google Identity" → "Enable")*

### 3.3 — Tạo OAuth Credentials

1. Menu trái → **"APIs & Services"** → **"Credentials"**
2. Nhấn **"+ Create Credentials"** → **"OAuth client ID"**
3. Nếu chưa cấu hình, nhấn **"Configure Consent Screen"**:
   - Chọn **"External"** → **"Create"**
   - **App name**: `Todo App`
   - **User support email**: email của bạn
   - **Developer contact email**: email của bạn
   - Nhấn **"Save and Continue"** qua hết các bước → **"Back to Dashboard"**
4. Quay lại **"Credentials"** → **"+ Create Credentials"** → **"OAuth client ID"**
5. **Application type**: `Web application`
6. **Name**: `Todo App Web`
7. **Authorized JavaScript origins**: thêm
   ```
   http://localhost
   ```
8. **Authorized redirect URIs**: thêm
   ```
   http://localhost/api/auth/google/callback
   ```
9. Nhấn **"Create"**
10. Copy **Client ID** và **Client Secret**

### 3.4 — Điền vào `.env`

```env
GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxx
GOOGLE_CALLBACK_URL=http://localhost/api/auth/google/callback
```

---

## Bước 4 — Cấu hình Email (Gửi mail reset mật khẩu, welcome)

### Dùng Gmail (khuyến nghị)

> Gmail yêu cầu **App Password** khi bật 2FA — **KHÔNG** dùng mật khẩu Gmail thông thường.

#### 4.1 — Bật 2-Step Verification trên Gmail

1. Truy cập **https://myaccount.google.com/security**
2. Phần **"How you sign in to Google"** → **"2-Step Verification"** → Bật lên

#### 4.2 — Tạo App Password

1. Truy cập **https://myaccount.google.com/apppasswords**
2. **"App name"**: nhập `Todo App` → nhấn **"Create"**
3. Copy mật khẩu 16 ký tự được hiển thị (dạng: `xxxx xxxx xxxx xxxx`)

#### 4.3 — Điền vào `.env`

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx
EMAIL_FROM="Todo App <your_gmail@gmail.com>"
```

> **Lưu ý**: Giữ nguyên dấu ngoặc kép cho `EMAIL_FROM`.

### Dùng dịch vụ email khác (tùy chọn)

| Dịch vụ | HOST | PORT |
|---|---|---|
| Gmail | `smtp.gmail.com` | `587` |
| Outlook / Hotmail | `smtp-mail.outlook.com` | `587` |
| Yahoo Mail | `smtp.mail.yahoo.com` | `587` |
| Brevo (Sendinblue) | `smtp-relay.brevo.com` | `587` |
| Mailgun | `smtp.mailgun.org` | `587` |

---

## Bước 5 — Cấu hình Frontend URL

```env
FRONTEND_URL=http://localhost
```

> Giữ nguyên giá trị này khi chạy local. Khi deploy lên server thật, đổi thành domain thực của bạn (ví dụ: `https://yourdomain.com`).

---

## Bước 6 — File `.env` hoàn chỉnh

Sau khi điền xong, file `.env` trông như sau:

```env
# JWT
JWT_SECRET=a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6ab12
JWT_REFRESH_SECRET=z9y8x7w6v5u4z9y8x7w6v5u4z9y8x7w6v5u4z9y8x7w6v5u4z9y8x7w6v5u4ef

# Google OAuth
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-AbCdEfGhIjKlMnOpQrStUv
GOOGLE_CALLBACK_URL=http://localhost/api/auth/google/callback

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=youremail@gmail.com
EMAIL_PASS=abcd efgh ijkl mnop
EMAIL_FROM="Todo App <youremail@gmail.com>"

# Frontend
FRONTEND_URL=http://localhost
```

---

## Bước 7 — Chạy ứng dụng bằng Docker

### Lần đầu (build + chạy)

```bash
docker-compose up --build
```

> Lần đầu mất **3–8 phút** để build image. Các lần sau chỉ mất vài giây.

### Chạy ở chế độ nền (background)

```bash
docker-compose up --build -d
```

### Kiểm tra ứng dụng

Mở trình duyệt → truy cập **http://localhost**

### Các lệnh Docker hữu ích

```bash
# Xem logs tất cả services
docker-compose logs -f

# Xem logs của một service cụ thể
docker-compose logs -f auth-service
docker-compose logs -f todo-service
docker-compose logs -f api-gateway

# Dừng ứng dụng
docker-compose down

# Dừng và xóa toàn bộ dữ liệu (database, redis)
docker-compose down -v

# Restart một service
docker-compose restart todo-service

# Scale todo-service (chạy 3 instances)
docker-compose up --scale todo-service=3 -d
```

---

## Bước 8 — Chạy local (Development mode)

> Dùng khi muốn code và thấy thay đổi ngay lập tức (hot reload).

### Yêu cầu thêm

- MongoDB đang chạy tại `localhost:27017`
- Redis đang chạy tại `localhost:6379`

Cách nhanh nhất là chỉ chạy MongoDB và Redis bằng Docker, còn services chạy local:

```bash
# Khởi động chỉ MongoDB và Redis
docker-compose up mongo redis -d
```

### Cài dependencies cho từng service

```bash
# Terminal 1 — API Gateway
cd services/api-gateway
npm install
npm run dev

# Terminal 2 — Auth Service
cd services/auth-service
npm install
npm run dev

# Terminal 3 — Todo Service
cd services/todo-service
npm install
npm run dev

# Terminal 4 — Notification Service
cd services/notification-service
npm install
npm run dev

# Terminal 5 — Frontend
cd frontend
npm install
npm run dev
```

### Tạo file `.env` cho từng service khi chạy local

Tạo file `.env` trong **mỗi thư mục service** với nội dung tương ứng:

**`services/api-gateway/.env`**
```env
PORT=3000
JWT_SECRET=<giống file .env gốc>
AUTH_SERVICE_URL=http://localhost:3001
TODO_SERVICE_URL=http://localhost:3002
NOTIFICATION_SERVICE_URL=http://localhost:3003
REDIS_URL=redis://localhost:6379
FRONTEND_URL=http://localhost:5173
```

**`services/auth-service/.env`**
```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/todo_auth
REDIS_URL=redis://localhost:6379
JWT_SECRET=<giống file .env gốc>
JWT_REFRESH_SECRET=<giống file .env gốc>
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
GOOGLE_CLIENT_ID=<giống file .env gốc>
GOOGLE_CLIENT_SECRET=<giống file .env gốc>
GOOGLE_CALLBACK_URL=http://localhost:5173/api/auth/google/callback
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=<email của bạn>
EMAIL_PASS=<app password>
EMAIL_FROM="Todo App <email của bạn>"
FRONTEND_URL=http://localhost:5173
```

**`services/todo-service/.env`**
```env
PORT=3002
MONGODB_BASE_URI=mongodb://localhost:27017
REDIS_URL=redis://localhost:6379
JWT_SECRET=<giống file .env gốc>
FRONTEND_URL=http://localhost:5173
```

**`services/notification-service/.env`**
```env
PORT=3003
REDIS_URL=redis://localhost:6379
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=<email của bạn>
EMAIL_PASS=<app password>
EMAIL_FROM="Todo App <email của bạn>"
```

### Truy cập khi chạy local

- Frontend: **http://localhost:5173**
- API Gateway: **http://localhost:3000**

---

## Cấu trúc Database

Khi chạy, MongoDB sẽ tự động tạo các database sau:

| Database | Mục đích |
|---|---|
| `todo_auth` | Lưu thông tin tài khoản người dùng |
| `todo_global` | Lưu index token chia sẻ (shared todos) |
| `todo_user_<userId>` | Database riêng của **từng user** — lưu todos |

> Ví dụ: User có ID `abc123` sẽ có database `todo_user_abc123`. Dữ liệu hoàn toàn tách biệt giữa các user.

---

## Kiểm tra hoạt động

Sau khi ứng dụng khởi động, kiểm tra health check:

```bash
# API Gateway
curl http://localhost/api/health

# Kết quả mong đợi:
# {"status":"ok","service":"api-gateway","timestamp":"..."}
```

Hoặc truy cập **http://localhost/api/health** trên trình duyệt.

---

## Xử lý lỗi thường gặp

### Lỗi: Port 80 đang bị dùng

```bash
# Tìm process đang dùng port 80 (Windows)
netstat -ano | findstr :80

# Dừng process (thay PID bằng số thực)
taskkill /PID <PID> /F
```

### Lỗi: `docker-compose` không tìm thấy

```bash
# Dùng lệnh thay thế (Docker Desktop mới)
docker compose up --build
```

### Lỗi: MongoDB không kết nối được

```bash
# Kiểm tra container MongoDB có đang chạy không
docker-compose ps

# Xem logs MongoDB
docker-compose logs mongo
```

### Lỗi: Google OAuth redirect_uri_mismatch

Kiểm tra lại **Authorized redirect URIs** trong Google Console phải khớp chính xác với `GOOGLE_CALLBACK_URL` trong `.env`:
- Chạy Docker: `http://localhost/api/auth/google/callback`
- Chạy local: `http://localhost:5173/api/auth/google/callback` *(và cập nhật trong Google Console)*

### Lỗi: Email không gửi được

1. Kiểm tra `EMAIL_PASS` là **App Password** (16 ký tự), không phải mật khẩu Gmail thông thường
2. Đảm bảo **2-Step Verification** đã bật trên tài khoản Gmail
3. Kiểm tra không có dấu cách thừa trong file `.env`

### Reset toàn bộ dữ liệu

```bash
docker-compose down -v
docker-compose up --build
```

---

## Deploy lên Server (VPS/Cloud)

Khi deploy lên server thật, cần thay đổi:

1. **File `.env`** — đổi tất cả `http://localhost` thành domain thật:
   ```env
   GOOGLE_CALLBACK_URL=https://yourdomain.com/api/auth/google/callback
   FRONTEND_URL=https://yourdomain.com
   ```

2. **Google Console** — thêm domain thật vào:
   - Authorized JavaScript origins: `https://yourdomain.com`
   - Authorized redirect URIs: `https://yourdomain.com/api/auth/google/callback`

3. **HTTPS** — dùng Nginx + Certbot để cấp SSL (Let's Encrypt)

4. **Chạy ứng dụng:**
   ```bash
   docker-compose up -d --build
   ```

---

## Tổng quan kiến trúc

```
Browser
   │
   ▼
[Nginx :80]
   ├── /          ──► [Frontend React]
   └── /api/*     ──► [API Gateway :3000]
                           ├── /api/auth/*   ──► [Auth Service :3001]  ──► MongoDB (todo_auth)
                           └── /api/todos/*  ──► [Todo Service :3002]  ──► MongoDB (todo_user_*)
                                                                        └── [Notification :3003]
                                                   Redis ◄── Token cache, pub/sub
```

---

*Nếu gặp vấn đề không giải quyết được, hãy chạy `docker-compose logs -f` để xem log chi tiết.*
