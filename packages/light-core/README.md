# Light Core - Ethical Architecture for WCAGAI

> "Ethics is architecture, not vibes."

Light Core embeds ethical principles into WCAGAI as mandatory middleware and guardrails. Every AI interaction must pass through the Light Charter's scrutiny.

## Philosophy

The Light Charter is inspired by Masonic symbolism:
- **Square**: Tests measure our work
- **Compass**: Scope defines our boundaries  
- **Level**: Fairness ensures equality
- **Plumb**: Integrity keeps us true

These aren't aspirational values—they're enforced constraints in code.

## Core Principles

### 1. Truthfulness
Flag uncertainty, never confident falsehoods
- All AI responses indicate confidence levels
- Uncertain information explicitly flagged
- No speculation presented as fact

### 2. Accessibility First
WCAG AA minimum, disabled users as first-class
- All content meets WCAG 2.1 Level AA
- Disabled users are not edge cases
- Keyboard navigation fully supported

### 3. Trauma-Informed
Language avoids shaming, coerced consent, retraumatization
- No shaming or blaming language
- No coercive patterns
- Content warnings for triggers

### 4. Autonomy Respect
No dark patterns, no manipulative nudging
- Clear, honest communication
- Easy opt-out mechanisms
- Respect user decisions

### 5. Auditability
Every decision logged and explainable
- All AI calls logged with context
- Complete audit trail
- Explainable outputs

### 6. Intersectionality
Marginalized users centered, not as afterthought
- Multiple identities considered
- Diverse user groups inform design
- Cultural sensitivity required

## Usage

### Basic Setup

```javascript
import { lightModelCall, attachLightContext } from '@wcagai/light-core';
import express from 'express';

const app = express();

// Attach Light Context to all requests
app.use(attachLightContext);

// Your route handler
app.post('/api/scan', async (req, res) => {
  // NEVER call AI models directly - always use lightModelCall
  const result = await lightModelCall(
    async () => {
      // Your AI model call here
      return await someAIService.analyze(req.body.url);
    },
    req.lightContext
  );
  
  // Result includes data and lightReview
  res.json({
    data: result.data,
    lightReview: result.lightReview
  });
});
```

### Why ALL AI Calls MUST Use the Guard

Direct AI calls bypass ethical safeguards:

```javascript
// ❌ WRONG - No ethical oversight
const result = await aiModel.generate(prompt);

// ✅ CORRECT - Enforces charter
const result = await lightModelCall(
  async () => await aiModel.generate(prompt),
  {
    userId: 'user123',
    purpose: 'Generate accessibility report',
    sensitivityLevel: 'high'
  }
);
```

The guard provides:
- Truthfulness review (flags uncertain/absolute statements)
- Trauma language detection (identifies harmful patterns)
- Accessibility checks (ensures explanations present)
- Full audit logging
- Principle conformance validation

### Using Light Prompts

```javascript
import { buildSafePrompt, WCAG_AI_SYSTEM_PROMPT } from '@wcagai/light-core';

// Build safe prompts with injection protection
const { system, user } = buildSafePrompt(
  userInput,
  'wcagai'
);

// Use in your AI call
const result = await lightModelCall(
  async () => {
    return await aiModel.chat([
      { role: 'system', content: system },
      { role: 'user', content: user }
    ]);
  },
  context
);
```

### Express Middleware Stack

```javascript
import {
  attachLightContext,
  logLightReviewMiddleware,
  failOnPrincipleViolation,
  addCharterHeaders,
  auditLogRequests
} from '@wcagai/light-core';

// Apply to all routes
app.use(addCharterHeaders);
app.use(attachLightContext);
app.use(auditLogRequests);
app.use(logLightReviewMiddleware);

// Optional: Strict mode - fail on violations
app.use(failOnPrincipleViolation({ 
  enabled: process.env.NODE_ENV === 'production',
  allowWarnings: false 
}));
```

### Accessibility Rules

```javascript
import { 
  BASE_ISSUES, 
  getIssueById, 
  isCritical,
  isValidIssueId 
} from '@wcagai/light-core';

// Get specific issue details
const issue = getIssueById('COLOR_CONTRAST');
console.log(issue.wcagRef); // "WCAG 2.1 Level AA (1.4.3)"
console.log(issue.suggestion); // Remediation steps

// Check if issue is critical
if (isCritical(issue)) {
  // Must never pass
}

// Validate AI isn't creating new issues
if (!isValidIssueId(issueId)) {
  throw new Error('AI cannot freelance beyond BASE_ISSUES');
}
```

## CI Integration

### Jest Test Helpers

```javascript
import { 
  expectExplainable,
  expectNoTraumaLanguage,
  expectAccessible,
  expectPrincipleConformance 
} from '@wcagai/light-core/light-tests';

describe('API Response', () => {
  it('should be explainable', async () => {
    const response = await apiCall();
    expectExplainable(response); // Fails if no reasoning
  });

  it('should have no trauma language', async () => {
    const text = await generateText();
    expectNoTraumaLanguage(text); // Scans for shame/coercion
  });

  it('should be accessible', async () => {
    const html = await generateHTML();
    expectAccessible(html, 'AA'); // WCAG compliance check
  });

  it('should conform to principles', async () => {
    const result = await lightModelCall(fn, context);
    expectPrincipleConformance(result); // Fails if violations
  });
});
```

### Custom Jest Matchers

```javascript
import { lightMatchers } from '@wcagai/light-core/light-tests';

expect.extend(lightMatchers);

test('response quality', async () => {
  const response = await lightModelCall(fn, context);
  
  expect(response).toConformToPrinciples();
  expect(response.data).toBeExplainable();
  expect(textOutput).toHaveNoTraumaLanguage();
});
```

## Configuration

### Environment Variables

```bash
# Set log level for Light Core
LIGHT_LOG_LEVEL=info  # debug, info, warn, error

# Enable strict mode in production
LIGHT_STRICT_MODE=true

# Log directory
LIGHT_LOG_DIR=./logs
```

### Charter Validation

The charter validates itself on load:

```javascript
import { validateCriticalPrinciples } from '@wcagai/light-core';

// Throws if critical principles disabled
validateCriticalPrinciples();
```

## API Endpoints

### GET /api/light/charter

Returns the current Light Charter:

```json
{
  "version": "1.0.0",
  "principles": {
    "truthfulness": {
      "enabled": true,
      "severity": "critical",
      "rules": [...]
    },
    ...
  }
}
```

### GET /api/light/status

Returns principle compliance status:

```json
{
  "enabled": true,
  "version": "1.0.0",
  "principles": {
    "truthfulness": "enabled",
    "accessibility_first": "enabled",
    ...
  },
  "stats": {
    "totalCalls": 1234,
    "violations": 5,
    "warnings": 23
  }
}
```

## Architecture Guarantees

1. **No AI calls bypass the guard** - TypeScript types enforce lightModelCall usage
2. **All decisions are logged** - Winston provides audit trail in JSON format
3. **Critical issues fail fast** - isCritical() issues block deployment
4. **Tests enforce charter** - CI fails if principles violated
5. **Prompt injection prevented** - buildSafePrompt() sanitizes input

## Example: Scanning with Light Guard

```javascript
import { lightModelCall } from '@wcagai/light-core';
import { scannerService } from './services/scanner';

async function performScan(url, context) {
  // Wrap the scanner call
  const result = await lightModelCall(
    async () => {
      const violations = await scannerService.scan(url);
      
      // Process and add explanations
      return {
        url,
        violations: violations.map(v => ({
          ...v,
          explanation: generateExplanation(v),
          wcagRef: v.tags?.find(t => t.startsWith('wcag'))
        }))
      };
    },
    context
  );

  // Check the review
  if (result.lightReview.issues.length > 0) {
    console.warn('Issues detected:', result.lightReview.issues);
  }

  return result;
}
```

## Masonic Symbolism in Practice

### The Square (Tests)
Tests measure our work against the charter:
```javascript
expectPrincipleConformance(response); // Does it measure up?
```

### The Compass (Scope)
Scope defines boundaries - no freelancing:
```javascript
isValidIssueId(id); // Stay within the circle
```

### The Level (Fairness)
Fairness ensures equality:
```javascript
context.sensitivityLevel = 'high'; // Equal treatment
```

### The Plumb (Integrity)
Integrity keeps us true:
```javascript
validateCriticalPrinciples(); // Stand upright
```

## Development

### Building

```bash
cd packages/light-core
npm install
npm run build
```

### Testing

```bash
npm test
```

### Linting

```bash
npm run lint
```

## License

MIT

---

**Remember**: WCAGAI cannot ship a feature without the square and compass checking the work. Ethics is now architecture, not vibes.
