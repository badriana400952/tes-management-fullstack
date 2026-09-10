# Sistem Manajemen Tugas (Task Management Fullstack Monorepo)

Aplikasi manajemen tugas (Task Management) siap produksi yang dibangun menggunakan Node.js, Express, Prisma ORM, PostgreSQL, Next.js (Pages Router), Redux Toolkit, dan Tailwind CSS.

---

## Cara Menjalankan Project

### 1. Clone Repository
```bash
git clone https://github.com/badriana400952/tes-management-fullstack.git
cd tes-management-fullstack
```

### 2. Install Dependensi
Anda dapat menginstal dependensi langsung di root monorepo atau di masing-masing folder aplikasi:

```bash
# Menginstal di root workspace
pnpm install
# atau menggunakan npm:
npm install
```

Atau masuk ke masing-masing folder sub-aplikasi:
```bash
# Backend
cd apps/backend
npm install
cd ../..

# Frontend
cd apps/frontend
npm install
cd ../..
```

### 3. Konfigurasi Variabel Lingkungan (Environment Variables)
- Backend:
  Salin file .env.example yang ada di folder apps/backend:
  ```bash
  cp apps/backend/.env.example apps/backend/.env
  ```
- Frontend:
  Salin file .env.example yang ada di folder apps/frontend:
  ```bash
  cp apps/frontend/.env.example apps/frontend/.env.local
  ```

### 4. Migrasi Database
Jalankan migrasi database Prisma di folder apps/backend:
```bash
cd apps/backend
npx prisma migrate dev --name init
cd ../..
```

---

## Cara Menjalankan Aplikasi

Jalankan server backend dan frontend di terminal terpisah:

### Menjalankan Backend
```bash
cd apps/backend
npm run dev
# REST API berjalan di http://localhost:5000
```

### Menjalankan Frontend
```bash
cd apps/frontend
npm run dev
# Tampilan Frontend berjalan di http://localhost:3000
```

Tips Cepat: Anda juga dapat menjalankannya langsung dari root project:
```bash
pnpm dev:backend   # Menjalankan Backend
pnpm dev:frontend  # Menjalankan Frontend
```

---

## Cara Menjalankan Docker

Untuk menjalankan seluruh layanan (database PostgreSQL, Backend API, dan Frontend UI) di dalam kontainer Docker:

```bash
# Build dan jalankan seluruh container
docker compose up --build
```

Akses layanan:
- Aplikasi Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Dokumentasi Swagger API: http://localhost:5000/api-docs

Untuk menghentikan kontainer:
```bash
docker compose down
```

---

## Cara Login / Akun Uji Coba

Anda dapat membuat akun baru melalui halaman register, atau masuk menggunakan akun uji coba berikut:
```json
{
  "email": "badri@example.com",
  "password": "password123"
}
```

---

## Daftar Endpoint API

Semua endpoint berada di bawah alamat dasar http://localhost:5000 dengan path awalan /api/v1.

### 1. Publik (Tanpa Perlu Login)

| Method | Path | Body / Keterangan |
| :--- | :--- | :--- |
| POST | /api/v1/auth/register | { "email": "alice@example.com", "name": "Alice", "password": "password123" } |
| POST | /api/v1/auth/login | { "email", "password" } -> mengatur cookie accessToken + refreshToken (HttpOnly). Batasan request: 10 per 15 menit |
| POST | /api/v1/auth/refresh-token | Tanpa body; membutuhkan cookie refreshToken -> rotasi pembaruan token baru |
| POST | /api/v1/auth/logout | Membutuhkan cookie refreshToken -> menghapus sesi cookie |

### 2. Autentikasi Terproteksi

| Method | Path | Body / Query |
| :--- | :--- | :--- |
| GET | /api/v1/auth/me | Tanpa body; membutuhkan cookie accessToken atau header Authorization: Bearer <token> |

### 3. Manajemen Tugas (Membutuhkan Auth Cookie / Bearer Token)

| Method | Path | Body / Query |
| :--- | :--- | :--- |
| GET | /api/v1/tasks | Query: page=1, limit=10, status=TODO/IN_PROGRESS/DONE, search=..., sortBy=createdAt/updatedAt/dueDate/priority/title, sortOrder=asc/desc |
| POST | /api/v1/tasks | { "title": "Belajar Express", "description": "opsional", "status": "TODO", "priority": "MEDIUM", "dueDate": "2026-09-20T00:00:00.000Z" } (field status, priority, dueDate bersifat opsional) |
| GET | /api/v1/tasks/:id | Mengambil data tugas spesifik berdasarkan ID (contoh: /api/v1/tasks/cm...) |
| PUT | /api/v1/tasks/:id | Minimal mengisi 1 field: { "title", "description", "status", "priority", "dueDate" } (semua opsional, pembaruan parsial) |
| PATCH | /api/v1/tasks/:id/status | { "status": "IN_PROGRESS" } (Pilihan status: TODO / IN_PROGRESS / DONE) |
| DELETE | /api/v1/tasks/:id | Tanpa body -> Menghapus tugas |

---

## Menjalankan Pengujian (Unit & Integration Test)

Untuk menjalankan seluruh unit test dan integration test pada backend:
```bash
cd apps/backend
npm test
```