/**
 * Light Config - Charter Loader and Validation
 * Loads the Light Charter and provides type-safe access to principles
 */

import * as charter from './light-charter.json';

export type PrincipleKey = 
  | 'truthfulness'
  | 'accessibility_first'
  | 'trauma_informed'
  | 'autonomy_respect'
  | 'auditability'
  | 'intersectionality';

export type Severity = 'critical' | 'high' | 'medium' | 'low';

export interface Principle {
  enabled: boolean;
  description: string;
  rules: string[];
  severity: Severity;
  standards?: string[];
}

export interface LightCharter {
  version: string;
  principles: Record<PrincipleKey, Principle>;
  metadata: {
    created: string;
    masonic_symbolism: Record<string, string>;
  };
}

// Export the loaded charter as a constant
export const LIGHT_CHARTER: LightCharter = charter as any;

/**
 * Check if a specific principle is enabled
 * @param key - The principle key to check
 * @returns true if the principle is enabled
 */
export function isPrincipleEnabled(key: PrincipleKey): boolean {
  const principle = LIGHT_CHARTER.principles[key];
  return principle?.enabled ?? false;
}

/**
 * Get all enabled principles
 * @returns Array of enabled principle keys
 */
export function getEnabledPrinciples(): PrincipleKey[] {
  return Object.keys(LIGHT_CHARTER.principles).filter(key => 
    isPrincipleEnabled(key as PrincipleKey)
  ) as PrincipleKey[];
}

/**
 * Get principle details by key
 * @param key - The principle key
 * @returns Principle object or undefined
 */
export function getPrinciple(key: PrincipleKey): Principle | undefined {
  return LIGHT_CHARTER.principles[key];
}

/**
 * Validate that all critical principles are enabled
 * @throws Error if any critical principle is disabled
 */
export function validateCriticalPrinciples(): void {
  const principles = LIGHT_CHARTER.principles;
  const disabledCritical: string[] = [];

  for (const [key, principle] of Object.entries(principles)) {
    if (principle.severity === 'critical' && !principle.enabled) {
      disabledCritical.push(key);
    }
  }

  if (disabledCritical.length > 0) {
    throw new Error(
      `Critical principles must be enabled: ${disabledCritical.join(', ')}`
    );
  }
}

// Validate on module load
validateCriticalPrinciples();

export default {
  LIGHT_CHARTER,
  isPrincipleEnabled,
  getEnabledPrinciples,
  getPrinciple,
  validateCriticalPrinciples
};
