import { z } from "zod";

export const createHoldingSchema = z.object({
  cardId: z.string().min(1).max(100),
  cardName: z.string().min(1).max(120),
  setName: z.string().min(1).max(120),

  // Optional from the client, but ALWAYS becomes a string in parsed.data
  grade: z
    .string()
    .trim()
    .min(1)
    .max(20)
    .optional()
    .transform((v) => (v && v.length > 0 ? v : "RAW")),

  purchasePrice: z.number().finite().min(0).max(1_000_000),
  quantity: z.number().int().min(1).max(999),
});

export type CreateHoldingInput = z.infer<typeof createHoldingSchema>;
