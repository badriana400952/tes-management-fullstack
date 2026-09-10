# Task Management System (Fullstack Monorepo)

A production-ready full-stack Task Management application built with **Node.js, Express, Prisma ORM, PostgreSQL, Next.js (Pages Router), Redux Toolkit, and Tailwind CSS**.

---

## 🏗️ Architecture & Tech Stack

### Monorepo Structure (`pnpm workspaces`)
```text
badriana-fullstack/
├── apps/
│   ├── backend/               # REST API (Node.js + Express + Prisma + PostgreSQL)
│   │   ├── prisma/            # Database schema & migrations
│   │   ├── src/
│   │   │   ├── config/        # Environment, Database, Swagger, Logger
│   │   │   ├── modules/       # Modular architecture (Auth, Task, Audit)
│   │   │   │   ├── auth/      # Controller, Service, Repository, Schema
│   │   │   │   ├── task/      # Controller, Service, Repository, Schema
│   │   │   │   └── audit/     # Controller, Service, Repository
│   │   │   └── shared/        # Middlewares (Auth, Error, RateLimit, Validator)
│   │   └── tests/             # Unit & Integration tests (Jest + Supertest)
│   │
│   └── frontend/              # Next.js Pages Router + Tailwind CSS
│       ├── src/
│       │   ├── components/    # Reusable UI primitives & App Layouts
│       │   ├── features/      # Feature-based logic (Auth, Task Dashboard)
│       │   ├── hooks/         # Custom hooks (useAuth, useTasks with SWR)
│       │   ├── services/      # Axios client with auto-refresh token interceptor
│       │   ├── stores/        # Redux Toolkit (authSlice, uiSlice)
│       │   ├── types/         # TypeScript contracts
│       │   └── pages/         # Next.js Pages Router (/login, /register, /dashboard)
│
├── docker-compose.yml         # Container orchestration (Postgres, Backend, Frontend)
├── Dockerfile.backend         # Multi-stage build for Backend
├── pnpm-workspace.yaml        # Workspace configuration
└── package.json               # Root scripts
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `>= 20.x`
- **pnpm**: `>= 9.x` or `10.x`
- **PostgreSQL**: Local instance or Docker

---

### Method 1: Run with Docker Compose (Recommended)

To run the entire system (PostgreSQL database, Backend API, and Frontend application) in isolated containers:

```bash
# Build and start all services
docker compose up --build
```

- **Frontend Application**: [http://localhost:3000](http://localhost:3000)
- **Backend REST API**: [http://localhost:5000](http://localhost:5000)
- **Swagger API Documentation**: [http://localhost:5000/api-docs](http://localhost:5000/api-docs)

---

### Method 2: Run Locally (Development Mode)

#### 1. Install Dependencies
From the repository root:
```bash
pnpm install
```

#### 2. Configure Environment Variables
- **Backend**:
  Copy the example env file in `apps/backend`:
  ```bash
  cp apps/backend/.env.example apps/backend/.env
  ```
  Adjust your `DATABASE_URL` and `DIRECT_URL` credentials.

- **Frontend**:
  Copy the example env file in `apps/frontend`:
  ```bash
  cp apps/frontend/.env.example apps/frontend/.env.local
  ```

#### 3. Database Migration
Run database migrations from `apps/backend`:
```bash
cd apps/backend
npx prisma migrate dev --name init
cd ../..
```

#### 4. Run Development Servers
You can start both backend and frontend from the root workspace:

```bash
# Start Backend (runs on port 5000)
pnpm dev:backend

# In a separate terminal, start Frontend (runs on port 3000)
pnpm dev:frontend
```

---

## 🧪 Testing

Run backend unit and integration test suites:
```bash
cd apps/backend
pnpm test
```

---

## 🛡️ Key Features

- **Authentication & Security**:
  - Secure password hashing using `bcryptjs`.
  - Dual JWT mechanism (`accessToken` + `refreshToken`) stored in HTTP-Only Cookies to mitigate XSS attacks.
  - Automatic silent token refresh via Axios response interceptors.
  - Rate limiting on sensitive endpoints (`/login`, `/refresh-token`).
- **Task Management**:
  - Full CRUD operations with search, filtering by status (`TODO`, `IN_PROGRESS`, `DONE`), sorting, and pagination.
  - Optimistic UI updates with SWR for instant responsive interactions.
- **Audit Logging**:
  - Automatically records user actions (`TASK_CREATE`, `TASK_UPDATE`, `TASK_DELETE`, `TASK_STATUS_UPDATE`) with timestamps, IP address, and changed fields.
- **Interactive Documentation**:
  - Integrated OpenAPI / Swagger documentation accessible at `/api-docs`.
