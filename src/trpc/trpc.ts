import { ExpressContext } from "@/server";
import { TRPCError, initTRPC } from "@trpc/server";
import { User } from "payload/dist/auth";
import { PayloadRequest } from "payload/types";

// generic type ExpressContext umožní TypeScriptu vědět, že z Expressu předáváme res a req
const t = initTRPC.context<ExpressContext>().create();

const middleware = t.middleware;
const isAuth = middleware(async ({ ctx, next }) => {
	const request = ctx.req as PayloadRequest; // We get this from Express and cast is as PayloadRequest

	const { user } = request as { user: User | null };

	if (!user) {
		throw new TRPCError({
			code: "UNAUTHORIZED",
		});
	}

	return next({
		// call the server to create seesion
		ctx: {
			user,
			// We attach user to context for private procedure
		},
	});
});

export const router = t.router;
// každý bude moct volat tenhle API endpoint - pro endpointy, který bude moct volat každý
export const publicProcedure = t.procedure;
export const privateProcedure = t.procedure.use(isAuth);
