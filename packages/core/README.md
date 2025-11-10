# @wcag-ai/core

Core business logic for the WCAG AI Compliance Consultant Platform.

## Features

- **ConfidenceScoringEngine**: Rule-based confidence scoring for WCAG violations
- Shared TypeScript interfaces and types
- Business logic and domain models

## Usage

```typescript
import { ConfidenceScoringEngine, ViolationInput } from '@wcag-ai/core';

const engine = new ConfidenceScoringEngine();

const violation: ViolationInput = {
  id: 'color-contrast',
  impact: 'serious',
  tags: ['wcag2aa', 'wcag143'],
  nodes: [{
    html: '<button>Submit</button>',
    target: ['button'],
    failureSummary: 'Insufficient color contrast'
  }],
  description: 'Elements must have sufficient color contrast',
  help: 'Ensure text has contrast ratio of at least 4.5:1',
  helpUrl: 'https://dequeuniversity.com/rules/axe/4.8/color-contrast'
};

const scored = engine.scoreViolation(violation);
console.log(scored.confidence.score); // 87
console.log(scored.confidence.level); // 'high'
```

## API

### ConfidenceScoringEngine

#### Methods

- `scoreViolation(violation: ViolationInput): ScoredViolation`
- `scoreViolations(violations: ViolationInput[]): ScoredViolation[]`
- `getStatistics(scoredViolations: ScoredViolation[]): Statistics`
- `filterByConfidence(scoredViolations: ScoredViolation[], minScore: number): ScoredViolation[]`
- `sortByConfidence(scoredViolations: ScoredViolation[]): ScoredViolation[]`

## Development

```bash
# Build
pnpm build

# Test
pnpm test

# Type check
pnpm type-check
```
