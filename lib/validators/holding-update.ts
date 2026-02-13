import { z } from "zod";

export const updateHoldingSchema = z
  .object({
    quantity: z.number().int().min(1).max(999).optional(),
    purchasePrice: z.number().finite().min(0).max(1_000_000).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export type UpdateHoldingInput = z.infer<typeof updateHoldingSchema>;
