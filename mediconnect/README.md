# MEDICONNECT — On-Demand Healthcare Services Platform

MEDICONNECT is an enterprise-grade, on-demand medical services platform designed for Kenya and emerging markets. Operating like an "Uber for Healthcare," MEDICONNECT connects patients with verified doctors, nurses, laboratories, pharmacies, ambulance dispatchers, and allied health providers in real time with integrated M-Pesa mobile payments and live GPS status tracking.

---

## Key Features

### Patient Experience
- **Location-Based Provider Discovery**: Instant Haversine-based geospatial matching of verified, available medical professionals within a configurable radius.
- **Uber-Style Booking Flow**: Real-time dispatching with lifecycle status transitions (`PENDING` ➔ `ACCEPTED` ➔ `EN_ROUTE` ➔ `ARRIVED` ➔ `IN_PROGRESS` ➔ `COMPLETED`).
- **Real-Time GPS Tracking & Live Timeline**: Socket.IO powered bi-directional tracking of provider arrival time and live route updates.
- **Integrated Payments**: Native Kenya Safaricom M-Pesa (Daraja STK Push) & instant mock adapter for development/testing with automated receipts.
- **Ratings & Reviews**: Post-consultation verified reviews with provider average rating recalculation.
- **Safety First**: Prominent 24/7 national emergency banners (999 / 112) with explicit disclaimers.

### Healthcare Provider Experience
- **Onboarding & Credential Verification**: Multi-document license & credential upload pipeline with administrative verification tracking.
- **Service & Area Configuration**: Configure offered services, pricing models (`PER_VISIT`, `PER_HOUR`, `FIXED`), coverage radius, and weekly working hours.
- **Live Dispatch Dashboard**: Incoming real-time booking alerts with atomic acceptance (`SELECT FOR UPDATE` transaction protection against race conditions).
- **Earnings & Payout Ledger**: Transparent gross/net revenue breakdown with platform commission calculation (default 15%).

### Administrator & Support Dashboard
- **Operational KPI Dashboard**: Real-time tracking of active bookings, daily GMV, revenue, user signups, and pending verifications.
- **Provider Credential Review**: Medical board license approval/rejection workflows with internal audit notes.
- **User & Dispute Management**: Account suspension/activation, dispute resolution, and payment refund processing.
- **Immutable Audit Logging**: Comprehensive audit trail capturing user ID, IP address, user agent, action, and JSON diffs.
- **Dynamic Platform Settings**: Key-value runtime parameter configuration.

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, TanStack React Query v5, React Router v6, Leaflet / React-Leaflet, Lucide Icons, Socket.IO Client |
| **Backend** | Node.js, Express, TypeScript, Zod, Argon2id, JSON Web Tokens (JWT), Winston Logger, Socket.IO, Nodemailer |
| **Database** | MySQL 8.0, `mysql2` connection pool, Spatial coordinates, Transaction isolation |
| **Payments** | Safaricom M-Pesa Daraja REST API (STK Push) + Pluggable Mock Adapter |
| **DevOps** | Docker, Docker Compose, Multi-stage builds |

---

## Project Structure

```text
mediconnect/
├── docker-compose.yml              # Multi-container orchestration (MySQL + Backend + Frontend)
├── .env.example                    # Global environment template
├── docs/
│   └── er-diagram.md               # 20-table ER schema documentation & state machines
├── database/
│   ├── schema.sql                  # Complete MySQL 8 normalized DDL schema (20 tables)
│   ├── migrations/                 # Sequential numbered migration files (001-007)
│   └── seeds/
│       └── dev_seed.sql            # Realistic Kenyan healthcare seed dataset
├── backend/
│   ├── Dockerfile.dev              # Development Docker configuration
│   ├── nodemon.json                # Hot-reload configuration
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   ├── src/
│   │   ├── app.ts                  # Express application setup & middleware assembly
│   │   ├── server.ts               # HTTP & Socket.IO server initialization
│   │   ├── config/                 # Zod environment validation & Winston logging
│   │   ├── db/                     # mysql2 connection pool & query helpers
│   │   ├── middleware/             # Auth, RBAC, Validation, Error handling, Audit log
│   │   ├── modules/
│   │   │   ├── auth/               # JWT authentication & session rotation
│   │   │   ├── patients/           # Patient profiles & addresses
│   │   │   ├── providers/          # Provider search, credentials & availability
│   │   │   ├── categories/         # Medical service categories
│   │   │   ├── bookings/           # Booking state machine & atomic transaction dispatch
│   │   │   ├── payments/           # M-Pesa Daraja & Mock payment adapter pipeline
│   │   │   ├── reviews/            # Verified patient reviews & rating calculation
│   │   │   ├── notifications/      # Real-time and push notifications
│   │   │   ├── admin/              # Admin KPIs, verifications, audit logs & settings
│   │   │   └── support/            # Helpdesk support ticketing
│   │   └── sockets/                # Socket.IO authenticated rooms & dispatch events
│   └── tests/                      # Jest & Supertest integration test suite
└── frontend/
    ├── Dockerfile.dev
    ├── package.json
    ├── vite.config.ts
    ├── tailwind.config.ts
    ├── index.html
    └── src/
        ├── App.tsx                 # Master routing & Context Provider tree
        ├── main.tsx                # React DOM entrypoint
        ├── api/                    # Axios API client & typed endpoints
        ├── context/                # Auth, Socket, and Notification contexts
        ├── hooks/                  # Custom hooks (Geolocation, BookingStatus, Pagination)
        ├── utils/                  # Currency (KES), Date, Status formatters
        ├── components/
        │   ├── ui/                 # Accessible Button, Input, Modal, Badge, Spinner
        │   ├── layout/             # Header, Sidebar, EmergencyBanner, ProtectedRoute
        │   ├── booking/            # BookingCard, BookingTimeline, StatusBadge
        │   ├── map/                # Interactive Leaflet provider map
        │   └── providers/          # Provider summary cards
        └── pages/
            ├── auth/               # LandingPage, LoginPage, RegisterPage
            ├── patient/            # Dashboard, Search, Profile, Booking, Tracking, Payments
            ├── provider/           # Dashboard, Availability, Requests, Earnings, Verification
            └── admin/              # Metrics Dashboard, User Admin, Verifications, Audit Logs
```

---

## Quick Start with Docker (Recommended)

The fastest way to spin up the complete platform (MySQL 8, Backend API, and Frontend):

1. **Clone and enter repository**:
   ```bash
   cd mediconnect
   ```

2. **Configure environment**:
   ```bash
   cp backend/.env.example backend/.env
   ```

3. **Start all services with Docker Compose**:
   ```bash
   docker compose up --build
   ```

4. **Access the applications**:
   - **Frontend Web App**: [http://localhost:5173](http://localhost:5173)
   - **Backend REST API**: [http://localhost:5000/api/v1](http://localhost:5000/api/v1)
   - **MySQL Database**: `localhost:3306` (Database: `mediconnect`, User: `mediconnect_user`)

---

## Local Manual Setup

If running without Docker:

### 1. Database Setup (MySQL 8.0+)
Create the database and apply the schema and development seeds:
```bash
mysql -u root -p -e "CREATE DATABASE mediconnect CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p mediconnect < database/schema.sql
mysql -u root -p mediconnect < database/seeds/dev_seed.sql
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MySQL credentials and JWT secrets
npm run dev
```
The API server will launch on `http://localhost:5000`.

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The Vite development server will launch on `http://localhost:5173`.

---

## Seed Data Test Accounts

All pre-seeded test accounts use the default password: **`Password123!`**

| Role | Email | Name / Description |
|---|---|---|
| **ADMIN** | `admin@mediconnect.ke` | System Administrator |
| **SUPPORT** | `support@mediconnect.ke` | Customer Support Specialist |
| **PATIENT** | `amina.ochieng@gmail.com` | Amina Ochieng (Westlands, Nairobi) |
| **PATIENT** | `brian.kamau@gmail.com` | Brian Kamau (Kilimani, Nairobi) |
| **PROVIDER (Doctor)** | `dr.felix.mutua@mediconnect.ke` | Dr. Felix Mutua, MD (General Physician) |
| **PROVIDER (Nurse)** | `nurse.grace.njoki@mediconnect.ke` | Grace Njoki, RN (Home Care & Injections) |
| **PROVIDER (Ambulance)** | `dispatch@er-ambulance.co.ke` | Emergency Response Ambulance Kenya |
| **PROVIDER (Laboratory)** | `support@pathlab.co.ke` | PathCare Laboratory Nairobi |
| **PROVIDER (Pharmacy)** | `info@medipharm.co.ke` | MediPharm Home Delivery |

---

## Key REST API Endpoints

All endpoints are versioned under `/api/v1`:

### Authentication & Profiles
- `POST /api/v1/auth/register` — Register as PATIENT or PROVIDER
- `POST /api/v1/auth/login` — Authenticate and receive JWT access token
- `POST /api/v1/auth/refresh` — Rotate access token
- `GET /api/v1/auth/me` — Retrieve active authenticated user session
- `GET /api/v1/patients/profile` — Get patient profile and saved addresses
- `GET /api/v1/providers` — Search providers using lat/lng coordinates and category filter

### Bookings (Uber-Style Workflow)
- `POST /api/v1/bookings` — Request an immediate or scheduled service
- `GET /api/v1/bookings/:id` — Retrieve booking details and real-time status
- `PATCH /api/v1/bookings/:id/accept` — Provider atomically claims booking (`SELECT FOR UPDATE`)
- `PATCH /api/v1/bookings/:id/status` — Advance booking state (`EN_ROUTE`, `ARRIVED`, `IN_PROGRESS`)
- `PATCH /api/v1/bookings/:id/complete` — Finalize appointment and trigger payment receipt
- `PATCH /api/v1/bookings/:id/cancel` — Cancel appointment per cancellation rules

### Payments & M-Pesa
- `POST /api/v1/payments/initiate` — Initiate M-Pesa STK Push or Mock instant completion
- `POST /api/v1/payments/webhook` — Async callback handler for Daraja IPN
- `GET /api/v1/payments/:id` — Retrieve verified payment record & receipt

### Administration
- `GET /api/v1/admin/dashboard` — Platform operational metrics & activity feed
- `GET /api/v1/admin/users` — Paginated user management with status toggles
- `PATCH /api/v1/admin/providers/:id/verification` — Approve or reject medical license
- `GET /api/v1/admin/audit-logs` — Immutable audit trail

---

## Safety & Emergency Notice

> [!WARNING]
> **MEDICONNECT is an on-demand medical booking platform and is NOT a substitute for national emergency dispatch services.**
> In life-threatening emergencies, patients must immediately dial **999** or **112** (Kenya Police / Emergency) or direct ambulance dispatch at **0800 723 253**.
