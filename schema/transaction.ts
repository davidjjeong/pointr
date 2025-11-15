import { z } from "zod";

export const CreateTransactionSchema = z.object({
    amount: z.number().positive().multipleOf(0.01),
    date: z.date(),
    food: z.string(),
    vendor: z.string(),
    quantity: z.number().int().positive(),
})

export type CreateTransactionSchemaType = z.infer<typeof CreateTransactionSchema>;