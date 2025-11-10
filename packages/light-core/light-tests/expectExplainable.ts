import { GuardedResponse } from '../light-guard';

// This is a mock test function assuming a Jest-like environment.
declare const expect: any;

export function expectExplainable(res: GuardedResponse) {
  expect(res.text).toMatch(/because|since|due to|this matters because/i);
  expect(res.lightReview.truthfulnessFlag).not.toBe('needs_review');
}
