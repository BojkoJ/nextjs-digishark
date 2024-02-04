"use client";

import { Icons } from "@/components/Icons";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
	AuthCredentialsValidator,
	TAuthCredentialsValidator,
} from "@/lib/validators/account-credentials-validator";
import { trpc } from "@/trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { ZodError } from "zod";
import { useRouter } from "next/navigation";

const Page = () => {
	const router = useRouter();

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<TAuthCredentialsValidator>({
		resolver: zodResolver(AuthCredentialsValidator),
	});

	const { mutate, isLoading } = trpc.auth.createPayloadUser.useMutation({
		onError: (err) => {
			if (err.data?.code === "CONFLICT") {
				toast.error("Tento e-mail je už používán.");

				return;
			}

			if (err instanceof ZodError) {
				// user porušil zod pravidla (špatná forma emailu nebo krátké heslo)
				toast.error(err.issues[0].message);

				return;
			}

			toast.error("Ajaj. Něco se nepovedlo. zkuste to prosím znovu.");
		},
		onSuccess: ({ sentToEmail }) => {
			toast.success(`Ověřovací e-mail poslán na adresu ${sentToEmail}`);
			router.push("/overit-email?to=" + sentToEmail);
		},
	});

	const onSubmit = ({ email, password }: TAuthCredentialsValidator) => {
		mutate({ email, password });
	};

	return (
		<>
			<div className="container relative flex pt-20 flex-col items-center justify-center lg:px-0">
				<div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
					<div className="flex flex-col items-center space-y-2 text-center">
						<Icons.logo
							alt="logo"
							src="/digishark_logo.png"
							width={120}
							height={120}
						/>
						<h1 className="text-2xl font-bold">Vytvořte si účet</h1>

						<Link
							href="/prihlaseni"
							className={buttonVariants({
								variant: "link",
								className: "gap-1.5",
							})}
						>
							Už máte účet? Přihlašte se
							<ArrowRight className="h-4 w-4" />
						</Link>
					</div>

					<div className="grid gap-6">
						<form onSubmit={handleSubmit(onSubmit)}>
							<div className="grid gap-2">
								<div className="grid gap-1 py-2">
									<Label htmlFor="email">Email</Label>
									<Input
										{...register("email")}
										className={cn({
											"focus-visible:ring-red-500": errors.email,
										})}
										placeholder="email@příklad.com"
									/>
									{errors?.email && (
										<p className="text-sm text-red-500">
											{errors.email.message}
										</p>
									)}
								</div>

								<div className="grid gap-1 py-2">
									<Label htmlFor="password">Heslo</Label>
									<Input
										{...register("password")}
										className={cn({
											"focus-visible:ring-red-500": errors.password,
										})}
										type="password"
										placeholder="Heslo"
									/>
									{errors?.password && (
										<p className="text-sm text-red-500">
											{errors.password.message}
										</p>
									)}
								</div>

								<Button>Registrovat se</Button>
								{/* Formuláře v reactu? : knihovny react-hook-form @hookform/resolvers zod a sonner(na toasty)*/}
							</div>
						</form>
					</div>
				</div>
			</div>
		</>
	);
};

export default Page;
