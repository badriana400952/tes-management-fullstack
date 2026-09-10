
# Technical Test – Full Stack JavaScript Developer (Middle)

## Durasi

Maksimal **3 x 24 jam** sejak soal diterima.

---

# Studi Kasus

Anda diminta membuat sebuah aplikasi **Task Management** yang terdiri dari:

* Backend REST API menggunakan **Node.js + Express**
* Frontend menggunakan **React** (atau framework JavaScript modern lain seperti Next.js diperbolehkan)
* Database **PostgreSQL**

Aplikasi harus dapat dijalankan menggunakan **Docker Compose** dan source code diunggah ke **GitHub/GitLab**.

---

# Teknologi

### Backend

* Node.js
* Express.js
* PostgreSQL
* JWT Authentication

### Frontend

Bebas menggunakan salah satu:

* React
* Next.js

---

# Functional Requirements

## 1. Authentication

Implementasikan:

* Register
* Login
* Logout (client-side diperbolehkan)

Password harus di-hash dan autentikasi menggunakan JWT.

---

## 2. Task Management

Setelah login, user dapat:

* Melihat daftar task miliknya
* Menambahkan task
* Mengubah task
* Menghapus task
* Mengubah status task

Task minimal memiliki:

* Title
* Description
* Status

Status:

* TODO
* DONE

Setiap user hanya boleh mengakses task miliknya sendiri.

---

# Frontend

Buat tampilan sederhana yang terdiri dari:

### Halaman Login

* Form Login
* Validasi sederhana
* Menyimpan token setelah login

---

### Dashboard

Menampilkan:

* Daftar Task
* Tombol Add Task
* Tombol Edit
* Tombol Delete
* Tombol Change Status

---

### Form Task

Minimal terdapat:

* Title
* Description
* Status

---

### UX

Minimal memiliki:

* Loading indicator saat request API
* Pesan error apabila request gagal
* Konfirmasi sebelum menghapus task

Desain UI tidak menjadi fokus penilaian. Tampilan sederhana dan mudah digunakan sudah mencukupi.

---

# Database

Gunakan PostgreSQL.

Silakan mendesain tabel sesuai kebutuhan.

---

# Docker

Project harus dapat dijalankan menggunakan:

```bash
docker compose up --build
```

Minimal terdapat service:

* frontend
* backend
* postgres

---

# Git Repository

Upload seluruh source code ke GitHub/GitLab.

Mohon gunakan commit yang wajar selama proses pengerjaan.

---

# README

README minimal berisi:

* Cara menjalankan project
* Cara menjalankan Docker
* Daftar endpoint API
* Cara login
* Cara menjalankan aplikasi

---

# Bonus (Opsional)

Nilai tambahan diberikan apabila mengimplementasikan salah satu atau lebih fitur berikut:

* Pagination
* Search Task
* Unit Test
* Swagger / OpenAPI
* ESLint + Prettier
* GitHub Actions
* Dark Mode
* Responsive Layout

Fitur bonus **tidak wajib**.

---

# Penilaian

Aspek yang akan dinilai:

| Aspek                                               | Bobot |
| --------------------------------------------------- | ----: |
| Backend (API, JWT, Database)                        |   40% |
| Frontend (React, State Management, API Integration) |   30% |
| Struktur Project & Clean Code                       |   10% |
| Docker                                              |   10% |
| Git & README                                        |   10% |

---

# Pengumpulan

Silakan mengirimkan:

* Link repository GitHub/GitLab
* (Opsional) Link Postman Collection

---

# Catatan

Penggunaan AI (ChatGPT, Copilot, Claude, Gemini, dan sejenisnya) diperbolehkan sebagai alat bantu.

Pada tahap technical interview, kandidat diharapkan mampu menjelaskan:

* Struktur project
* Arsitektur aplikasi
* Alur autentikasi
* Integrasi Frontend dan Backend
* Keputusan teknis yang diambil
* Potongan kode yang telah dibuat

Ketidakmampuan menjelaskan implementasi dapat menjadi pertimbangan dalam proses evaluasi.

