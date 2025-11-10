/**
 * Light Guard - Wraps ALL AI Model Calls
 * Enforces Light Charter on every AI interaction
 */

import { isPrincipleEnabled } from './light-config';
import { lightLogger } from './light-logger';

export type TruthfulnessFlag = 'ok' | 'uncertain' | 'needs_review';
export type TraumaFlag = 'ok' | 'soften_language';
export type AccessibilityFlag = 'ok' | 'missing_explanation';

export interface LightContext {
  userId?: string;
  purpose: string;
  sensitivityLevel: 'low' | 'medium' | 'high' | 'critical';
  metadata?: Record<string, any>;
}

export interface LightReview {
  truthfulness: TruthfulnessFlag;
  trauma: TraumaFlag;
  accessibility: AccessibilityFlag;
  issues: string[];
  warnings: string[];
  timestamp: string;
}

export interface GuardedResponse<T = any> {
  data: T;
  lightReview: LightReview;
  context: LightContext;
}

/**
 * Raw model call wrapper - DO NOT USE DIRECTLY
 * This is for internal use only, all external calls must use lightModelCall
 */
export async function rawModelCall<T>(
  modelFn: () => Promise<T>,
  context: LightContext
): Promise<T> {
  const startTime = Date.now();
  
  try {
    lightLogger.info('Raw model call initiated', {
      purpose: context.purpose,
      sensitivityLevel: context.sensitivityLevel
    });

    const result = await modelFn();
    const duration = Date.now() - startTime;

    lightLogger.info('Raw model call completed', {
      purpose: context.purpose,
      duration
    });

    return result;
  } catch (error: any) {
    lightLogger.error('Raw model call failed', {
      purpose: context.purpose,
      error: error.message
    });
    throw error;
  }
}

/**
 * Review response for truthfulness issues
 */
function reviewTruthfulness(response: any): { flag: TruthfulnessFlag; issues: string[] } {
  const issues: string[] = [];
  
  if (!isPrincipleEnabled('truthfulness')) {
    return { flag: 'ok', issues };
  }

  const responseText = typeof response === 'string' ? response : JSON.stringify(response);
  
  // Check for uncertainty markers
  const uncertaintyMarkers = [
    'might', 'maybe', 'possibly', 'could be', 'appears to be',
    'seems like', 'probably', 'likely', 'perhaps'
  ];
  
  const hasUncertaintyMarkers = uncertaintyMarkers.some(marker => 
    responseText.toLowerCase().includes(marker)
  );

  // Check for absolute statements without sources
  const absoluteStatements = [
    'definitely', 'certainly', 'absolutely', 'always', 'never',
    'all', 'none', 'everyone', 'no one'
  ];
  
  const hasAbsoluteStatements = absoluteStatements.some(marker => 
    responseText.toLowerCase().includes(marker)
  );

  if (hasUncertaintyMarkers) {
    issues.push('Response contains uncertainty markers - ensure user understands limitations');
    return { flag: 'uncertain', issues };
  }

  if (hasAbsoluteStatements) {
    issues.push('Response contains absolute statements - verify factual accuracy');
    return { flag: 'needs_review', issues };
  }

  return { flag: 'ok', issues };
}

/**
 * Review response for trauma-informed language
 */
function reviewTraumaLanguage(response: any): { flag: TraumaFlag; issues: string[] } {
  const issues: string[] = [];
  
  if (!isPrincipleEnabled('trauma_informed')) {
    return { flag: 'ok', issues };
  }

  const responseText = typeof response === 'string' ? response : JSON.stringify(response);
  
  // Check for potentially harmful language
  const harmfulPatterns = [
    'you should', 'you must', 'you have to', 'you need to',
    'stupid', 'idiot', 'dumb', 'lazy', 'wrong',
    'fault', 'blame', 'failure', 'failed'
  ];
  
  const foundHarmful = harmfulPatterns.filter(pattern => 
    responseText.toLowerCase().includes(pattern)
  );

  if (foundHarmful.length > 0) {
    issues.push(`Potentially harmful language detected: ${foundHarmful.join(', ')}`);
    return { flag: 'soften_language', issues };
  }

  return { flag: 'ok', issues };
}

/**
 * Review response for accessibility
 */
function reviewAccessibility(response: any): { flag: AccessibilityFlag; issues: string[] } {
  const issues: string[] = [];
  
  if (!isPrincipleEnabled('accessibility_first')) {
    return { flag: 'ok', issues };
  }

  // Check if response has explanations for recommendations
  if (typeof response === 'object' && response !== null) {
    if (response.violations && Array.isArray(response.violations)) {
      const hasExplanations = response.violations.every((v: any) => 
        v.description || v.help || v.helpUrl
      );
      
      if (!hasExplanations) {
        issues.push('Some violations lack clear explanations');
        return { flag: 'missing_explanation', issues };
      }
    }
  }

  return { flag: 'ok', issues };
}

/**
 * Light Model Call - REQUIRED for ALL AI interactions
 * Enforces charter on every response
 * 
 * @param modelFn - The AI model function to call
 * @param context - The Light Context for this call
 * @returns GuardedResponse with lightReview metadata
 */
export async function lightModelCall<T>(
  modelFn: () => Promise<T>,
  context: LightContext
): Promise<GuardedResponse<T>> {
  const startTime = Date.now();
  const callId = `light-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  lightLogger.info('Light model call initiated', {
    callId,
    purpose: context.purpose,
    sensitivityLevel: context.sensitivityLevel,
    userId: context.userId
  });

  try {
    // Execute the model call
    const data = await rawModelCall(modelFn, context);

    // Review the response
    const truthfulnessReview = reviewTruthfulness(data);
    const traumaReview = reviewTraumaLanguage(data);
    const accessibilityReview = reviewAccessibility(data);

    const issues = [
      ...truthfulnessReview.issues,
      ...traumaReview.issues,
      ...accessibilityReview.issues
    ];

    const warnings: string[] = [];

    // Add warnings based on sensitivity level
    if (context.sensitivityLevel === 'critical' && issues.length > 0) {
      warnings.push('CRITICAL sensitivity level with issues detected - manual review required');
    }

    const lightReview: LightReview = {
      truthfulness: truthfulnessReview.flag,
      trauma: traumaReview.flag,
      accessibility: accessibilityReview.flag,
      issues,
      warnings,
      timestamp: new Date().toISOString()
    };

    const duration = Date.now() - startTime;

    // Log the review results
    if (issues.length > 0 || warnings.length > 0) {
      lightLogger.warn('Light review found issues', {
        callId,
        issues,
        warnings,
        lightReview,
        duration
      });
    } else {
      lightLogger.info('Light model call completed successfully', {
        callId,
        lightReview,
        duration
      });
    }

    // Log principle violations as errors
    if (truthfulnessReview.flag !== 'ok' || 
        traumaReview.flag !== 'ok' || 
        accessibilityReview.flag !== 'ok') {
      lightLogger.error('Principle violation detected', {
        callId,
        truthfulness: truthfulnessReview.flag,
        trauma: traumaReview.flag,
        accessibility: accessibilityReview.flag,
        issues
      });
    }

    return {
      data,
      lightReview,
      context
    };

  } catch (error: any) {
    const duration = Date.now() - startTime;
    
    lightLogger.error('Light model call failed', {
      callId,
      purpose: context.purpose,
      error: error.message,
      duration
    });

    throw error;
  }
}

/**
 * Validate that a response meets all principle requirements
 * @throws Error if validation fails
 */
export function validatePrincipleConformance(review: LightReview): void {
  if (review.truthfulness === 'needs_review') {
    throw new Error('Truthfulness principle violation: Response needs review');
  }

  if (review.trauma === 'soften_language') {
    throw new Error('Trauma-informed principle violation: Language needs softening');
  }

  if (review.accessibility === 'missing_explanation') {
    throw new Error('Accessibility principle violation: Missing explanations');
  }

  if (review.warnings.length > 0) {
    throw new Error(`Principle warnings: ${review.warnings.join('; ')}`);
  }
}

export default {
  lightModelCall,
  rawModelCall,
  validatePrincipleConformance
};
