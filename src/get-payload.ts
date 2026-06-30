import config from "@payload-config";
import { getPayload, type Payload } from "payload";

/*
    Payload 3 běží nativně uvnitř Next.js. Místo vlastního cachování přes
    payload.init() (jako v Payload 2 / Express) používáme oficiální getPayload(),
    který si instanci interně cachuje sám.

    Funkci necháváme pojmenovanou getPayloadClient(), aby zbytek aplikace
    (tRPC routery, webhooky, server komponenty) nemusel měnit volání.
*/
export const getPayloadClient = async (): Promise<Payload> => {
    return getPayload({ config });
};
