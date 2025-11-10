# Scanner Service

Puppeteer-based WCAG scanner service for automated accessibility testing.

## Features

- Headless browser automation with Puppeteer 22
- WCAG compliance testing with axe-core 4.8
- Integrated ConfidenceScoringEngine
- BullMQ worker for job queue processing
- Screenshot capture
- Redis-based caching

## Architecture

```
Scanner Worker
├── Listen for scan jobs (BullMQ)
├── Launch Puppeteer browser
├── Navigate to URL
├── Inject axe-core
├── Run accessibility tests
├── Score violations (ConfidenceScoringEngine)
├── Capture screenshots
├── Save results to database
└── Update job status
```

## Usage

```bash
# Development
pnpm dev

# Build
pnpm build

# Start production
pnpm start

# Test
pnpm test
```

## Configuration

Environment variables:

```env
REDIS_URL=redis://localhost:6379
SCANNER_TIMEOUT=30000
MAX_CONCURRENT_SCANS=5
SCANNER_VIEWPORT_WIDTH=1920
SCANNER_VIEWPORT_HEIGHT=1080
DATABASE_URL=postgresql://...
```

## Job Processing

The scanner processes jobs from a BullMQ queue:

```typescript
// Job payload
{
  url: 'https://example.com',
  options: {
    viewport: { width: 1920, height: 1080 },
    timeout: 30000,
    waitForSelector: '.main-content'
  }
}

// Job result
{
  url: 'https://example.com',
  timestamp: '2025-11-10T14:00:00.000Z',
  violations: [...],
  screenshot: 'base64...',
  metadata: {
    duration: 5234,
    browserVersion: 'Chrome/120.0.0.0',
    viewportSize: { width: 1920, height: 1080 }
  }
}
```

## Error Handling

- Timeout after 30 seconds (configurable)
- Retry failed scans up to 3 times
- Graceful error messages
- Detailed error logging
