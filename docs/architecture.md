# WCAG AI Platform - Architecture Overview

## System Architecture

The WCAG AI Compliance Consultant Platform is built as a monorepo with a microservices-inspired architecture, using pnpm workspaces and Turborepo for build orchestration.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │        Next.js 15 Dashboard (React 19)               │  │
│  │  - Server Components                                  │  │
│  │  - Client Components                                  │  │
│  │  - API Routes                                         │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                     Backend Services                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Scanner Service (Puppeteer + axe-core)       │  │
│  │  - Browser automation                                 │  │
│  │  - WCAG compliance checking                           │  │
│  │  - Screenshot capture                                 │  │
│  │  - Violation detection                                │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         ConfidenceScoringEngine (Core Logic)         │  │
│  │  - Rule-based scoring                                 │  │
│  │  - False positive detection                           │  │
│  │  - Confidence metrics                                 │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                      Data Layer                              │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │  PostgreSQL  │  │    Redis     │  │   BullMQ Queue  │  │
│  │  (Prisma)    │  │   (Cache)    │  │   (Job Queue)   │  │
│  └──────────────┘  └──────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Component Breakdown

### Frontend Layer

**Dashboard App (`apps/dashboard`)**
- Built with Next.js 15 App Router
- React 19 Server Components for performance
- Tailwind CSS for styling
- shadcn/ui for UI components
- Handles user interactions and displays results

**Key Features:**
- Scan initiation interface
- Real-time scan progress tracking
- Detailed violation reports
- Confidence score visualization
- Export functionality

### Backend Services

**Scanner Service (`apps/scanner`)**
- Headless browser automation with Puppeteer 22
- WCAG compliance testing with axe-core 4.8
- Integrated ConfidenceScoringEngine
- BullMQ worker for job processing
- Screenshot capture for documentation

**Workflow:**
1. Receives scan job from queue
2. Launches Puppeteer browser
3. Navigates to target URL
4. Injects axe-core library
5. Runs accessibility tests
6. Captures violations and screenshots
7. Scores violations with ConfidenceScoringEngine
8. Saves results to database
9. Updates job status

### Core Packages

**Core Package (`packages/core`)**
- ConfidenceScoringEngine implementation
- Business logic and algorithms
- TypeScript types and interfaces
- Shared domain models

**Database Package (`packages/db`)**
- Prisma schema definition
- Database client singleton
- Type-safe query builder
- Migration scripts

**Utils Package (`packages/utils`)**
- Input validators (Zod schemas)
- Logger utility
- Common helper functions
- Shared constants

### Data Layer

**PostgreSQL (via Prisma)**
- Primary data store
- Stores scans, violations, users
- ACID compliance
- Relational data integrity

**Redis**
- Job queue storage (BullMQ)
- Session caching
- Rate limiting
- Real-time data

**BullMQ**
- Distributed job queue
- Scan job processing
- Retry logic
- Job prioritization

## Data Flow

### Scan Request Flow

```
User → Dashboard → API Route → BullMQ Queue
                                    ↓
                            Scanner Worker
                                    ↓
                       Puppeteer + axe-core
                                    ↓
                      ConfidenceScoringEngine
                                    ↓
                           PostgreSQL (save)
                                    ↓
                       Dashboard (display results)
```

### Real-Time Updates

```
Scanner → BullMQ Events → Dashboard (polling/webhooks)
```

## Scalability Considerations

### Horizontal Scaling
- Multiple scanner workers can run in parallel
- Stateless dashboard instances
- Load balancing across instances
- Redis for shared state

### Performance Optimization
- Browser pool for scanner (reuse browser instances)
- Result caching in Redis
- Incremental scan results
- Background job processing

### Reliability
- Job retry mechanism (3 attempts)
- Timeout handling (30s default)
- Error logging and monitoring
- Graceful degradation

## Security

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (RBAC)
- API key management
- Rate limiting per user

### Data Protection
- Input validation (Zod schemas)
- SQL injection prevention (Prisma)
- XSS protection (Next.js defaults)
- CSRF tokens
- Encrypted secrets

### Scanning Safety
- URL allowlist/blocklist
- Sandboxed browser execution
- Resource limits (memory, CPU)
- Timeout enforcement

## Monitoring & Observability

### Logging
- Structured JSON logging
- Log levels (debug, info, warn, error)
- Request/response logging
- Performance metrics

### Metrics
- Scan duration
- Queue depth
- Success/failure rates
- Confidence score distribution

### Alerting
- Failed scan threshold
- Queue backlog
- Error rate spikes
- Resource exhaustion

## Deployment Architecture

### Development
```
Local Machine
├── pnpm dev (all apps)
├── PostgreSQL (Docker)
├── Redis (Docker)
└── Hot reload enabled
```

### Production
```
Cloud Infrastructure
├── Dashboard → Vercel/AWS
├── Scanner → AWS Lambda/ECS
├── Database → AWS RDS (PostgreSQL)
├── Cache → AWS ElastiCache (Redis)
└── Queue → AWS SQS or managed BullMQ
```

## Technology Choices Rationale

**Next.js 15**: Modern React framework with excellent DX, SSR, and performance
**React 19**: Latest features, Server Components for performance
**TypeScript 5.3**: Type safety, better tooling, reduced bugs
**Prisma 5.11**: Type-safe ORM, excellent DX, migrations
**Puppeteer 22**: Industry-standard browser automation
**axe-core 4.8**: Best-in-class accessibility testing engine
**BullMQ**: Robust, Redis-based job queue with excellent features
**Turborepo**: Fast, efficient monorepo build system

## Future Enhancements

### Phase 2
- AI-powered remediation suggestions (GPT-4)
- PDF report generation (pdf-lib)
- Scheduled recurring scans
- Email notifications
- Webhook integrations

### Phase 3
- Multi-tenant support
- Team collaboration features
- Advanced analytics dashboard
- Custom rule configuration
- API marketplace

### Phase 4
- Mobile app (React Native)
- Browser extension
- CI/CD integration plugins
- Enterprise SSO
- Advanced ML models for detection

---

**Last Updated:** November 10, 2025
**Version:** 1.0.0
