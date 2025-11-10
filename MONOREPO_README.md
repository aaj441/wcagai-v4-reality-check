# WCAG AI Compliance Consultant Platform - Monorepo

> AI-powered web accessibility compliance platform for automated WCAG scanning and reporting

## Overview

This monorepo contains the complete WCAG AI Compliance Consultant Platform MVP, built with modern technologies including Next.js 15, React 19, TypeScript 5.3, and managed with pnpm workspaces and Turborepo.

## Project Structure

```
wcag-ai-platform/
├── apps/
│   ├── scanner/        # Puppeteer-based WCAG scanner service
│   └── dashboard/      # Next.js 15 dashboard frontend
├── packages/
│   ├── core/          # Core business logic & ConfidenceScoringEngine
│   ├── db/            # Prisma schema & database client
│   └── utils/         # Shared utilities (validators, logger)
├── docs/              # Documentation
├── infrastructure/    # Docker, AWS Lambda configurations
├── scripts/          # Build & deployment scripts
├── .github/          # GitHub Actions workflows & issue templates
├── pnpm-workspace.yaml
├── turbo.json
└── package.json
```

## Tech Stack

### Frontend
- **Next.js 15** with App Router
- **React 19** with Server Components
- **TypeScript 5.3+**
- **Tailwind CSS 3.4+**
- **shadcn/ui** component library

### Backend
- **Node.js 20 LTS**
- **TypeScript 5.3+**
- **Prisma 5.11** ORM
- **PostgreSQL 16**
- **BullMQ + Redis 7** for job queuing

### Accessibility Testing
- **Puppeteer 22** for browser automation
- **axe-core 4.8** for WCAG validation
- **ConfidenceScoringEngine** for reliability metrics

### AI & Document Generation
- **OpenAI GPT-4** API
- **pdf-lib** for PDF reports

### Testing
- **Vitest** for unit tests
- **Playwright** for E2E tests
- **80%+ code coverage** target

### DevOps
- **Docker** for containerization
- **AWS Lambda** for serverless functions
- **GitHub Actions** for CI/CD
- **Turborepo** for build orchestration
- **pnpm** workspaces for dependency management

## Quick Start

### Prerequisites

- Node.js 20 LTS or higher
- pnpm 8.15.0 or higher
- PostgreSQL 16
- Redis 7

### Installation

```bash
# Install pnpm globally (if not already installed)
npm install -g pnpm@8.15.0

# Clone the repository
git clone https://github.com/your-org/wcag-ai-platform.git
cd wcag-ai-platform

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Generate Prisma client
pnpm --filter @wcag-ai/db db:generate

# Push database schema
pnpm --filter @wcag-ai/db db:push
```

### Development

```bash
# Start all apps in development mode
pnpm dev

# Start specific app
pnpm --filter @wcag-ai/dashboard dev
pnpm --filter @wcag-ai/scanner dev

# Build all packages
pnpm build

# Run tests
pnpm test

# Type check
pnpm type-check

# Lint
pnpm lint
```

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/wcag_ai"

# Redis
REDIS_URL="redis://localhost:6379"

# OpenAI
OPENAI_API_KEY="sk-..."

# Scanner Config
SCANNER_TIMEOUT=30000
MAX_CONCURRENT_SCANS=5

# Next.js
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

## Workspaces

### Apps

#### `apps/dashboard`
Next.js 15 dashboard for managing scans and viewing reports.

```bash
cd apps/dashboard
pnpm dev          # Start dev server
pnpm build        # Build for production
pnpm start        # Start production server
```

#### `apps/scanner`
Puppeteer-based scanner service for WCAG compliance checking.

```bash
cd apps/scanner
pnpm dev          # Start with hot reload
pnpm build        # Build TypeScript
pnpm start        # Run built version
```

### Packages

#### `packages/core`
Core business logic including ConfidenceScoringEngine.

```bash
cd packages/core
pnpm build        # Compile TypeScript
pnpm test         # Run tests
```

#### `packages/db`
Prisma schema and database client.

```bash
cd packages/db
pnpm db:generate  # Generate Prisma client
pnpm db:push      # Push schema to database
pnpm db:studio    # Open Prisma Studio
pnpm db:migrate   # Run migrations
```

#### `packages/utils`
Shared utilities (validators, logger, etc.).

```bash
cd packages/utils
pnpm build        # Compile TypeScript
pnpm test         # Run tests
```

## Scripts

### Manual Validation Script

Interactive CLI tool for manually validating scan results:

```bash
node scripts/manual-validation.js --url https://example.com
```

## Testing

```bash
# Run all tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Run tests in watch mode
pnpm --filter @wcag-ai/core test:watch

# Run E2E tests
pnpm --filter @wcag-ai/dashboard test:e2e
```

## Building

```bash
# Build all packages
pnpm build

# Build specific package
pnpm --filter @wcag-ai/core build

# Clean build artifacts
pnpm clean
```

## Deployment

### Docker

```bash
# Build Docker image
docker build -t wcag-ai-platform .

# Run container
docker run -p 3000:3000 -p 4000:4000 wcag-ai-platform
```

### AWS Lambda

Deploy scanner as serverless function:

```bash
cd apps/scanner
pnpm build
# Deploy using your preferred method (Serverless Framework, AWS CDK, etc.)
```

### Vercel (Dashboard)

```bash
cd apps/dashboard
vercel --prod
```

## Contributing

### Development Workflow

1. Create a new branch from `main`
2. Make your changes
3. Write/update tests
4. Ensure all tests pass: `pnpm test`
5. Ensure type checking passes: `pnpm type-check`
6. Format code: `pnpm format`
7. Commit with conventional commits
8. Open a pull request

### Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new feature
fix: fix bug
docs: update documentation
test: add tests
chore: maintenance tasks
refactor: code refactoring
```

## Sprint 1 Goals

- [x] Setup Monorepo with Turborepo
- [ ] Implement Puppeteer Scanner Service
- [ ] Build ConfidenceScoringEngine (Rule-Based)
- [ ] Create Dashboard Skeleton

See [GitHub Issues](https://github.com/your-org/wcag-ai-platform/issues) for detailed tasks.

## Documentation

- [Architecture Overview](./docs/architecture.md)
- [API Reference](./docs/api.md)
- [Development Guide](./docs/development.md)
- [Deployment Guide](./docs/deployment.md)
- [GitHub Copilot Instructions](./.github/copilot-instructions.md)

## Resources

- [WCAG 2.2 Guidelines](https://www.w3.org/WAI/WCAG22/quickref/)
- [axe-core API](https://github.com/dequelabs/axe-core/blob/develop/doc/API.md)
- [Next.js 15 Docs](https://nextjs.org/docs)
- [Turborepo Docs](https://turbo.build/repo/docs)
- [Prisma Docs](https://www.prisma.io/docs)

## License

MIT

## Support

For questions or support, please open an issue on GitHub.

---

**Version:** 1.0.0  
**Last Updated:** November 10, 2025
