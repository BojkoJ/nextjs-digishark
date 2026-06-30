import { appRouter } from "@/trpc";
import { createContext } from "@/trpc/trpc";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

const handler = (req: Request) =>
	fetchRequestHandler({
		endpoint: "/api/trpc",
		req,
		router: appRouter, // náš backend
		createContext: () => createContext({ req }),
	});

export { handler as GET, handler as POST };
