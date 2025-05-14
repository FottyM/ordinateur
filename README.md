# Order Management App

A full-stack order management application built with **NestJS** (backend), **TypeORM** (PostgreSQL), and **Angular** (frontend).  
This app allows users to create and view orders, with advanced filtering and validation, and is ready for production deployment.

---

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Running with Docker Compose](#running-with-docker-compose)
  - [Manual Setup](#manual-setup)
- [Usage](#usage)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [Production Readiness](#production-readiness)
- [Performance Notes](#performance-notes)
- [Troubleshooting](#troubleshooting)

---

## Features

- **Order Creation:**
  Create orders with 8 required fields: order number, payment description, street address, town, country, amount, currency, and payment due date.
- **Validation:**
  Prevents duplicate order numbers (async validation), validates all fields, and ensures payment due date is not in the past.
- **Order Listing:**
  View all orders with filters for country and description. Estonia orders are shown first, and all orders are sorted by payment due date (ascending).
- **Unique Order Links:**  
  Each order is assigned a unique, human-readable, typeable, and unguessable public ID (e.g., `ord_xxxxxxx`) for future use in payment links.
- **API Filtering:**  
  Backend supports filtering by country and description.
- **Production Ready:**  
  Includes Docker setup, environment variable support, validation, error handling, and tests.

---

## Architecture

- **Frontend:** Angular SPA (TypeScript, Angular Material)
- **Backend:** NestJS REST API (TypeScript, TypeORM, PostgreSQL)
- **Database:** PostgreSQL
- **Containerization:** Docker & Docker Compose

---

## Tech Stack

- **Frontend:** Angular 19, Angular Material, RxJS
- **Backend:** NestJS 11, TypeORM, class-validator, nanoid, PostgreSQL
- **Testing:** Vitest (backend), Jasmine/Karma (frontend)
- **DevOps:** Docker, Docker Compose

---

## Getting Started

### Prerequisites

- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/)
- (Optional) Node.js 22+ and npm if running locally without Docker

---

### Environment Variables

Create a `.env` file in the root directory with the following variables or rename the `.env.example` file to `.env` and fill in the values.

```.env
# .env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=orders
DB_PORT=5432
APP_PORT=3000
DATABASE_URL=postgres://postgres:postgres@postgres:5432/orders

# orders-api/.env
APP_PORT=3000
DATABASE_URL=postgres://postgres:postgres@postgres:5432/orders
```

---

### Running with Docker Compose

This is the recommended way to run the full stack.

```bash
docker-compose up --build
```

- **Frontend:** http://localhost:4300
- **Backend API:** http://localhost:3000
- **Postgres:** localhost:5432

---

### Manual Setup

#### Backend

```bash
cd orders-api
npm install
npm run migration:run
npm run start:dev
```

#### Frontend

```bash
cd frontend
npm install
ng serve
```

---

### Database Seeding

To populate the database with a large number of sample orders for testing and development, you can run the seeding script:

```bash
cd orders-api
npm run seed:orders
```

- **Default:** Seeds 2,000,000 orders. You can override the amount by setting the `SEED_COUNT` environment variable.
- **Warning:** Do **not** run this script in production. It will throw an error if `NODE_ENV=production`.

---

## Usage

- **Create Order:**  
  Go to the frontend app, fill in the order form, and submit. Duplicate order numbers are not allowed.
- **View Orders:**  
  Use the order list page to filter by country or description. Estonia orders are shown first, sorted by payment due date.
- **API Endpoints:**
  - `POST /orders` — Create order
  - `GET /orders` — List orders (supports `country`, `paymentDescription`, `limit`, `offset` query params)
  - `GET /orders/exists/:orderNumber` — Check if order number exists

---

## Testing

### Backend

```bash
cd orders-api
npm run test         # Unit tests
npm run test:e2e     # End-to-end tests
npm run test:cov     # Coverage
```

### Frontend

```bash
cd frontend
ng test              # Unit tests
ng e2e               # End-to-end tests (if configured)
```

---

## Project Structure

```sh
├── docker-compose.yml
├── frontend/         # Angular app
│   └── src/app/
│       ├── order-form/   # Order creation form
│       └── order-list/   # Order list & filters
├── orders-api/       # NestJS backend
│   └── src/modules/orders/
│       ├── entities/     # Order entity
│       ├── dto/          # DTOs for create/filter
│       └── utils/        # Public ID generator, codes
└── ...
```

---

## Production Readiness

- **Validation:** All user input is validated both client- and server-side.
- **Error Handling:** User-friendly error messages and HTTP error responses.
- **Unique IDs:** Orders have public IDs suitable for URLs and sharing.
- **Traceability:** Orders have creation/update timestamps.
- **Logging:** Uses `pino-http` for performant, structured logging.
- **CORS:** Backend explicitly allows only frontend origin for security.
- **Testing:** Unit and e2e tests for both frontend and backend.
- **Dockerized:** Easy to set up and deploy with Docker Compose.
- **Security:** Uses `helmet`, input validation, and environment variables.

---

## Performance Notes

Search is fast thanks to an index on descriptions. Estonia-first sorting is handled using a precomputed column so we don’t sort it manually every time. Pagination happens early in the query. The DB can also parallelize the work when needed.

If more filters or sorting are added later: just index them, use stored columns for custom sort logic, keep pagination, and use `.exist()` when all you need is a yes/no. Skip wildcards unless you’ve got the index to back it, and cache things if they get too hot.

It’ll scale just fine into the tens of millions.

---

## Troubleshooting

- **Ports in use:** Make sure ports 4300 (frontend), 3000 (backend), and 5432 (Postgres) are free.
- **Database connection issues:** Check your `.env` files and ensure Postgres is running.
- **ARM CPUs:** If not using Apple Silicon (M1/M2), remove `platform: linux/arm64` from `docker-compose.yml`.

---

## Summary

This project was completed as a technical task. All requirements were carefully implemented, including:

- A robust order management system with advanced filtering, validation, and unique order links
- Production-ready setup with Docker, environment variables, and comprehensive testing
- Efficient search and filtering, proven to handle millions of records with low latency

For future scalability, suggestions such as Redis caching or ElasticSearch integration are provided in the documentation. The current implementation is ready for real-world use and further extension.
