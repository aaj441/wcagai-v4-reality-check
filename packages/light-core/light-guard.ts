import { LIGHT_CHARTER } from './light-config';

export interface LightContext { userId?: string; purpose: string; sensitivity: 'low'|'medium'|'high'; }
export interface ModelResponse { text: string; metadata?: Record<string, any>; }
export interface GuardedResponse extends ModelResponse {
  lightReview: {
    truthfulnessFlag: 'ok'|'uncertain'|'needs_review';
    traumaFlag: 'ok'|'soften_language';
    accessibilityFlag: 'ok'|'missing_explanation';
  };
}
async function rawModelCall(prompt: string): Promise<ModelResponse> {
  // Mock implementation, replace with actual model call
  console.log(`Raw model call with prompt: ${prompt}`);
  return { text: "This is a response from the model." };
}
export async function lightModelCall(prompt: string, ctx: LightContext): Promise<GuardedResponse> {
  const base = await rawModelCall(prompt);
  const review = {
    truthfulnessFlag: LIGHT_CHARTER.principles.truthfulness ? 'uncertain' : 'ok',
    traumaFlag: ctx.sensitivity === 'high' && LIGHT_CHARTER.principles.trauma_informed ? 'soften_language' : 'ok',
    accessibilityFlag: ctx.purpose === 'accessibility_audit' ? 'ok' : 'missing_explanation'
  };
  return { ...base, lightReview: review };
}
