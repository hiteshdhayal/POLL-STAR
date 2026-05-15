import { z } from 'zod';

export const submitResponseSchema = z.object({
  answers: z
    .array(
      z.object({
        questionId: z.string().cuid(),
        optionId: z.string().cuid(),
      })
    )
    .min(1),
  sessionId: z.string().optional(),
});
