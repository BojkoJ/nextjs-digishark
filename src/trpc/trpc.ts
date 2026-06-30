import { TRPCError, initTRPC } from "@trpc/server";
import { getPayloadClient } from "../get-payload";
import type { User } from "../payload-types";

/*
    Payload 3 / Next.js: tRPC běží přes fetch adaptér (route handler),
    takže místo Express req/res předáváme nativní Web Request.
    Z jeho hlaviček (cookie / Authorization) ověříme uživatele přes payload.auth().
*/
export const createContext = async ({ req }: { req: Request }) => {
	return { req };
};

export type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create();

const middleware = t.middleware;

const isAuth = middleware(async ({ ctx, next }) => {
	const payload = await getPayloadClient();

	// payload.auth ověří přihlášeného uživatele z hlaviček (payload-token cookie)
	const { user } = await payload.auth({ headers: ctx.req.headers });

	if (!user) {
		throw new TRPCError({
			code: "UNAUTHORIZED",
		});
	}

	return next({
		ctx: {
			user: user as User,
		},
	});
});

export const router = t.router;
// pro endpointy, který může volat každý
export const publicProcedure = t.procedure;
export const privateProcedure = t.procedure.use(isAuth);
