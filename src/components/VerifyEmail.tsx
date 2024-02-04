"use client";

import { trpc } from "@/trpc/client";
import { Loader2, XCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "./ui/button";

interface VerifyEmailProps {
	token: string;
}

const VerifyEmail = ({ token }: VerifyEmailProps) => {
	const { data, isLoading, isError } = trpc.auth.verifyEmail.useQuery({
		token,
	});

	if (isError) {
		return (
			<div className="flex flex-col items-center gap-2">
				<XCircle className="h-8 w-8 text-red-600" />
				<h3 className="font-semibold text-xl">Nastal problém.</h3>
				<p className="text-muted-foreground text-sm text-center">
					Tento ověřovací odkaz je neplatný nebo již mohl vypršet. <br /> Zkuste
					to znovu.
				</p>
			</div>
		);
	}

	if (data?.success) {
		return (
			<div className="flex h-full flex-col items-center justify-center">
				<div className="relative mb-4 h-60 w-60 text-muted-foreground">
					<Image src="/email_sent.png" fill alt="shark image email" />
				</div>

				<h3 className="font-semibold text-2xl">Vše hotovo</h3>
				<p className="text-muted-foreground text-center mt-1">
					Děkujeme vám za ověření e-mailu
				</p>

				<Link
					href="/prihlaseni"
					className={buttonVariants({
						className: "mt-4",
					})}
				>
					Přihlásit se
				</Link>
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className="flex flex-col items-center gap-2">
				<Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
				<h3 className="font-semibold text-xl">Ověřuji...</h3>
				<p className="text-muted-foreground text-sm text-center">
					Pracujeme na tom...
				</p>
			</div>
		);
	}
};

export default VerifyEmail;
