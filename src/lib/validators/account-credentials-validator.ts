import { z } from "zod";

export const AuthCredentialsValidator = z.object({
	email: z.string().email({ message: "Prosíme zadejte validní email" }),
	password: z
		.string()
		.min(8, { message: "Heslo musí být alespoň 8 znaků dlouhé" }),
});

export type TAuthCredentialsValidator = z.infer<
	typeof AuthCredentialsValidator
>;
