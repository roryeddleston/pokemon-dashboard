# Pokémon Portfolio Dashboard

A full-stack demo application for tracking Pokémon card holdings and portfolio performance.

Built to demonstrate modern React, Next.js App Router, Prisma 7, PostgreSQL, and clean backend architecture.

---

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Prisma 7
- Neon Postgres
- Tailwind CSS
- Node (server runtime)

---

## Architecture

Frontend → API Routes → Prisma → Neon Postgres

The application uses Next.js Route Handlers (`app/api/.../route.ts`) as backend endpoints.

Database access is handled through Prisma 7 using the Neon adapter.

A deterministic seed system is implemented to support:

- A public demo dataset (`ownerId="demo"`)
- A template dataset (`ownerId="demo-template"`)
- Safe reset architecture

---

## Key Features

- Portfolio holdings CRUD (in progress)
- Snapshot tracking
- Deterministic seed system
- Clean separation of API and data layer
- Owner scoping to prevent IDOR in demo environment

---

## Database Design

Two core models:

### Holding

Represents a card holding.

### PriceSnapshot

Represents historical valuation data for a holding.

Indexes are applied for:

- owner scoping
- chronological queries
- uniqueness constraints

---

## Security Considerations

- Environment variables are never committed
- Server-only Prisma client
- Owner scoping applied at query level
- Future: input validation (Zod), rate limiting on write endpoints

---

## Development

Install dependencies:

```bash
npm install
```
