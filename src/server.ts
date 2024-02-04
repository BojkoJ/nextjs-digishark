import express from "express";
import { getPayloadClient } from "./get-payload";
import { nextApp, nextHandler } from "./next-utils";
import * as trpcExpress from "@trpc/server/adapters/express";
import { appRouter } from "./trpc";
import { inferAsyncReturnType } from "@trpc/server";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

const createContext = ({
	req,
	res,
}: trpcExpress.CreateExpressContextOptions) => ({
	req,
	res,
});

// aby jsme mohli používat req (request) a res (response) v trpc routách
export type ExpressContext = inferAsyncReturnType<typeof createContext>;

const start = async () => {
	// asynchronní arrow funkce
	// zde se server zapne

	const payload = await getPayloadClient({
		initOptions: {
			express: app,
			onInit: async (cms) => {
				cms.logger.info(`Admin URL ${cms.getAdminURL()}`);
			},
		},
	});
	// CMS Admin dashboard kterou poskytuje Payload

	// Integrace trpc do serveru
	app.use(
		"/api/trpc",
		trpcExpress.createExpressMiddleware({
			router: appRouter,
			createContext,
			// createContext nám umožňuje vzít něco z expressu a připojit to ke Contextu aby jsme je mohli použít i v next.js
		})
	);
	// tímto řekneme že kterýkoliv request půjde na /api/trpc tak ho přesměrujeme pomocí middlewaru na next.js

	// tímto zajistíme, že next bude handlovat všechno routování
	// předáme routování z expressu nextu
	app.use((req, res) => nextHandler(req, res));

	nextApp.prepare().then(() => {
		payload.logger.info("Next.js started");

		app.listen(PORT, async () => {
			payload.logger.info(
				`Next.js App URL: ${process.env.NEXT_PUBLIC_SERVER_URL}`
			);
		});
	});
};

start();
