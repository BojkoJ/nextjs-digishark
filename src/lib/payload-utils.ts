import { User } from "../payload-types";
import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import { NextRequest } from "next/server";

export const getServerSideUser = async (
	cookies: NextRequest["cookies"] | ReadonlyRequestCookies
) => {
	const token = cookies.get("payload-token")?.value; // získáme token z payload serveru

	// Bez tokenu nebo bez nastavené URL nemá smysl volat server - vrátíme nepřihlášeného.
	const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;
	if (!token || !serverUrl) {
		return { user: null as User | null };
	}

	try {
		// na tomto endpointu nám payload poskytne aktuální user session
		const meRes = await fetch(`${serverUrl}/api/users/me`, {
			headers: {
				Authorization: `JWT ${token}`,
			},
		});

		const { user } = (await meRes.json()) as { user: User | null };

		return { user };
	} catch {
		// síťová chyba / nedostupný server -> bereme jako nepřihlášeného,
		// ať kvůli tomu nespadne celá stránka (např. v middleware)
		return { user: null as User | null };
	}
};
