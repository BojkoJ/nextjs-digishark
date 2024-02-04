import { appRouter } from "@/trpc";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

const handler = (req: Request) => {
	fetchRequestHandler({
		endpoint: "/api/trpc",
		req,
		router: appRouter, // náš backend
		// @ts-expect-error context už jsme dali z express middlewaru - soubor trpc.ts
		// typescript error
		createContext: () => ({}),
	});
};

export { handler as GET, handler as POST };
