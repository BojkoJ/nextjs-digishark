import { type ClassValue, clsx } from "clsx";
import { Metadata } from "next";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function formatPrice(
	price: number | string,
	options: {
		currency?: "USD" | "EUR" | "GBP" | "BDT" | "CZK";
		notation?: Intl.NumberFormatOptions["notation"];
	} = {}
) {
	const { currency = "CZK", notation = "compact" } = options;
	// z options destrukturujeme proměnné currency a notation a nastavujeme jim při tom default hodnoty

	const numericPrice = typeof price === "string" ? parseFloat(price) : price;

	return new Intl.NumberFormat("cs-CZ", {
		style: "currency",
		currency,
		notation,
		maximumFractionDigits: 2,
	}).format(numericPrice);
}

export function constructMetadata({
	title = "DigiShark - tržiště digitálních produktů",
	description = "DigiShark je open-source tržiště s kvalitním digitálním zbožím.",
	image = "/logo.png",
	icons = "/digishark_logo.png",
	noIndex = false,
}: {
	title?: string;
	description?: string;
	image?: string;
	icons?: string;
	noIndex?: boolean;
} = {}): Metadata {
	return {
		title,
		description,
		openGraph: {
			title,
			description,
			images: [
				{
					url: image,
				},
			],
		},
		twitter: {
			card: "summary_large_image",
			title,
			description,
			images: [image],
			creator: "@janbojko",
		},
		icons,
		metadataBase: new URL("https://digishark.up.railway.app"),
		...(noIndex && {
			robots: {
				index: false,
				follow: false,
			},
		}),
	};
}
