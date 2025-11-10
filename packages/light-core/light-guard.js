"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rawModelCall = rawModelCall;
exports.lightModelCall = lightModelCall;
exports.validatePrincipleConformance = validatePrincipleConformance;
const light_config_1 = require("./light-config");
const light_logger_1 = require("./light-logger");
async function rawModelCall(modelFn, context) {
    const startTime = Date.now();
    try {
        light_logger_1.lightLogger.info('Raw model call initiated', {
            purpose: context.purpose,
            sensitivityLevel: context.sensitivityLevel
        });
        const result = await modelFn();
        const duration = Date.now() - startTime;
        light_logger_1.lightLogger.info('Raw model call completed', {
            purpose: context.purpose,
            duration
        });
        return result;
    }
    catch (error) {
        light_logger_1.lightLogger.error('Raw model call failed', {
            purpose: context.purpose,
            error: error.message
        });
        throw error;
    }
}
function reviewTruthfulness(response) {
    const issues = [];
    if (!(0, light_config_1.isPrincipleEnabled)('truthfulness')) {
        return { flag: 'ok', issues };
    }
    const responseText = typeof response === 'string' ? response : JSON.stringify(response);
    const uncertaintyMarkers = [
        'might', 'maybe', 'possibly', 'could be', 'appears to be',
        'seems like', 'probably', 'likely', 'perhaps'
    ];
    const hasUncertaintyMarkers = uncertaintyMarkers.some(marker => responseText.toLowerCase().includes(marker));
    const absoluteStatements = [
        'definitely', 'certainly', 'absolutely', 'always', 'never',
        'all', 'none', 'everyone', 'no one'
    ];
    const hasAbsoluteStatements = absoluteStatements.some(marker => responseText.toLowerCase().includes(marker));
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
function reviewTraumaLanguage(response) {
    const issues = [];
    if (!(0, light_config_1.isPrincipleEnabled)('trauma_informed')) {
        return { flag: 'ok', issues };
    }
    const responseText = typeof response === 'string' ? response : JSON.stringify(response);
    const harmfulPatterns = [
        'you should', 'you must', 'you have to', 'you need to',
        'stupid', 'idiot', 'dumb', 'lazy', 'wrong',
        'fault', 'blame', 'failure', 'failed'
    ];
    const foundHarmful = harmfulPatterns.filter(pattern => responseText.toLowerCase().includes(pattern));
    if (foundHarmful.length > 0) {
        issues.push(`Potentially harmful language detected: ${foundHarmful.join(', ')}`);
        return { flag: 'soften_language', issues };
    }
    return { flag: 'ok', issues };
}
function reviewAccessibility(response) {
    const issues = [];
    if (!(0, light_config_1.isPrincipleEnabled)('accessibility_first')) {
        return { flag: 'ok', issues };
    }
    if (typeof response === 'object' && response !== null) {
        if (response.violations && Array.isArray(response.violations)) {
            const hasExplanations = response.violations.every((v) => v.description || v.help || v.helpUrl);
            if (!hasExplanations) {
                issues.push('Some violations lack clear explanations');
                return { flag: 'missing_explanation', issues };
            }
        }
    }
    return { flag: 'ok', issues };
}
async function lightModelCall(modelFn, context) {
    const startTime = Date.now();
    const callId = `light-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    light_logger_1.lightLogger.info('Light model call initiated', {
        callId,
        purpose: context.purpose,
        sensitivityLevel: context.sensitivityLevel,
        userId: context.userId
    });
    try {
        const data = await rawModelCall(modelFn, context);
        const truthfulnessReview = reviewTruthfulness(data);
        const traumaReview = reviewTraumaLanguage(data);
        const accessibilityReview = reviewAccessibility(data);
        const issues = [
            ...truthfulnessReview.issues,
            ...traumaReview.issues,
            ...accessibilityReview.issues
        ];
        const warnings = [];
        if (context.sensitivityLevel === 'critical' && issues.length > 0) {
            warnings.push('CRITICAL sensitivity level with issues detected - manual review required');
        }
        const lightReview = {
            truthfulness: truthfulnessReview.flag,
            trauma: traumaReview.flag,
            accessibility: accessibilityReview.flag,
            issues,
            warnings,
            timestamp: new Date().toISOString()
        };
        const duration = Date.now() - startTime;
        if (issues.length > 0 || warnings.length > 0) {
            light_logger_1.lightLogger.warn('Light review found issues', {
                callId,
                issues,
                warnings,
                lightReview,
                duration
            });
        }
        else {
            light_logger_1.lightLogger.info('Light model call completed successfully', {
                callId,
                lightReview,
                duration
            });
        }
        if (truthfulnessReview.flag !== 'ok' ||
            traumaReview.flag !== 'ok' ||
            accessibilityReview.flag !== 'ok') {
            light_logger_1.lightLogger.error('Principle violation detected', {
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
    }
    catch (error) {
        const duration = Date.now() - startTime;
        light_logger_1.lightLogger.error('Light model call failed', {
            callId,
            purpose: context.purpose,
            error: error.message,
            duration
        });
        throw error;
    }
}
function validatePrincipleConformance(review) {
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
exports.default = {
    lightModelCall,
    rawModelCall,
    validatePrincipleConformance
};
