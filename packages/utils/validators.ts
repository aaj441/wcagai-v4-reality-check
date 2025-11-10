/**
 * Validators using Zod
 */

import { z } from 'zod';

export const urlValidator = z.string().url('Invalid URL format');

export const scanInputSchema = z.object({
  url: urlValidator,
  options: z
    .object({
      viewport: z
        .object({
          width: z.number().min(320).max(3840).optional(),
          height: z.number().min(240).max(2160).optional(),
        })
        .optional(),
      waitForSelector: z.string().optional(),
      timeout: z.number().min(1000).max(60000).optional(),
    })
    .optional(),
});

export type ScanInput = z.infer<typeof scanInputSchema>;

export function validateUrl(url: string): boolean {
  try {
    urlValidator.parse(url);
    return true;
  } catch {
    return false;
  }
}

export function validateScanInput(input: unknown): ScanInput {
  return scanInputSchema.parse(input);
}
