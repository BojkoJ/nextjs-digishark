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
import { useRouter, useSearchParams } from "next/navigation";

const Page = () => {
	const searchParams = useSearchParams();
	const router = useRouter();

	const isSeller = searchParams.get("as") === "seller";
	const origin = searchParams.get("origin");

	const continueAsSeller = () => {
		router.push("?as=seller");
	};

	const continueAsBuyer = () => {
		router.replace("/prihlaseni", undefined);
	};

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<TAuthCredentialsValidator>({
		resolver: zodResolver(AuthCredentialsValidator),
	});

	const { mutate: signIn, isLoading } = trpc.auth.signIn.useMutation({
		onSuccess: () => {
			toast.success("Úspěšně jste se přihlásili.");

			router.refresh();

			if (origin) {
				router.push(`/${origin}`);
				return;
			}

			if (isSeller) {
				router.push(`/sell`);
				return;
			}

			router.push("/");
			router.refresh();
		},
		onError: (err) => {
			if (err.data?.code === "UNAUTHORIZED") {
				toast.error("Zadali jste špatné přihlašovací údaje.");
			}
		},
	});

	const onSubmit = ({ email, password }: TAuthCredentialsValidator) => {
		signIn({ email, password });
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
						<h1 className="text-2xl font-bold">
							Přihlašte se ke svému účtu {isSeller ? "jako prodejce" : ""}
						</h1>

						<Link
							href="/registrace"
							className={buttonVariants({
								variant: "link",
								className: "gap-1.5",
							})}
						>
							Ještě u nás nemáte účet? Registruje te
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
											y {errors.password.message}
										</p>
									)}
								</div>

								<Button>Přihlásit se</Button>
								{/* Formuláře v reactu? : knihovny react-hook-form @hookform/resolvers zod a sonner(na toasty)*/}
							</div>
						</form>

						<div className="relative">
							<div
								aria-hidden="true"
								className="absolute inset-0 flex items-center"
							>
								<span className="w-full border-t" />
							</div>
							<div className="relative flex justify-center text-xs uppercase">
								<span className="bg-background px-2 text-muted-foreground">
									nebo
								</span>
							</div>
						</div>

						{isSeller ? (
							<Button
								onClick={continueAsBuyer}
								variant="secondary"
								disabled={isLoading}
							>
								Pokračovat jako zákazník
							</Button>
						) : (
							<Button
								onClick={continueAsSeller}
								variant="secondary"
								disabled={isLoading}
							>
								Pokračovat jako prodejce
							</Button>
						)}
					</div>
				</div>
			</div>
		</>
	);
};

export default Page;
