# Prottoy Vehicle Rental Management Server

Backend service for the Prottoy vehicle rental platform. The API serves the live app at [prottoy-vehicle-rental-management-s.vercel.app](https://prottoy-vehicle-rental-management-s.vercel.app/), handles authentication, manages vehicles and bookings, and keeps PostgreSQL data in sync with vehicle availability.

---

## Table of Contents

1. [Live URLs](#live-urls)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Getting Started](#getting-started)
6. [Environment Variables](#environment-variables)
7. [Database Schema](#database-schema)
8. [Authentication & Authorization](#authentication--authorization)
9. [API Reference](#api-reference)
10. [Development Notes](#development-notes)
11. [Future Enhancements](#future-enhancements)

---

## Live URLs

- **Frontend (consumes this API):** https://prottoy-vehicle-rental-management-s.vercel.app/
- **API Base URL:** `https://prottoy-vehicle-rental-management-s.vercel.app/api/v1/`
- **Health Check:** `GET /` → `200 OK` with `{ success, message }`

---

## Features

- JWT-based signup & signin with hashed passwords via `bcryptjs`.
- Role-based access control (`admin`, `customer`) enforced in shared middleware.
- Vehicle CRUD with validation around types and availability status.
- Booking creation automatically calculates total rental price and updates vehicle availability.
- Runtime PostgreSQL table bootstrap (no manual migrations required to start).
- Fully typed TypeScript codebase with Express 5 and custom typings.
- Ready for serverless deployment on Vercel (see `vercel.json`).

---

## Tech Stack

| Area             | Tools / Libraries                                           |
| ---------------- | ----------------------------------------------------------- |
| Language/runtime | Node.js, TypeScript                                        |
| Framework        | Express 5                                                  |
| Database         | PostgreSQL via `pg` connection pool                        |
| Auth & security  | `jsonwebtoken`, `bcryptjs`, RBAC middleware                |
| Utilities        | `date-fns` (date math), `dotenv` (env loading)             |
| Dev tooling      | `tsx` for TS execution, `tsconfig` strict transpilation    |
| Deployment       | Vercel serverless (routes all traffic to `dist/server.js`) |

---

## Project Structure

```
src/
├── app.ts                  # Express bootstrap + route mounting
├── server.ts               # Entry point
├── config/
│   ├── index.ts            # Loads env vars and exposes config
│   └── db.ts               # PG pool + schema initializer
├── middleware/
│   └── auth.ts             # JWT verification & role guard
├── modules/
│   ├── auth/               # Signup + signin flow
│   ├── users/              # Admin/customer user management
│   ├── vehicles/           # Vehicle CRUD operations
│   └── bookings/           # Booking lifecycle management
└── types/express/          # Extends Express.Request with `user`
```

---

## Getting Started

1. **Clone & install**
   ```bash
   git clone <repo-url>
   cd prottoy-vehicle-rental-management-server
   npm install
   ```

2. **Configure env vars** (see below).

3. **Run local server**
   ```bash
   npm run dev           # runs src/server.ts through tsx watcher
   ```
   The console should show “Database connected” and “Server started on http://localhost:<PORT>”.

4. **Deploy**
   - Compile TypeScript to `dist/` (e.g., `npx tsc` or bundler of choice).
   - Vercel will execute `dist/server.js` as defined in `vercel.json`.

---

## Environment Variables

Create `.env` (or `.env.local` for Vercel CLI) with:

```env
POSTGRESQL_STRING=postgres://user:pass@host:port/db
PORT=5000
JWT_SECRET=super-secret-value
```

`src/config/index.ts` loads `.env` and exposes these values to the rest of the app.

---

## Database Schema

Tables are created automatically by `initDB()` on startup.

### users

| Column     | Type           | Notes                               |
| ---------- | -------------- | ----------------------------------- |
| id         | SERIAL PK      |                                     |
| name       | VARCHAR(150)   | Required                            |
| email      | VARCHAR(100)   | Unique, stored lowercase            |
| password   | TEXT           | Bcrypt hash                         |
| phone      | VARCHAR(20)    | Optional                            |
| role       | VARCHAR(20)    | `admin` or `customer`               |
| created_at | TIMESTAMPTZ    | Defaults to `now()`                 |
| updated_at | TIMESTAMPTZ    | Defaults to `now()`                 |

### vehicles

| Column              | Type           | Notes                                        |
| ------------------- | -------------- | -------------------------------------------- |
| id                  | SERIAL PK      |                                              |
| vehicle_name        | VARCHAR(150)   |                                              |
| type                | VARCHAR(50)    | Allowed: `car`, `van`, `SUV`, `bike`         |
| registration_number | VARCHAR(100)   | Unique                                       |
| daily_rent_price    | DECIMAL(10,2)  | Must be ≥ 0                                  |
| availability_status | VARCHAR(20)    | Defaults to `available`                      |
| timestamps          | TIMESTAMPTZ    | `created_at`, `updated_at`                   |

### bookings

| Column        | Type           | Notes                                                         |
| ------------- | -------------- | ------------------------------------------------------------- |
| id            | SERIAL PK      |                                                               |
| customer_id   | INT FK         | References `users(id)`                                        |
| vehicle_id    | INT FK         | References `vehicles(id)`                                     |
| rent_start_date | DATE         |                                                               |
| rent_end_date | DATE           |                                                               |
| total_price   | DECIMAL(10,2)  | Calculated via `date-fns` day difference × daily rent         |
| status        | VARCHAR(20)    | `pending`, `active`, `cancelled`, `returned` per controller   |
| timestamps    | TIMESTAMPTZ    | `created_at`, `updated_at`                                    |

---

## Authentication & Authorization

- Clients authenticate via JWT tokens signed with `JWT_SECRET`.
- Tokens must be provided as `Authorization: Bearer <token>`.
- `src/middleware/auth.ts` verifies the token, attaches `req.user`, and enforces role access lists.
- Role summary:
  - **admin**: full CRUD on users, vehicles, bookings.
  - **customer**: update own profile, view and cancel own bookings.

---

## API Reference

All endpoints are prefixed with `/api/v1`. Responses follow this structure unless noted:

```json
{
  "success": true,
  "message": "Description",
  "data": {},
  "error": "Only set on failures"
}
```

### Auth

| Method | Endpoint        | Body                                                                                         | Description                          |
| ------ | --------------- | --------------------------------------------------------------------------------------------- | ------------------------------------ |
| POST   | `/auth/signup`  | `name`, `email`, `password` (≥6 chars), `phone`, `role` (`admin` or `customer`)              | Creates a user and returns profile.  |
| POST   | `/auth/signin`  | `email`, `password`                                                                          | Returns `{ token, userInfo }`.       |

Example:

```bash
curl -X POST http://localhost:5000/api/v1/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@demo.com","password":"secret"}'
```

### Users (admin-only unless noted)

| Method | Endpoint           | Roles allowed          | Description                                                                |
| ------ | ------------------ | ---------------------- | -------------------------------------------------------------------------- |
| GET    | `/users/`          | `admin`                | List all users (`id`, `name`, `email`, `phone`, `role`).                    |
| GET    | `/users/:userId`   | `admin`                | Fetch a single user.                                                       |
| PUT    | `/users/:userId`   | `admin`, `customer`    | Update profile data. Clients should ensure customers only edit themselves. |
| DELETE | `/users/:userId`   | `admin`                | Delete a user (bookings cascade).                                          |

### Vehicles

| Method | Endpoint              | Roles allowed | Description / Body                                                                                   |
| ------ | --------------------- | ------------- | ---------------------------------------------------------------------------------------------------- |
| GET    | `/vehicles/`          | public        | Fetch every vehicle.                                                                                |
| GET    | `/vehicles/:vehicleId`| public        | Fetch a single vehicle.                                                                             |
| POST   | `/vehicles/`          | `admin`       | `vehicle_name`, `type`, `registration_number`, `daily_rent_price`, optional `availability_status`.  |
| PUT    | `/vehicles/:vehicleId`| `admin`       | Update any field (registration must remain unique).                                                 |
| DELETE | `/vehicles/:vehicleId`| `admin`       | Remove a vehicle permanently.                                                                       |

### Bookings

| Method | Endpoint                | Roles allowed          | Description / Body                                                                                                            |
| ------ | ----------------------- | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| GET    | `/bookings/`            | `admin`, `customer`    | Admin: returns all bookings with customer + vehicle metadata. Customers: auto-filtered to their own `customer_id`.            |
| POST   | `/bookings/`            | `admin`                | `customer_id`, `vehicle_id`, `rent_start_date`, `rent_end_date`. Calculates `total_price` and marks vehicle as `booked`.      |
| PUT    | `/bookings/:bookingId`  | `admin`, `customer`    | Admin: can set any status (e.g., `returned` → frees vehicle). Customers: allowed status is `cancelled`.                       |
| DELETE | `/bookings/:bookingId`  | `admin`                | Route exists but controller logic is currently a stub (no deletion implementation yet).                                       |

Booking rules:

- Attempting to book a nonexistent vehicle throws `Vehicle not found`.
- When bookings are created, the related vehicle gets `availability_status = 'booked'`.
- When bookings move to `returned` or `cancelled`, vehicles return to `available`.

---

## Development Notes

- `initDB()` sets PostgreSQL timezone to `Asia/Dhaka`, ensuring timestamp consistency with the deployment region.
- Errors generally respond with `success: false` and include a human-readable `message` plus `error` for debugging.
- `DELETE /bookings/:bookingId` is not implemented yet; extend `bookingServices` and controller if required.
- No automated tests are defined (`npm test` is a placeholder). Consider adding integration tests for critical flows.

---

## Future Enhancements

1. Replace runtime table creation with managed migrations (Prisma, Knex, or node-pg-migrate).
2. Implement booking deletion & soft cancellation history.
3. Harden `PUT /users/:id` so customers cannot update other accounts.
4. Add pagination/filtering for `/vehicles` and `/bookings`.
5. Introduce CI pipelines and automated tests.

---

Made with ❤️ for the Prottoy rental ecosystem.

