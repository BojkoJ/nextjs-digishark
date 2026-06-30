import { headers } from "next/headers";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { getPayloadClient } from "@/get-payload";
import { Product } from "@/payload-types";
import { Resend } from "resend";
import { ReceiptEmailHtml } from "@/components/emails/ReceiptEmail";

export async function POST(req: Request) {
	// Resend instancujeme až tady (lazy) - new Resend() bez klíče by jinak
	// spadlo už při importu modulu během buildu.
	const resend = new Resend(process.env.RESEND_API_KEY);

	// 1. validuje že request je od Stripe
	// 2. pokud je, updatneme _isPaid hodnotu, kterou jsme poslali jako metadata v payment-router.ts

	// raw body potřebujeme pro ověření Stripe podpisu
	const body = await req.text();
	const signature = (await headers()).get("stripe-signature") ?? "";

	let event: Stripe.Event;
	try {
		event = stripe.webhooks.constructEvent(
			body,
			signature,
			process.env.STRIPE_WEBHOOK_SECRET || ""
		);
	} catch (err) {
		// Zalogujeme do Vercel logů, ať je jasné, že selhalo ověření podpisu
		// (nejčastěji špatný/chybějící STRIPE_WEBHOOK_SECRET pro tento endpoint).
		console.error(
			"Stripe webhook: ověření podpisu selhalo.",
			err instanceof Error ? err.message : err
		);
		return new Response(
			`Webhook Error: ${err instanceof Error ? err.message : "Unknown Error"}`,
			{ status: 400 }
		);
	}

	const session = event.data.object as Stripe.Checkout.Session;

	if (!session?.metadata?.userId || !session?.metadata?.orderId) {
		return new Response("Webhook Error: No user present in metadata", {
			status: 400,
		});
	}

	if (event.type === "checkout.session.completed") {
		const payload = await getPayloadClient();

		const { docs: users } = await payload.find({
			collection: "users",
			where: {
				id: {
					equals: session.metadata.userId,
				},
			},
		});

		const [user] = users;

		if (!user) {
			return Response.json({ error: "No such user exists." }, { status: 404 });
		}

		const { docs: orders } = await payload.find({
			collection: "orders",
			depth: 2,
			where: {
				id: {
					equals: session.metadata.orderId,
				},
			},
		});

		const [order] = orders;

		if (!order) {
			return Response.json({ error: "No such order exists." }, { status: 404 });
		}

		await payload.update({
			collection: "orders",
			data: {
				_isPaid: true,
			},
			where: {
				id: {
					equals: session.metadata.orderId,
				},
			},
		});

		// Odeslání účtenky je BEST-EFFORT. Když selže (např. Resend nemá ověřenou
		// doménu nebo příjemce), jen to zalogujeme a webhooku vrátíme 200 -
		// platba je zpracovaná (_isPaid nastaveno), nesmí kvůli e-mailu retryovat.
		try {
			const fromAddress =
				process.env.EMAIL_FROM_ADDRESS || "onboarding@resend.dev";
			await resend.emails.send({
				from: `DigiShark <${fromAddress}>`,
				to: [user.email],
				subject: "Děkujeme za objednávku! Zde je vaše faktura.",
				html: await ReceiptEmailHtml({
					date: new Date(),
					email: user.email,
					orderId: session.metadata.orderId,
					products: order.products as Product[],
				}),
			});
		} catch (error) {
			payload.logger.error(
				{ error },
				"Odeslání účtenky e-mailem selhalo (platba ale proběhla)"
			);
		}

		return new Response(null, { status: 200 });
	}

	return new Response(null, { status: 200 });
}
