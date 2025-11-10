import charter from './light-charter.json';

export const LIGHT_CHARTER = charter;
export type LightPrinciple = keyof typeof charter.principles;

export function isPrincipleEnabled(key: LightPrinciple): boolean {
  return !!LIGHT_CHARTER.principles[key];
}
