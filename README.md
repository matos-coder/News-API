# Eskalate News API

A robust, production-ready RESTful API for Authors and Readers, featuring Role-Based Access Control, soft deletion, and an asynchronous analytics engine for efficient read-tracking.

## Features
- Role-Based Access Control (Authors, Readers)
- Soft deletion for recoverable records
- Asynchronous Analytics Engine that aggregates read logs into daily summaries
- Input validation with Zod and centralized middleware

## Technology Stack
- **Runtime:** Node.js + Express
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Validation:** Zod

## Setup Instructions

1. Clone & install

```bash
git clone https://github.com/matos-coder/News-API
cd backend
npm install
```

2. Environment variables

Rename `.env.example` to `.env` and set the following variables (example):

```env
DATABASE_URL="postgresql://user:password@localhost:5432/news_api?schema=public"
JWT_SECRET="your-secret-key"
PORT=3000
```

3. Database migration

```bash
npx prisma migrate dev --name init
```

4. Run the application

```bash
# Development mode
npm run dev
```

## Architecture Choices

- **Express over NestJS:** Express was chosen for lightweight execution and fine-grained control over middleware. This keeps the read-tracking and analytics paths non-blocking and easier to reason about for high-throughput scenarios.
- **Centralized Validation:** Zod is applied at the middleware layer to validate and sanitize incoming requests before they reach controller logic.
- **Analytics Engine:** A scheduled job (node-cron) aggregates high-frequency `ReadLog` inserts into a summarized `DailyAnalytics` table at midnight UTC. This design prevents heavy read queries on the dashboard and keeps operational costs predictable.

## Operational Notes

- Use soft deletion fields (e.g., `deletedAt`) to mark records deleted without removing them from the database so data can be recovered or audited.
- Protect sensitive endpoints using JWT-based auth and role checks in middleware.

## Bonus: Preventing ReadLog Spam (100 entries in 10 seconds)

To mitigate spammy read logging, introduce a small caching layer (Redis) as a debounce mechanism:

1. When an article is read, set a key: `view:{articleId}:{userId_or_IP}` with a TTL of 10 seconds.
2. Before inserting a `ReadLog`, check Redis; if the key exists, skip the insertion.
3. If high-confidence de-duplication is needed, prefer `userId` for authenticated users and `IP` for anonymous readers.

This approach reduces write amplification to the `ReadLog` table while preserving near-real-time analytics.

---


