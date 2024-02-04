import dotenv from "dotenv";
import path from "path";
import type { InitOptions } from "payload/config";
import payload, { Payload } from "payload";
import nodemailer from "nodemailer";

// package která poskytne přístup k enviroment variables

dotenv.config({
	path: path.resolve(__dirname, "../.env"),
});

const transporter = nodemailer.createTransport({
	host: "smtp.resend.com",
	secure: true,
	port: 465,
	auth: {
		user: "resend",
		pass: process.env.RESEND_API_KEY,
	},
});

let cached = (global as any).payload;

if (!cached) {
	// pokud nemáme zacachovanou verzi našeho CMS tak zacachujeme
	cached = (global as any).payload = {
		client: null,
		promise: null,
	};
}

interface Args {
	initOptions?: Partial<InitOptions>;
}

export const getPayloadClient = async ({
	initOptions,
}: Args = {}): Promise<Payload> => {
	/*
        Overview: vytvořili jsme database clienta, kterého budeme používat skrz celou aplikaci
                  a taky jsme zajistili aby byl zacachovaný.

		Tento soubor je vytvoření instance CMS Payload
    */

	if (!process.env.PAYLOAD_SECRET) {
		throw new Error("PAYLOAD_SECRET is missing");
	}

	if (cached.client) {
		return cached.client;
	}

	if (!cached.promise) {
		cached.promise = payload.init({
			email: {
				transport: transporter,
				fromAddress: "onboarding@resend.dev",
				fromName: "DigiShark",
			},
			secret: process.env.PAYLOAD_SECRET,
			local: initOptions?.express ? false : true,
			...(initOptions || {}),
		});
	}

	try {
		cached.client = await cached.promise;
	} catch (error: unknown) {
		cached.promise = null;
		throw error;
	}

	return cached.client;
};
