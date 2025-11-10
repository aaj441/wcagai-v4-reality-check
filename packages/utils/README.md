# @wcag-ai/utils

Shared utilities for the WCAG AI Compliance Consultant Platform.

## Features

- Input validators using Zod
- Logger utility
- Common helper functions

## Usage

### Validators

```typescript
import { validateUrl, validateScanInput } from '@wcag-ai/utils';

// Validate URL
const isValid = validateUrl('https://example.com');

// Validate scan input
const input = validateScanInput({
  url: 'https://example.com',
  options: {
    viewport: { width: 1920, height: 1080 },
    timeout: 30000,
  },
});
```

### Logger

```typescript
import { logger } from '@wcag-ai/utils';

logger.info('Scan started', { url, scanId });
logger.error('Scan failed', { error: error.message });
logger.warn('Low confidence score', { score });
logger.debug('Processing node', { node });
```

## Development

```bash
# Build
pnpm build

# Test
pnpm test

# Type check
pnpm type-check
```
