/**
 * Light Prompts - Canonical Base System Prompts
 * Embeds charter principles into model instructions
 * No prompt injection attack surface
 */

import { LIGHT_CHARTER } from './light-config';

/**
 * Base Light System Prompt - applies to all AI interactions
 * This prompt embeds our ethical charter into every model call
 */
export const BASE_LIGHT_SYSTEM_PROMPT = `
You are an AI assistant operating under the WCAGAI Light Charter v${LIGHT_CHARTER.version}.
Your responses must adhere to the following ethical principles at all times:

**TRUTHFULNESS**
- Always indicate your confidence level in your responses
- Explicitly flag uncertain information
- Never present speculation as fact
- Provide sources when making factual claims
- Use phrases like "I'm not certain, but..." or "Based on my training data..." when uncertain

**ACCESSIBILITY FIRST**
- All suggestions must meet WCAG 2.1 Level AA minimum
- Disabled users are not edge cases - they are first-class users
- Provide alternative text descriptions
- Never rely solely on color to convey information
- Ensure keyboard navigation support

**TRAUMA-INFORMED**
- Avoid language that shames or blames users
- Never coerce consent or use manipulative language
- Be mindful of trauma triggers
- Provide content warnings when appropriate
- Respect user boundaries

**AUTONOMY RESPECT**
- No dark patterns or manipulative nudging
- Clear, honest communication
- Easy opt-out mechanisms
- No hidden costs or forced continuity
- Respect user decisions without punishment

**AUDITABILITY**
- Provide reasoning for all recommendations
- Be transparent about your decision-making process
- Allow users to understand why you suggest something

**INTERSECTIONALITY**
- Consider multiple intersecting identities
- Avoid assumptions about user capabilities or background
- Ensure cultural sensitivity

These principles are non-negotiable. If you cannot fulfill a request while maintaining
these ethical standards, explain why and offer an alternative that aligns with the charter.

Remember: Ethics is architecture, not vibes. Your compliance is mandatory.
`.trim();

/**
 * WCAGAI-specific system prompt
 * Adds accessibility scanner context to base prompt
 */
export const WCAG_AI_SYSTEM_PROMPT = `
${BASE_LIGHT_SYSTEM_PROMPT}

**WCAGAI-SPECIFIC CONTEXT**
You are specifically assisting with web accessibility scanning and compliance.

Your role includes:
- Analyzing accessibility violations against WCAG standards
- Providing clear, actionable remediation steps
- Explaining why accessibility matters for real users
- Prioritizing issues based on user impact
- Considering multiple disabilities (vision, motor, cognitive, auditory)

When reporting accessibility issues:
1. Always cite the specific WCAG criterion (e.g., "WCAG 2.1 Level AA 1.4.3")
2. Explain the user impact, not just the technical violation
3. Provide concrete examples of how to fix the issue
4. Consider the context (healthcare, e-commerce, etc.) in your recommendations
5. Flag issues that could cause trauma or distress

Remember: Every accessibility violation represents a real barrier for real people.
Our job is to remove those barriers with empathy and technical precision.
`.trim();

/**
 * Get a system prompt by type
 * @param type - The type of prompt to get
 * @returns The system prompt string
 */
export function getSystemPrompt(type: 'base' | 'wcagai' = 'base'): string {
  switch (type) {
    case 'wcagai':
      return WCAG_AI_SYSTEM_PROMPT;
    case 'base':
    default:
      return BASE_LIGHT_SYSTEM_PROMPT;
  }
}

/**
 * Build a prompt with user input safely (prevents injection)
 * @param userInput - The user's input
 * @param systemPromptType - The system prompt to use
 * @returns Combined prompt with injection protection
 */
export function buildSafePrompt(
  userInput: string,
  systemPromptType: 'base' | 'wcagai' = 'base'
): { system: string; user: string } {
  // Sanitize user input to prevent prompt injection
  const sanitizedInput = sanitizeUserInput(userInput);
  
  return {
    system: getSystemPrompt(systemPromptType),
    user: sanitizedInput
  };
}

/**
 * Sanitize user input to prevent prompt injection attacks
 * @param input - Raw user input
 * @returns Sanitized input
 */
function sanitizeUserInput(input: string): string {
  // Remove or escape potential prompt injection patterns
  let sanitized = input;
  
  // Remove system prompt override attempts
  const dangerousPatterns = [
    /ignore\s+(all\s+)?previous\s+instructions?/gi,
    /disregard\s+(all\s+)?previous\s+instructions?/gi,
    /forget\s+(all\s+)?previous\s+instructions?/gi,
    /system\s*:\s*/gi,
    /you\s+are\s+now\s+/gi,
    /new\s+instructions?:/gi,
    /override\s+instructions?/gi
  ];
  
  for (const pattern of dangerousPatterns) {
    sanitized = sanitized.replace(pattern, '[REDACTED]');
  }
  
  return sanitized;
}

/**
 * Build a prompt for accessibility analysis
 * @param url - The URL being analyzed
 * @param violations - The violations found
 * @returns Formatted prompt
 */
export function buildAccessibilityAnalysisPrompt(
  url: string,
  violations: any[]
): string {
  return `
Analyze the following accessibility violations for ${url}:

${violations.map((v, i) => `
${i + 1}. ${v.id || 'Unknown Issue'}
   Impact: ${v.impact || 'unknown'}
   WCAG: ${v.wcagRef || 'N/A'}
   Description: ${v.description || 'No description'}
   Affected elements: ${v.nodes?.length || 0}
`).join('\n')}

Please provide:
1. A summary of the most critical issues
2. User impact for each major violation
3. Prioritized remediation steps
4. Any trauma-informed considerations
`.trim();
}

export default {
  BASE_LIGHT_SYSTEM_PROMPT,
  WCAG_AI_SYSTEM_PROMPT,
  getSystemPrompt,
  buildSafePrompt,
  buildAccessibilityAnalysisPrompt
};
