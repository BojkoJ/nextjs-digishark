import { ExpressContext } from "@/server";
import { initTRPC } from "@trpc/server";

// generic type ExpressContext umožní TypeScriptu vědět, že z Expressu předáváme res a req
const t = initTRPC.context<ExpressContext>().create();

export const router = t.router;

// každý bude moct volat tenhle API endpoint - pro endpointy, který bude moct volat každý
export const publicProcedure = t.procedure;
