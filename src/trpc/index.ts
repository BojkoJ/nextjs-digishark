import { z } from "zod";
import { authRouter } from "./auth-router";
import { publicProcedure, router } from "./trpc";
import { QueryValidator } from "../lib/validators/query-validator";
import { getPayloadClient } from "../get-payload";
import { paymentRouter } from "./payment-router";

export const appRouter = router({
	auth: authRouter,
	payment: paymentRouter,
	getInfiniteProducts: publicProcedure
		.input(
			z.object({
				limit: z.number().min(1).max(100), //maximálně fetchnout 100 produktů
				cursor: z.number().nullish(),
				query: QueryValidator,
			})
		)
		.query(async ({ input }) => {
			const { query, cursor } = input; // z input můžeme destrukturovat query, cursor (a limit)
			const { sort, limit, ...queryOpts } = query; // z query (definované v query-validator) můžeme destrukturovat sort a limit
			/// ...queryOpts - prostě rozbalíme ostatní proměnné z query protože category je "speciální" - budeme je parsovat

			const payload = await getPayloadClient(); // payload CMS

			const parsedQueryOptions: Record<string, { equals: string }> = {};

			// tady jsme vzali category z queryOpts a přeparsovali ho na správnou syntaxi které Payload CMS rozumí
			Object.entries(queryOpts).forEach(([key, value]) => {
				parsedQueryOptions[key] = {
					equals: value,
				};
			});

			const page = cursor || 1;

			const {
				docs: items,
				hasNextPage,
				nextPage,
			} = await payload.find({
				collection: "products",
				where: {
					approvedForSale: {
						equals: "approved",
					},
					...parsedQueryOptions,
				},
				sort: sort,
				depth: 1,
				limit: limit,
				page,
			});

			return {
				items: items,
				nextPage: hasNextPage ? nextPage : null,
			};
		}),
});

export type AppRouter = typeof appRouter;
