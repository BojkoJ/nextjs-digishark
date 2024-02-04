import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "./";

// tímto frontend bude znát typy backendu
export const trpc = createTRPCReact<AppRouter>({});
