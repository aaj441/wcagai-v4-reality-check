# GitHub Copilot Instructions - WCAG AI Platform

## Tech Stack

- **Framework:** Next.js 15 (App Router), React 19, TypeScript 5.3
- **Database:** PostgreSQL 16 + Prisma 5.11
- **Queue:** BullMQ + Redis 7
- **Scanner:** Puppeteer 22 + axe-core 4.8
- **AI:** OpenAI GPT-4, GPT-4 Vision
- **PDF:** pdf-lib, Puppeteer PDF generation
- **Styling:** Tailwind CSS, shadcn/ui components
- **Testing:** Vitest (unit), Playwright (E2E), @axe-core/react (a11y)
- **Infra:** Docker, AWS Lambda (for serverless scanning), GitHub Actions

## Folder Structure

```
/apps
  /scanner       # Puppeteer scanning service
  /dashboard     # Next.js admin dashboard
/packages
  /core          # Shared types, utils
  /db            # Prisma schema & client
  /utils         # Reusable functions
/infrastructure
  /docker
  /terraform
/docs            # All markdown docs
/scripts         # Automation scripts
```

## Coding Standards - DO

```typescript
// ✅ DO: Always use strict TypeScript
interface ScoredViolation extends axe.Result {
  confidence: number;
  flaggedForReview: boolean;
}

// ✅ DO: Implement error boundaries
function ErrorBoundary({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

// ✅ DO: Use accessible components from react-aria
import { useButton } from 'react-aria';
const { buttonProps } = useButton(props, ref);

// ✅ DO: Cache aggressively
await redis.set(`audit:${url}`, JSON.stringify(result), 'EX', 3600);

// ✅ DO: Implement circuit breakers for external APIs
const circuit = new CircuitBreaker(gpt4Call, { timeout: 5000 });

// ✅ DO: Use environment variables for config
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
```

## Coding Standards - DON'T

```typescript
// ❌ DON'T: Use any types
const result: any = await axios.get(url);

// ❌ DON'T: Skip error handling
try { await scan(); } catch (e) { console.log(e); }

// ❌ DON'T: Hardcode timeouts
await page.waitForTimeout(5000); // Use waitForSelector instead

// ❌ DON'T: Generate inaccessible UIs
// Always test with @axe-core/react in dev mode

// ❌ DON'T: Commit secrets
// Use .env.local and never commit to git
```

## Prisma Schema Guidelines

```prisma
// Always use UUIDs for IDs
id String @id @default(uuid())

// Always index foreign keys
@@index([siteId, scanVersion])

// Always use Json for flexible violation storage
violations Json

// Always include createdAt/updatedAt
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
```

## Testing Requirements

- **Unit tests:** >80% coverage for all utils, core packages
- **Integration tests:** Test BullMQ queue, Prisma operations
- **E2E tests:** Playwright tests for critical user flows
- **Accessibility tests:** Run axe-core on every page component
- **Performance tests:** Lighthouse CI in GitHub Actions

## Security Checklist

- [ ] Sanitize all user inputs with DOMPurify
- [ ] Rate limit API routes (60 req/min)
- [ ] Use AWS Secrets Manager for keys
- [ ] Implement CORS policies
- [ ] Run Snyk/GitHub Dependabot daily
- [ ] Encrypt PII in database

## Performance Budget

- **Scanner:** <15 seconds per page
- **Dashboard:** <2 second page loads
- **PDF generation:** <5 seconds
- **Email drafting:** <10 seconds
- **API response:** <200ms

## Documentation

- Every function must have JSDoc comments
- Every API route must have OpenAPI spec
- Every component must have Storybook story
- Every sprint must have updated README

## Confidence Scoring Rules

### Base Confidence Calculation

```typescript
const impactScore = {
  minor: 0.6,
  moderate: 0.75,
  serious: 0.85,
  critical: 0.95
};

// Flaky rules (reduce confidence)
const flakyRules = ['color-contrast', 'aria-hidden-focus', 'heading-order'];

// Reliable rules (boost confidence)
const reliableRules = ['image-alt', 'html-lang', 'document-title'];
```

### Contextual Rules

- **Hidden elements:** -0.4 confidence (likely false positive)
- **Modal violations:** -0.2 confidence (transient UI)
- **Complex descendants:** -0.15 confidence (may have workarounds)
- **In viewport + simple:** +0.1 confidence (directly visible)

### Visual Validation

- **color-contrast:** Use GPT-4 Vision to check if element is real text (not decorative)
- **image-alt:** Use GPT-4 Vision to classify image (informative vs decorative)
- **heading-order:** Use NLP to validate semantic structure

### Severity Mapping

```typescript
if (confidence < 0.6) return 'false_positive';
if (confidence < 0.85) return 'low';
return violation.impact; // critical, serious, moderate, minor
```

## API Design Patterns

### REST Endpoints

```typescript
// POST /api/scan
{
  url: string;
  options?: {
    waitForSelector?: string;
    viewport?: { width: number; height: number };
    includeScreenshot?: boolean;
  }
}

// Response
{
  scanId: string;
  status: 'queued' | 'processing' | 'complete' | 'failed';
  violations: ScoredViolation[];
  complianceScore: number;
  estimatedRemediation: {
    hours: number;
    priority: 'high' | 'medium' | 'low';
  };
}
```

### Error Handling

```typescript
class ScanError extends Error {
  constructor(
    message: string,
    public code: 'TIMEOUT' | 'NETWORK' | 'PARSE' | 'RATE_LIMIT',
    public retryable: boolean
  ) {
    super(message);
  }
}
```

## Environment Variables

```bash
# Required
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
OPENAI_API_KEY=sk-...

# Optional
SENTRY_DSN=https://...
AWS_REGION=us-east-1
HUBSPOT_API_KEY=...
```

## Deployment

### Railway (Current)

```bash
railway up
railway add --plugin redis
railway add --plugin postgresql
```

### AWS Lambda (Future)

```typescript
// Use Serverless Framework
// Cold start: <3 seconds
// Concurrent scans: 100+
```

## Monitoring

```typescript
// Sentry for errors
Sentry.captureException(error);

// Custom metrics
await redis.incr('scans:total');
await redis.hincrby('scans:by_vertical', vertical, 1);
```

## Code Review Checklist

- [ ] TypeScript strict mode enabled
- [ ] All functions have JSDoc
- [ ] Error handling implemented
- [ ] Tests written (>80% coverage)
- [ ] Accessibility tested with axe-core
- [ ] Performance measured (Lighthouse)
- [ ] Security reviewed (no hardcoded secrets)
- [ ] Database indexes added where needed
- [ ] Caching implemented for expensive operations
- [ ] Logging added for debugging

## Sprint Planning Template

```markdown
## Sprint N - Week X

**Goal:** [One-sentence goal]

### Stories

1. **[Story Name]**
   - [ ] Task 1
   - [ ] Task 2
   - [ ] Tests
   - [ ] Documentation

**Acceptance Criteria:**

- [ ] Criterion 1
- [ ] Criterion 2

**Definition of Done:**

- [ ] Code reviewed
- [ ] Tests passing
- [ ] Deployed to staging
- [ ] Documentation updated
```

## When to Flag for Manual Review

```typescript
// Always flag if:
- confidence < 0.85
- impact === 'critical' && confidence < 0.95
- violation.id in ['color-contrast', 'aria-*', 'heading-order']
- element.isHidden === true
- element.isInModal === true
```

## AI Prompt Templates

### Email Drafting

```typescript
const prompt = `
You are a WCAG accessibility consultant drafting a cold email.

Prospect: ${company.name} (${company.vertical})
Website: ${company.url}
Violations: ${violations.length} critical issues

Requirements:
- 150 words max
- Consultative, not salesy
- Include 1 specific example
- End with clear CTA (15-min call)
- Mention legal risk (ADA Title III)
- Include ROI estimate

Output format:
Subject: [subject line]
Body: [email body]
`;
```

### Remediation Ticket

```typescript
const prompt = `
Generate a Jira ticket for developers to fix this WCAG violation:

Violation: ${violation.help}
Impact: ${violation.impact}
Element: ${violation.nodes[0].html}
WCAG Criteria: ${violation.tags.join(', ')}

Requirements:
- Technical description
- Step-by-step fix
- Code example
- Acceptance criteria
- Estimated effort (hours)

Output as markdown.
`;
```

## Common Pitfalls to Avoid

1. **Don't scan without rate limiting** - You'll get IP banned
2. **Don't store raw screenshots in DB** - Use S3 with presigned URLs
3. **Don't run Puppeteer in main thread** - Use BullMQ worker
4. **Don't trust axe-core 100%** - Apply confidence scoring
5. **Don't skip error handling** - Puppeteer crashes often
6. **Don't hardcode viewport** - Test mobile + desktop
7. **Don't ignore incomplete violations** - They need manual review
8. **Don't forget ARIA labels** - Your own dashboard must be accessible

## References

- [WCAG 2.2 Guidelines](https://www.w3.org/WAI/WCAG22/quickref/)
- [axe-core Rules](https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md)
- [Puppeteer Docs](https://pptr.dev/)
- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)
- [BullMQ Patterns](https://docs.bullmq.io/patterns/flows)

---

**Last Updated:** November 10, 2025
**Version:** 1.0
**Maintainer:** Development Team
