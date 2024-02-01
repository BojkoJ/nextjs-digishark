import { type ClassValue, clsx } from "clsx";
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
