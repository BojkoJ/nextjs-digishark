import express from "express";
import { getPayloadClient } from "./get-payload";
import { nextApp, nextHandler } from "./next-utils";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

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

	// tímto zajistíme, že next bude handlovat všechno routování
	// předáme routování z expressu nextu
	app.use((req, res) => nextHandler(req, res));

	nextApp.prepare().then(() => {
		/* 		payload.logger.info("Next.js started"); */

		app.listen(PORT, async () => {
			/* payload.logger.info(
				`Next.js App URL: ${process.env.NEXT_PUBLIC_SERVER_URL}`
			); */
		});
	});
};

start();
