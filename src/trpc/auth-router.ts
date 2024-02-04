import { AuthCredentialsValidator } from "../lib/validators/account-credentials-validator";
import { publicProcedure, router } from "./trpc";
import { getPayloadClient } from "../get-payload";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const authRouter = router({
	//query - čteme data
	//mutation - měníme data

	createPayloadUser: publicProcedure
		.input(AuthCredentialsValidator)
		.mutation(async ({ input }) => {
			const { email, password } = input;
			const payload = await getPayloadClient();

			// kontrola jestli user už existuje - pokud ano, nelze ho zaregistrovat znovu

			const { docs: users } = await payload.find({
				collection: "users",
				where: {
					email: {
						equals: email,
					},
				},
			});

			if (users.length !== 0) {
				// user s tímhle emailem už je
				throw new TRPCError({
					code: "CONFLICT",
				});
			}

			await payload.create({
				collection: "users",
				data: {
					email,
					password,
					role: "user",
				},
			});

			return { success: true, sentToEmail: email };
		}),

	verifyEmail: publicProcedure
		.input(z.object({ token: z.string() }))
		.query(async ({ input }) => {
			const { token } = input;

			const payload = await getPayloadClient();

			const isVerified = await payload.verifyEmail({
				collection: "users",
				token,
			});

			if (!isVerified) {
				throw new TRPCError({ code: "UNAUTHORIZED" });
			}

			return { success: true };
		}),

	signIn: publicProcedure
		.input(AuthCredentialsValidator)
		.mutation(async ({ input, ctx }) => {
			const { email, password } = input;
			const { res } = ctx;

			const payload = await getPayloadClient();

			try {
				await payload.login({
					collection: "users",
					data: {
						email,
						password,
					},
					res,
				});

				return { success: true };
			} catch (err) {
				// špatný email, heslo nebo oboje...
				throw new TRPCError({ code: "UNAUTHORIZED" });
			}
		}),
});
