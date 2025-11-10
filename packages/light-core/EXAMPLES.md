# Light Core Usage Examples

This document provides practical examples of using Light Core in WCAGAI.

## Table of Contents
1. [Basic Model Call Protection](#basic-model-call-protection)
2. [Using Light Context](#using-light-context)
3. [Handling Review Results](#handling-review-results)
4. [Testing with Light Helpers](#testing-with-light-helpers)
5. [Middleware Configuration](#middleware-configuration)

## Basic Model Call Protection

### ❌ Wrong Way - Direct AI Call (NEVER DO THIS)

```javascript
// This bypasses all ethical safeguards!
const result = await openai.chat.completions.create({
  model: 'gpt-4',
  messages: [{ role: 'user', content: userInput }]
});
```

### ✅ Correct Way - Using lightModelCall

```javascript
const { lightModelCall } = require('@wcagai/light-core');

const result = await lightModelCall(
  async () => {
    return await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: userInput }]
    });
  },
  {
    userId: req.userId || 'anonymous',
    purpose: 'Generate accessibility report',
    sensitivityLevel: 'high',
    metadata: {
      url: targetUrl,
      timestamp: Date.now()
    }
  }
);

// Result contains:
// - result.data: The actual AI response
// - result.lightReview: Ethical review metadata
// - result.context: The context used for the call
```

## Using Light Context

Light Context defines the ethical parameters for each AI interaction.

### Low Sensitivity - Simple Queries

```javascript
const context = {
  userId: 'user123',
  purpose: 'Fetch site metadata',
  sensitivityLevel: 'low'
};

const result = await lightModelCall(
  async () => await fetchMetadata(url),
  context
);
```

### High Sensitivity - Accessibility Analysis

```javascript
const context = {
  userId: req.userId,
  purpose: 'Analyze accessibility violations',
  sensitivityLevel: 'high',
  metadata: {
    vertical: 'healthcare',
    wcagLevel: 'AA',
    userAgent: req.get('user-agent')
  }
};

const result = await lightModelCall(
  async () => {
    const violations = await scanner.scan(url);
    return analyzeViolations(violations);
  },
  context
);
```

### Critical Sensitivity - Medical/Financial Content

```javascript
const context = {
  userId: req.userId,
  purpose: 'Process medical form accessibility',
  sensitivityLevel: 'critical', // Triggers extra scrutiny
  metadata: {
    formType: 'medical-consent',
    requiresAudit: true
  }
};

const result = await lightModelCall(
  async () => await processForm(formData),
  context
);

// Critical level means any issues trigger warnings
if (result.lightReview.warnings.length > 0) {
  // Alert compliance team
  await notifyComplianceTeam(result);
}
```

## Handling Review Results

### Checking Truthfulness

```javascript
const result = await lightModelCall(fn, context);

switch (result.lightReview.truthfulness) {
  case 'ok':
    // Response is clear and factual
    console.log('Response passed truthfulness check');
    break;
    
  case 'uncertain':
    // Response contains uncertainty markers
    console.warn('Response flagged as uncertain');
    // Add disclaimer to user
    response.disclaimer = 'This information may be uncertain';
    break;
    
  case 'needs_review':
    // Response contains absolute statements that need verification
    console.error('Response needs manual review');
    // Queue for human review
    await queueForReview(result);
    break;
}
```

### Checking for Trauma Language

```javascript
const result = await lightModelCall(fn, context);

if (result.lightReview.trauma === 'soften_language') {
  console.warn('Potentially harmful language detected:', 
    result.lightReview.issues);
  
  // Rewrite or reject
  if (autoRewrite) {
    // Attempt to soften language automatically
    const rewritten = await softenLanguage(result.data);
    return rewritten;
  } else {
    // Reject and log
    throw new Error('Response contains harmful language');
  }
}
```

### Checking Accessibility

```javascript
const result = await lightModelCall(fn, context);

if (result.lightReview.accessibility === 'missing_explanation') {
  console.warn('Some content lacks explanations:', 
    result.lightReview.issues);
  
  // Add explanations
  const enhanced = await addExplanations(result.data);
  return enhanced;
}
```

### Complete Example - API Endpoint

```javascript
const express = require('express');
const { lightModelCall, attachLightContext } = require('@wcagai/light-core');
const router = express.Router();

router.use(attachLightContext);

router.post('/analyze', async (req, res) => {
  try {
    const { url } = req.body;
    
    // Perform analysis with Light protection
    const result = await lightModelCall(
      async () => {
        const violations = await scannerService.scan(url);
        return {
          url,
          violations,
          summary: generateSummary(violations)
        };
      },
      req.lightContext
    );

    // Check review results
    const { lightReview, data } = result;
    
    if (lightReview.issues.length > 0) {
      console.warn('Review issues:', lightReview.issues);
    }

    // Send response with review metadata
    res.json({
      success: true,
      data,
      lightReview: {
        truthfulness: lightReview.truthfulness,
        trauma: lightReview.trauma,
        accessibility: lightReview.accessibility,
        issues: lightReview.issues
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Analysis failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
```

## Testing with Light Helpers

### Basic Test Structure

```javascript
const { 
  expectExplainable,
  expectNoTraumaLanguage,
  expectPrincipleConformance 
} = require('@wcagai/light-core/light-tests');

describe('Accessibility Analysis API', () => {
  it('should return explainable results', async () => {
    const response = await request(app)
      .post('/api/analyze')
      .send({ url: 'https://example.com' });

    expect(response.status).toBe(200);
    
    // Ensure response is explainable
    expectExplainable(response.body.data);
  });

  it('should not contain trauma language', async () => {
    const response = await request(app)
      .get('/api/help/error-messages');

    expect(response.status).toBe(200);
    
    // Check all error messages
    for (const message of response.body.messages) {
      expectNoTraumaLanguage(message);
    }
  });

  it('should conform to Light principles', async () => {
    const result = await lightModelCall(
      async () => await analyzeContent('Test content'),
      {
        userId: 'test-user',
        purpose: 'Test analysis',
        sensitivityLevel: 'medium'
      }
    );

    // This will throw if principles are violated
    expectPrincipleConformance(result);
  });
});
```

### Custom Jest Matchers

```javascript
const { lightMatchers } = require('@wcagai/light-core/light-tests');

// Extend Jest with Light matchers
expect.extend(lightMatchers);

describe('Content Generation', () => {
  it('should generate accessible content', async () => {
    const result = await lightModelCall(
      async () => await generateContent(),
      testContext
    );

    // Use custom matchers
    expect(result).toConformToPrinciples();
    expect(result.data).toBeExplainable();
    expect(result.data.text).toHaveNoTraumaLanguage();
  });
});
```

## Middleware Configuration

### Basic Configuration

```javascript
const express = require('express');
const {
  attachLightContext,
  logLightReviewMiddleware,
  addCharterHeaders
} = require('@wcagai/light-core');

const app = express();

// Apply Light middleware
app.use(addCharterHeaders);
app.use(attachLightContext);
app.use(logLightReviewMiddleware);
```

### Strict Mode (Production)

```javascript
const { failOnPrincipleViolation } = require('@wcagai/light-core');

// Enable strict mode in production
if (process.env.NODE_ENV === 'production') {
  app.use(failOnPrincipleViolation({
    enabled: true,
    allowWarnings: false // Fail on any warnings
  }));
}
```

### Audit Logging

```javascript
const { auditLogRequests } = require('@wcagai/light-core');

// Log all requests for compliance
app.use(auditLogRequests);

// Logs will be written to:
// - logs/light-error.log (errors only)
// - logs/light-combined.log (all events)
```

### Custom Context per Route

```javascript
const { attachLightContext } = require('@wcagai/light-core');

// Override default context for specific routes
app.use('/api/medical', (req, res, next) => {
  req.lightContext = {
    userId: req.user?.id || 'anonymous',
    purpose: `Medical API: ${req.method} ${req.path}`,
    sensitivityLevel: 'critical', // Override to critical
    metadata: {
      hipaaCompliant: true,
      auditRequired: true
    }
  };
  next();
});
```

## Using Accessibility Rules

### Validating Against Base Ruleset

```javascript
const { 
  BASE_ISSUES, 
  getIssueById, 
  isCritical,
  isValidIssueId 
} = require('@wcagai/light-core');

// Get specific issue details
const contrastIssue = getIssueById('COLOR_CONTRAST');
console.log(contrastIssue.wcagRef); // "WCAG 2.1 Level AA (1.4.3)"
console.log(contrastIssue.suggestion);

// Check if issue is critical
if (isCritical(contrastIssue)) {
  console.log('This issue must never pass!');
}

// Validate AI isn't creating issues outside the ruleset
function validateViolations(violations) {
  for (const violation of violations) {
    if (!isValidIssueId(violation.id)) {
      throw new Error(
        `AI created invalid issue: ${violation.id}. ` +
        `Must use issues from BASE_ISSUES only.`
      );
    }
  }
}
```

### Using Prompts Safely

```javascript
const { 
  buildSafePrompt, 
  WCAG_AI_SYSTEM_PROMPT 
} = require('@wcagai/light-core');

// Build safe prompt with injection protection
const { system, user } = buildSafePrompt(
  req.body.userInput,
  'wcagai'
);

const result = await lightModelCall(
  async () => {
    return await aiModel.chat([
      { role: 'system', content: system },
      { role: 'user', content: user }
    ]);
  },
  req.lightContext
);
```

## Advanced Patterns

### Batch Processing with Light Guard

```javascript
async function processBatch(urls, context) {
  const results = [];
  
  for (const url of urls) {
    const result = await lightModelCall(
      async () => await scanUrl(url),
      {
        ...context,
        purpose: `Batch scan: ${url}`
      }
    );
    
    results.push(result);
  }
  
  return results;
}
```

### Caching Light-Protected Results

```javascript
const cache = new Map();

async function getCachedAnalysis(url, context) {
  const cacheKey = `light:${url}`;
  
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }
  
  const result = await lightModelCall(
    async () => await analyzeUrl(url),
    context
  );
  
  // Only cache if review passed
  if (result.lightReview.issues.length === 0) {
    cache.set(cacheKey, result);
  }
  
  return result;
}
```

---

**Remember**: Every AI interaction must go through `lightModelCall`. Direct calls bypass all ethical safeguards and violate the Light Charter. Ethics is architecture, not vibes.
