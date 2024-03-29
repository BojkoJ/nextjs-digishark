import express from "express";
import { getPayloadClient } from "./get-payload";
import { nextApp, nextHandler } from "./next-utils";
import * as trpcExpress from "@trpc/server/adapters/express";
import { appRouter } from "./trpc";
import { inferAsyncReturnType } from "@trpc/server";
import bodyParser from "body-parser";
import { IncomingMessage } from "http";
import { stripeWebhookHandler } from "./webhooks";
import nextBuild from "next/dist/build";
import path from "path";
import { PayloadRequest } from "payload/types";
import { parse } from "url";

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

// Typ pro kontrolu jestli odpověď z webhooku je od Stripe
export type WebhookRequest = IncomingMessage & { rawBody: Buffer };

const start = async () => {
	const webhookMiddleware = bodyParser.json({
		verify: (req: WebhookRequest, _, buffer) => {
			req.rawBody = buffer;
		},
	});

	app.post("/api/webhooks/stripe", webhookMiddleware, stripeWebhookHandler);

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

	const cartRouter = express.Router();

	cartRouter.use(payload.authenticate); // připojí user object k expressu

	cartRouter.get("/", (req, res) => {
		const request = req as PayloadRequest;

		if (!request.user) {
			return res.redirect("/prihlaseni?origin=cart");
		}

		const parsedUrl = parse(req.url, true);

		return nextApp.render(req, res, "/cart", parsedUrl.query);
	});

	app.use("/cart", cartRouter);

	if (process.env.NEXT_BUILD) {
		app.listen(PORT, async () => {
			payload.logger.info("Next.js is building for production");

			// @ts-expect-error
			await nextBuild(path.join(__dirname, "../"));

			process.exit();
		});

		return;
	}

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
