import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn, constructMetadata } from "@/lib/utils";
import Navbar from "@/components/Navbar";
import Providers from "@/components/Providers";
import { Toaster } from "sonner";
import Footer from "@/components/Footer";
import { cookies } from "next/headers";
import { getServerSideUser } from "@/lib/payload-utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata = constructMetadata({});

export default async function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const nextCookies = cookies();
	const { user } = await getServerSideUser(nextCookies);

	return (
		<html lang="en" className="h-full">
			<body
				className={cn("relative h-full font-sans antialiased", inter.className)}
			>
				<main className="relative flex flex-col min-h-screen">
					<Providers>
						<Navbar />
						<div className="flex-grow flex-1">{children}</div>
						<Footer userId={user?.id} />
					</Providers>
				</main>
				<Toaster position="bottom-center" richColors />
			</body>
		</html>
	);
}
