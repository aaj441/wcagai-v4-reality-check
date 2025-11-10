# WCAG AI Platform - Setup Guide

This guide will help you set up the WCAG AI Compliance Consultant Platform MVP from scratch.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js 20 LTS** or higher ([Download](https://nodejs.org/))
- **pnpm 8.15.0** or higher (`npm install -g pnpm@8.15.0`)
- **PostgreSQL 16** ([Download](https://www.postgresql.org/download/))
- **Redis 7** ([Download](https://redis.io/download))
- **Git** for version control

## Step 1: Clone the Repository

```bash
git clone https://github.com/aaj441/wcagai-v4-reality-check.git
cd wcagai-v4-reality-check
```

## Step 2: Install Dependencies

```bash
# Install all workspace dependencies
pnpm install
```

This will install dependencies for all workspaces (apps and packages).

## Step 3: Set Up Environment Variables

```bash
# Copy the example environment file
cp .env.example .env

# Edit the .env file with your configuration
nano .env  # or use your preferred editor
```

Required environment variables:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/wcag_ai?schema=public"
REDIS_URL="redis://localhost:6379"
OPENAI_API_KEY="sk-..."
```

## Step 4: Set Up the Database

### Start PostgreSQL

If using Docker:

```bash
docker run -d \
  --name wcag-postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_USER=user \
  -e POSTGRES_DB=wcag_ai \
  -p 5432:5432 \
  postgres:16-alpine
```

### Run Prisma Migrations

```bash
# Generate Prisma client
pnpm --filter @wcag-ai/db db:generate

# Push schema to database
pnpm --filter @wcag-ai/db db:push
```

## Step 5: Set Up Redis

If using Docker:

```bash
docker run -d \
  --name wcag-redis \
  -p 6379:6379 \
  redis:7-alpine
```

Or install locally and start:

```bash
redis-server
```

## Step 6: Build All Packages

```bash
# Build all packages in the correct order
pnpm build
```

This will:
1. Build `@wcag-ai/utils`
2. Build `@wcag-ai/core`
3. Build `@wcag-ai/db`
4. Build `@wcag-ai/scanner`
5. Build `@wcag-ai/dashboard`

## Step 7: Start Development

### Option A: Start All Apps

```bash
pnpm dev
```

This will start:
- Dashboard at http://localhost:3000
- Scanner service in watch mode

### Option B: Start Individual Apps

```bash
# Terminal 1: Start dashboard
pnpm --filter @wcag-ai/dashboard dev

# Terminal 2: Start scanner
pnpm --filter @wcag-ai/scanner dev
```

## Step 8: Verify Setup

### Check Dashboard

Open your browser and navigate to:

```
http://localhost:3000
```

You should see the WCAG AI Compliance Consultant landing page.

### Check Database

```bash
# Open Prisma Studio to view database
pnpm --filter @wcag-ai/db db:studio
```

Opens at http://localhost:5555

### Check Redis

```bash
# Connect to Redis CLI
redis-cli ping
# Should return: PONG
```

## Common Issues

### Issue: pnpm not found

**Solution:**
```bash
npm install -g pnpm@8.15.0
```

### Issue: PostgreSQL connection failed

**Solution:**
Check that PostgreSQL is running and the `DATABASE_URL` in `.env` is correct.

```bash
# Test connection
psql -h localhost -U user -d wcag_ai
```

### Issue: Redis connection failed

**Solution:**
Check that Redis is running:

```bash
redis-cli ping
```

### Issue: Port already in use

**Solution:**
Kill the process using the port or change the port in your config:

```bash
# Find process on port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

### Issue: TypeScript errors

**Solution:**
Ensure all packages are built:

```bash
pnpm clean
pnpm install
pnpm build
```

### Issue: Prisma client not generated

**Solution:**
```bash
pnpm --filter @wcag-ai/db db:generate
```

## Development Workflow

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests for specific package
pnpm --filter @wcag-ai/core test

# Run tests in watch mode
pnpm --filter @wcag-ai/core test:watch

# Run with coverage
pnpm test:coverage
```

### Type Checking

```bash
# Type check all packages
pnpm type-check

# Type check specific package
pnpm --filter @wcag-ai/dashboard type-check
```

### Linting

```bash
# Lint all packages
pnpm lint

# Lint specific package
pnpm --filter @wcag-ai/core lint
```

### Building

```bash
# Build all packages
pnpm build

# Build specific package
pnpm --filter @wcag-ai/core build

# Clean build artifacts
pnpm clean
```

## Next Steps

1. **Review Documentation**
   - [Architecture Overview](./docs/architecture.md)
   - [GitHub Copilot Instructions](./.github/copilot-instructions.md)
   - [Monorepo README](./MONOREPO_README.md)

2. **Complete Sprint 1 Tasks**
   - Review GitHub issues in `.github/ISSUE_TEMPLATE/`
   - Implement Puppeteer Scanner Service
   - Build remaining dashboard pages
   - Add tests

3. **Deploy**
   - Set up CI/CD with GitHub Actions
   - Deploy dashboard to Vercel
   - Deploy scanner to AWS Lambda or ECS
   - Configure production database and Redis

## Useful Commands

```bash
# Install new dependency to specific workspace
pnpm --filter @wcag-ai/core add zod

# Add dev dependency
pnpm --filter @wcag-ai/core add -D vitest

# Update all dependencies
pnpm update -r

# Check for outdated dependencies
pnpm outdated -r

# Run manual validation script
node scripts/manual-validation.js --url https://example.com

# Open Prisma Studio
pnpm --filter @wcag-ai/db db:studio

# View package dependency graph
pnpm list --depth=0
```

## Resources

- [pnpm Documentation](https://pnpm.io/)
- [Turborepo Documentation](https://turbo.build/repo/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Puppeteer Documentation](https://pptr.dev/)
- [axe-core Documentation](https://github.com/dequelabs/axe-core)

## Support

For issues or questions:

1. Check this setup guide
2. Review [GitHub Issues](https://github.com/aaj441/wcagai-v4-reality-check/issues)
3. Consult the team documentation
4. Open a new issue with detailed information

---

**Last Updated:** November 10, 2025
**Version:** 1.0.0
