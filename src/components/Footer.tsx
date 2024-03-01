"use client";

import { usePathname } from "next/navigation";
import MaxWidthWrapper from "./MaxWidthWrapper";
import { Icons } from "./Icons";
import Link from "next/link";

interface FooterProps {
	userId: string | undefined;
}

const Footer = ({ userId }: FooterProps) => {
	const pathsToMinimize = ["/overit-email", "/prihlaseni", "/registrace"];
	const pathname = usePathname();

	return (
		<MaxWidthWrapper>
			<div className="border-t border-gray-200">
				{pathsToMinimize.includes(pathname) ? null : (
					<div className="pb-8 pt-16">
						<div className="flex justify-center">
							<Icons.logo
								alt="logo"
								src="/digishark_logo.png"
								className="h-12 w-auto"
								width={75}
								height={75}
							/>
						</div>
					</div>
				)}

				{pathsToMinimize.includes(pathname) ? null : (
					<div>
						<div className="relative flex items-center px-6 py-6 sm:py-8 lg:mt-0">
							<div className="absolute inset-0 overflow-hidden rounded-lg">
								<div
									className="absolute bg-zinc-50 inset-0 bg-gradient-to-br bg-opacity-90"
									arie-hidden="true"
								></div>
							</div>

							<div className="text-center relative mx-auto max-w-sm">
								<h3 className="font-semibold text-gray-900">
									Staňte se prodejcem
								</h3>
								<p className="mt-2 text-sm text-muted-foreground">
									Pokud by jste chtěli prodávat kvalitní digitální produkty,
									můžete toho dostáhnout během minutky.{" "}
									{userId ? (
										<Link
											href="/sell"
											className="mt-5 whitespace-nowrap font-medium text-black hover:text-zinc-500"
										>
											Nástěnka prodejce &rarr;
										</Link>
									) : (
										<Link
											href="/prihlaseni?as=seller"
											className="mt-5 whitespace-nowrap font-medium text-black hover:text-zinc-500"
										>
											Začněte prodávat &rarr;
										</Link>
									)}
								</p>
							</div>
						</div>
					</div>
				)}
			</div>

			<div className="py-10 md:flex md:items-center md:justify-between">
				<div className="text-center md:text-left">
					<p className="text-sm text-muted-foreground">
						&copy; {new Date().getFullYear()}
					</p>
				</div>

				<div className="mt-4 flex items-center justify-center md:mt-0">
					<div className="flex space-x-8">
						<Link
							href="#"
							className="text-sm text-muted-foreground hover:text-gray-600"
						>
							Pravidla Cookies
						</Link>
						<Link
							href="#"
							className="text-sm text-muted-foreground hover:text-gray-600"
						>
							Ochrana Soukromí
						</Link>
						<Link
							href="#"
							className="text-sm text-muted-foreground hover:text-gray-600"
						>
							Podmínky užívání
						</Link>
					</div>
				</div>
			</div>
		</MaxWidthWrapper>
	);
};

export default Footer;
