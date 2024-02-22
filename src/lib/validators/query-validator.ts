import { z } from "zod";

export const QueryValidator = z.object({
    category: z.string().optional(),
    sort: z.enum(["asc", "desc"]).optional(),
    limit: z.number().optional(),
});

// tady získáme typescriptový type z tohohle zod validátoru
export type TQueryValidator = z.infer<typeof QueryValidator>;
