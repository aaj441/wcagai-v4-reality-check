# GitHub Copilot Instructions for WCAG AI Compliance Consultant Platform

## Project Overview

This is a **monorepo** for the WCAG AI Compliance Consultant Platform MVP. The platform helps organizations ensure web accessibility compliance through automated scanning, AI-powered analysis, and detailed reporting.

## Environment Setup

### Prerequisites

- **Node.js**: 20 LTS or higher  
- **Package Manager**: npm (pnpm preferred but not installed in this repo)
- **Database**: PostgreSQL 16
- **Cache/Queue**: Redis 7

### Initial Setup Steps

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd wcagai-v4-reality-check
   npm install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your credentials:
   # - DATABASE_URL (PostgreSQL connection string)
   # - REDIS_URL (Redis connection string)
   # - OPENAI_API_KEY (for AI features)
   ```

3. **Database Setup**
   ```bash
   # Navigate to db package
   cd packages/db
   npx prisma generate
   npx prisma migrate dev
   ```

4. **Build All Packages**
   ```bash
   # From root directory
   npm run build
   ```

5. **Start Development**
   ```bash
   # Run all apps in development mode
   npm run dev
   
   # Or run specific apps:
   cd apps/dashboard && npm run dev    # Dashboard on http://localhost:3000
   cd apps/scanner && npm run dev      # Scanner service
   ```

### Common Commands

**Development:**
```bash
npm run dev          # Start all apps in development mode
npm run build        # Build all packages and apps
npm run test         # Run all tests across the monorepo
npm run lint         # Lint all packages and apps
npm run type-check   # TypeScript type checking
npm run format       # Format code with Prettier
npm run clean        # Clean all build artifacts
```

**Package-Specific:**
```bash
cd apps/dashboard && npm run dev      # Next.js dashboard
cd apps/scanner && npm run dev        # Scanner service
cd packages/core && npm test          # Test core package
cd packages/db && npx prisma studio   # Open Prisma Studio
```

**Turbo Commands:**
```bash
turbo run build --filter=@wcag/core   # Build specific package
turbo run test --filter=apps/scanner  # Test specific app
turbo run dev --parallel              # Run all dev servers in parallel
```

## Monorepo Workflow

### Working with Turborepo

This project uses **Turborepo** for monorepo orchestration:

- **Pipeline**: Tasks are defined in `turbo.json` with dependencies
- **Caching**: Turbo caches build outputs for faster rebuilds
- **Parallel Execution**: Tasks run in parallel when possible
- **Workspaces**: Packages are linked via npm workspaces

### Package Dependencies

```
apps/dashboard  → packages/core, packages/db, packages/utils
apps/scanner    → packages/core, packages/db, packages/utils
packages/core   → packages/utils
packages/db     → (standalone)
packages/utils  → (standalone)
```

### Adding New Packages

When creating new packages or apps:
1. Create the directory structure
2. Add `package.json` with proper naming (`@wcag/package-name`)
3. Update `turbo.json` if new tasks are needed
4. Import via workspace protocol in dependent packages

## Sensitive Files and Restrictions

### Files Copilot Should NOT Modify (without explicit permission)

**Security & Configuration:**
- `.env*` files (except `.env.example`)
- `railway.json` (deployment configuration)
- `.github/workflows/*` (CI/CD pipelines)
- Any files containing secrets or API keys

**Database:**
- `packages/db/migrations/*` (existing migrations)
- Only add NEW migrations, never modify existing ones

**Build Artifacts:**
- `node_modules/`
- `dist/`, `.next/`, `build/`
- `coverage/`
- `.turbo/`

**Legal & Documentation:**
- `LICENSE`
- Change `AUDIT_REPORT.md`, `EXECUTIVE_SUMMARY.md` only when explicitly requested

### Safe to Modify

- Source code in `/src` directories
- Test files (`*.test.ts`, `*.spec.ts`)
- Component files in `/app`, `/components`
- Documentation (README.md files, `/docs`)
- Configuration (tsconfig.json, package.json - with care)

## Task Scoping Guidelines for Copilot

### Good Task Examples

✅ **Well-Scoped Tasks:**
- "Add unit tests for ConfidenceScoringEngine.calculateScore() method"
- "Fix TypeScript errors in apps/dashboard/app/page.tsx"
- "Update README.md to document new environment variables"
- "Refactor scanner service to use async/await instead of promises"
- "Add error handling to API route /api/scan"

✅ **Clear Acceptance Criteria:**
- "Add CORS middleware to Next.js API routes that allows requests from localhost:3000"
- "Update Prisma schema to add 'priority' field to Scan model, then generate migration"
- "Fix failing test in packages/core/ConfidenceScoringEngine.test.ts"

### Tasks to Avoid or Break Down

❌ **Too Broad:**
- "Improve the entire scanner service"
- "Make the dashboard look better"
- "Add more features to the platform"

❌ **Requires Deep Context:**
- "Redesign the database schema"
- "Change the AI model strategy"
- "Rewrite the authentication system"

### How to Create Good Issues for Copilot

1. **Be Specific**: Reference exact files, functions, or line numbers
2. **Provide Context**: Explain why the change is needed
3. **Set Boundaries**: Specify what should NOT be changed
4. **Include Tests**: Mention if tests should be added/updated
5. **Define Success**: What does "done" look like?

**Example Template:**
```
**Task**: Add validation for URL input in scanner service

**Files to Modify**:
- apps/scanner/src/validators.ts (create if doesn't exist)
- apps/scanner/src/index.ts (use the validator)

**Requirements**:
- Validate URL format using a library (e.g., validator.js)
- Reject non-HTTP(S) URLs
- Add unit tests in apps/scanner/src/validators.test.ts

**Acceptance Criteria**:
- [ ] URL validator function created
- [ ] Function used in scanner entry point
- [ ] Tests cover valid and invalid cases
- [ ] TypeScript types are properly defined

**Do NOT**:
- Change existing Prisma schema
- Modify CI/CD workflows
```

## Architecture

### Monorepo Structure

```
/
├── apps/
│   ├── scanner/        # Puppeteer-based WCAG scanner service
│   └── dashboard/      # Next.js 15 dashboard frontend
├── packages/
│   ├── core/          # Core business logic & ConfidenceScoringEngine
│   ├── db/            # Prisma schema & database client
│   └── utils/         # Shared utilities
├── docs/              # Documentation
├── infrastructure/    # Docker, AWS Lambda configs
└── scripts/          # Build & deployment scripts
```

### Tech Stack

**Frontend:**
- Next.js 15 with App Router
- React 19 with Server Components
- TypeScript 5.3+
- Tailwind CSS 3.4+
- shadcn/ui component library

**Backend:**
- Node.js 20 LTS
- TypeScript 5.3+
- Prisma 5.11 ORM
- PostgreSQL 16
- BullMQ + Redis 7 for job queuing

**Accessibility Testing:**
- Puppeteer 22 for browser automation
- axe-core 4.8 for WCAG validation
- Custom ConfidenceScoringEngine for reliability metrics

**AI & Document Generation:**
- OpenAI GPT-4 API
- pdf-lib for PDF reports

**Testing:**
- Vitest for unit tests
- Playwright for E2E tests
- 80%+ code coverage target

**DevOps:**
- Docker for containerization
- AWS Lambda for serverless functions
- GitHub Actions for CI/CD
- Turborepo for build orchestration
- pnpm workspaces for dependency management

## Development Guidelines

### Code Style

1. **TypeScript First**: All new code must be TypeScript with strict type checking
2. **Functional Programming**: Prefer pure functions and immutability
3. **Error Handling**: Always use try-catch with proper error types
4. **Async/Await**: Use async/await over promises chains
5. **Named Exports**: Prefer named exports over default exports

### Component Patterns

**React Components:**
```typescript
// Use functional components with TypeScript
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export function Button({ label, onClick, variant = 'primary' }: ButtonProps) {
  return (
    <button onClick={onClick} className={cn(buttonVariants({ variant }))}>
      {label}
    </button>
  );
}
```

**Server Actions (Next.js):**
```typescript
'use server'

export async function scanUrl(url: string): Promise<ScanResult> {
  const result = await scanner.scan(url);
  return result;
}
```

### Database Patterns

**Prisma Usage:**
```typescript
// Always use Prisma Client for database operations
import { db } from '@/packages/db';

export async function createScan(data: ScanInput) {
  return await db.scan.create({
    data: {
      url: data.url,
      status: 'pending',
      createdAt: new Date(),
    },
  });
}
```

### API Design

**RESTful Endpoints:**
- Use semantic HTTP methods (GET, POST, PUT, DELETE)
- Return appropriate status codes (200, 201, 400, 404, 500)
- Always return JSON with consistent structure

```typescript
// Success response
{ success: true, data: {...} }

// Error response
{ success: false, error: { code: 'ERROR_CODE', message: '...' } }
```

### Testing Strategy

1. **Unit Tests**: Test individual functions and components
2. **Integration Tests**: Test API endpoints and database operations
3. **E2E Tests**: Test complete user workflows
4. **Accessibility Tests**: Ensure the platform itself is accessible

### Performance Guidelines

1. **Code Splitting**: Use dynamic imports for large components
2. **Image Optimization**: Use Next.js Image component
3. **Database Queries**: Always use indexes, avoid N+1 queries
4. **Caching**: Use Redis for frequently accessed data
5. **Background Jobs**: Use BullMQ for long-running tasks

### Security Best Practices

1. **Input Validation**: Validate all user inputs with Zod
2. **SQL Injection**: Use Prisma's parameterized queries
3. **XSS Prevention**: Sanitize user-generated content
4. **CSRF Protection**: Use Next.js built-in CSRF protection
5. **Rate Limiting**: Implement rate limiting on all public APIs
6. **Environment Variables**: Never commit secrets, use .env.local

### Git Commit Messages

Follow Conventional Commits:
```
feat: add confidence scoring engine
fix: resolve scanner timeout issue
docs: update API documentation
test: add unit tests for scoring engine
chore: upgrade dependencies
```

### Pull Request Guidelines

1. **Small PRs**: Keep PRs focused on a single feature/fix
2. **Tests Required**: All PRs must include tests
3. **Documentation**: Update docs for public API changes
4. **Type Safety**: No `any` types without justification
5. **Code Review**: At least one approval required

## Sprint 1 Focus

### Core Features to Implement

1. **Monorepo Setup** ✓
   - Turborepo configuration
   - pnpm workspaces
   - Shared TypeScript config

2. **Puppeteer Scanner Service**
   - Basic URL scanning
   - axe-core integration
   - Screenshot capture
   - Violation detection

3. **ConfidenceScoringEngine**
   - Rule-based confidence scoring
   - False positive detection
   - Reliability metrics

4. **Dashboard Skeleton**
   - Landing page
   - Scan form
   - Results display
   - Basic navigation

### File Organization

**Apps:**
- `/apps/scanner/src/index.ts` - Scanner service entry point
- `/apps/dashboard/app/page.tsx` - Dashboard homepage

**Packages:**
- `/packages/core/ConfidenceScoringEngine.ts` - Scoring logic
- `/packages/db/schema.prisma` - Database schema
- `/packages/utils/validators.ts` - Shared validation utilities

**Scripts:**
- `/scripts/manual-validation.js` - Manual validation script

## Common Patterns

### Error Handling

```typescript
class ScanError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'ScanError';
  }
}

try {
  const result = await scanner.scan(url);
} catch (error) {
  if (error instanceof ScanError) {
    logger.error(`Scan failed: ${error.code}`, { url, error });
    throw error;
  }
  throw new ScanError('Unknown scan error', 'UNKNOWN_ERROR');
}
```

### Logging

```typescript
import { logger } from '@/packages/utils/logger';

logger.info('Scan started', { url, scanId });
logger.error('Scan failed', { url, error: error.message });
logger.warn('Confidence score low', { url, score });
```

### Configuration

```typescript
// Use environment variables with defaults
export const config = {
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    ttl: parseInt(process.env.REDIS_TTL || '3600'),
  },
  scanner: {
    timeout: parseInt(process.env.SCANNER_TIMEOUT || '30000'),
    maxConcurrent: parseInt(process.env.MAX_CONCURRENT_SCANS || '5'),
  },
};
```

## Debugging and Troubleshooting

### Common Issues

**Build Failures:**
```bash
# Clear Turbo cache and rebuild
npm run clean
npm install
npm run build
```

**Type Errors:**
```bash
# Regenerate Prisma types
cd packages/db && npx prisma generate
npm run type-check
```

**Test Failures:**
```bash
# Run tests in watch mode for specific package
cd packages/core && npm test -- --watch
```

**Database Issues:**
```bash
# Reset database (WARNING: destroys data)
cd packages/db && npx prisma migrate reset

# View database in browser
cd packages/db && npx prisma studio
```

### IDE Setup

**VSCode Recommended Extensions:**
- ESLint
- Prettier
- Prisma
- TypeScript and JavaScript Language Features
- Tailwind CSS IntelliSense

**VSCode Settings:**
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

### Debugging Tips

1. **Use TypeScript's `satisfies` operator** for type checking
2. **Enable source maps** for better debugging
3. **Use VSCode debugger** with breakpoints
4. **Check Prisma Studio** for database issues
5. **Monitor Redis** with RedisInsight

## Resources

- [Next.js 15 Docs](https://nextjs.org/docs)
- [Turborepo Docs](https://turbo.build/repo/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [WCAG 2.2 Guidelines](https://www.w3.org/WAI/WCAG22/quickref/)
- [axe-core API](https://github.com/dequelabs/axe-core/blob/develop/doc/API.md)

## Questions?

For questions or clarifications, refer to:
1. This document first
2. Package-specific README files in each app/package
3. Technical design documents in `/docs`
4. `.env.example` for required environment variables
5. `turbo.json` for task pipeline configuration
6. Team lead or senior developer

---

**Last Updated:** November 10, 2025  
**Version:** 1.1.0
