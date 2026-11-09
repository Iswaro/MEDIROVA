# 🏥 MediConnect — On-Demand Medical Services Platform

> An Uber-style platform connecting patients with verified doctors, nurses, labs, pharmacies, ambulances and other healthcare providers in real time.

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18 · Vite · TypeScript · Tailwind CSS · React Router · Axios · Socket.IO client · Leaflet maps |
| **Backend** | Node.js · Express · TypeScript · Socket.IO · JWT (access + refresh tokens) · Zod validation |
| **Database** | MySQL 8 · mysql2 connection pool · 20 normalized tables · UUIDs · spatial indexes |
| **Auth** | Bcrypt password hashing · Role-based access control (PATIENT / PROVIDER / ADMIN / SUPPORT) |
| **Payments** | M-Pesa (Daraja sandbox) · Mock adapter for dev/testing |
| **Real-time** | Socket.IO rooms per booking, provider, and admin |

---

## 📁 Project Structure

```
mediconnect/
├── backend/          Node.js + Express API (port 5000)
│   ├── src/
│   │   ├── modules/  auth · patients · providers · bookings · payments · reviews · admin · notifications · support
│   │   ├── middleware/
│   │   ├── sockets/
│   │   └── db/
│   └── dist/         compiled JS (npm run build)
├── frontend/         React + Vite UI (port 3000)
│   ├── src/
│   │   ├── pages/    patient · provider · admin · auth
│   │   ├── components/
│   │   ├── api/
│   │   ├── context/
│   │   └── types/
│   └── dist/         production build (npm run build)
├── database/
│   ├── schema.sql            full schema (single file)
│   ├── migrations/           001–007 incremental SQL files
│   └── seeds/dev_seed.sql    15 users · 8 providers · 10 bookings
└── docs/
    └── er-diagram.md
```

---

## ⚡ Quick Start

### Prerequisites
- Node.js ≥ 18
- MySQL 8 running locally
- Git

### 1. Clone

```bash
git clone https://github.com/Iswaro/MEDIROVA.git
cd MEDIROVA/mediconnect
```

### 2. Database Setup

```bash
# Log in to MySQL
mysql -u root -p

# Create the database and user
CREATE DATABASE mediconnect CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'mediconnect_user'@'localhost' IDENTIFIED BY 'mediconnect_pass';
GRANT ALL PRIVILEGES ON mediconnect.* TO 'mediconnect_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# Load schema and seed data
mysql -u mediconnect_user -pmediconnect_pass mediconnect < database/schema.sql
mysql -u mediconnect_user -pmediconnect_pass mediconnect < database/seeds/dev_seed.sql
```

### 3. Backend

```bash
cd backend
cp .env.example .env        # then edit .env with your values
npm install
npm run build               # compiles TypeScript → dist/
npm run dev                 # hot-reload dev server on :5000
# OR for production:
node dist/server.js
```

### 4. Frontend

```bash
cd frontend
cp .env.example .env        # set VITE_API_URL=http://localhost:5000/api/v1
npm install
npm run dev                 # Vite dev server on :3000
# OR production build:
npm run build               # output → dist/
```

---

## 🔑 Seed Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@mediconnect.ke | Password123! |
| Patient | patient1@example.com | Password123! |
| Doctor | dr.amina@mediconnect.ke | Password123! |
| Nurse | nurse.grace@mediconnect.ke | Password123! |

---

## 🗂️ API Reference

Base URL: `http://localhost:5000/api/v1`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Register patient or provider |
| POST | `/auth/login` | Login → access + refresh tokens |
| POST | `/auth/refresh` | Refresh access token |
| GET | `/auth/me` | Current user profile |
| GET | `/categories` | List service categories |
| GET | `/providers` | Search providers (filter by category, location) |
| GET | `/providers/:id` | Provider detail + services + reviews |
| POST | `/bookings` | Create booking (PENDING) |
| GET | `/bookings/:id` | Booking detail + status history |
| POST | `/bookings/:id/accept` | Provider accepts booking |
| POST | `/bookings/:id/status` | Update booking status (state machine) |
| POST | `/payments` | Initiate payment (M-Pesa / MOCK) |
| POST | `/payments/webhook` | M-Pesa callback |
| GET | `/admin/dashboard` | Admin metrics |
| PATCH | `/admin/providers/:id/verification` | Approve / reject provider |

---

## 🗺️ Booking State Machine

```
PENDING → ACCEPTED → EN_ROUTE → ARRIVED → IN_PROGRESS → COMPLETED
       ↘ REJECTED
       ↘ CANCELLED_BY_PATIENT
       ↘ CANCELLED_BY_PROVIDER
       ↘ EXPIRED
```

Invalid transitions are rejected at the API level.

---

## 🌍 User Roles & Dashboards

- **Patient** — browse services, book, track in real time, pay, review
- **Provider** — accept/reject requests, update status, manage availability & earnings
- **Admin** — verify credentials, manage users, view reports & audit logs
- **Support** — handle tickets and complaints

---

## ⚠️ Emergency Disclaimer

> MediConnect is **not** an emergency dispatch service.
> For life-threatening emergencies call **999** (Kenya Police), **0800 723 999** (Emergency), or your nearest hospital.

---

## 📄 License

MIT © 2024 MediConnect Team
