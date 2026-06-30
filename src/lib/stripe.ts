import Stripe from "stripe";

// Stripe v18 vyhodí chybu, pokud je klíč prázdný (už při konstrukci).
// Fallback umožní build / generování typů i bez nastaveného tajného klíče.
// V produkci je STRIPE_SECRET_KEY samozřejmě nastavený.
// apiVersion neuvádíme natvrdo - SDK použije verzi, na kterou je sestavené.
export const stripe = new Stripe(
	process.env.STRIPE_SECRET_KEY || "sk_test_placeholder",
	{
		typescript: true,
	}
);
