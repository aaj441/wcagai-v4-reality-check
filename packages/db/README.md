# @wcag-ai/db

Database schema and client for the WCAG AI Compliance Consultant Platform.

## Features

- Prisma 5.11 ORM
- PostgreSQL 16 database
- Type-safe database client
- Migration management

## Schema

### Models

- **Scan**: Accessibility scan records
- **Violation**: WCAG violation details
- **User**: User accounts

## Usage

```typescript
import { db } from '@wcag-ai/db';

// Create a scan
const scan = await db.scan.create({
  data: {
    url: 'https://example.com',
    status: 'pending',
  },
});

// Query scans
const scans = await db.scan.findMany({
  where: {
    status: 'completed',
  },
  orderBy: {
    createdAt: 'desc',
  },
  take: 10,
});
```

## Development

```bash
# Generate Prisma client
pnpm db:generate

# Push schema to database
pnpm db:push

# Open Prisma Studio
pnpm db:studio

# Create migration
pnpm db:migrate

# Reset database
pnpm db:reset
```

## Environment Variables

```env
DATABASE_URL="postgresql://user:password@localhost:5432/wcag_ai?schema=public"
```
