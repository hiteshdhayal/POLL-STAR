import { z } from 'zod';

export const createPollSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200).trim(),
  description: z.string().max(1000).trim().optional(),
  isAnonymous: z.boolean(),
  expiresAt: z.string().datetime().refine(val => new Date(val) > new Date(), { 
    message: 'Expiry must be in the future' 
  }),
  questions: z.array(
    z.object({
      text: z.string().min(1, 'Question text cannot be empty').max(500).trim(),
      isRequired: z.boolean(),
      order: z.number().int().min(0),
      options: z.array(
        z.object({
          text: z.string().min(1, 'Option text cannot be empty').max(200).trim(),
          order: z.number().int().min(0),
        })
      )
      .min(2, 'Each question must have at least 2 options')
      .max(6, 'Each question can have at most 6 options')
      .superRefine((opts, ctx) => {
        opts.forEach((opt, i) => {
          if (!opt.text.trim()) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `Option ${i + 1} cannot be empty`,
              path: [i, 'text'],
            });
          }
        });
      })
    })
  )
  .min(1, 'Add at least one question')
  .superRefine((questions, ctx) => {
    questions.forEach((q, qIdx) => {
      const texts = q.options.map(o => o.text.trim().toLowerCase());
      const duplicates = texts.filter((item, index) => texts.indexOf(item) !== index);
      if (duplicates.length > 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Options within a question must be unique',
          path: [qIdx, 'options'],
        });
      }
    });
  }),
});

export const updatePollSchema = createPollSchema.partial();
