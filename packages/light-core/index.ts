/**
 * Light Core - Main Export
 * Ethical architecture embedded into WCAGAI
 */

// Configuration
export * from './light-config';

// Guard and model calls
export * from './light-guard';

// Accessibility rules
export * from './a11y-rules';

// Prompts
export * from './light-prompts';

// Logger
export * from './light-logger';

// Middleware
export * from './light-middleware';

// Test helpers
export * as lightTests from './light-tests';

// Re-export charter as named export
import charter from './light-charter.json';
export { charter as lightCharter };
