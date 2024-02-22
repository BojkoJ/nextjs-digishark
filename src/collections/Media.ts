import { User } from "../payload-types";
import { Access, CollectionConfig } from "payload/types";

// typ Acccess poskytuje Payload, tahle funkce bude vracet přístupovou politiku (access policy)
// která nám bude říkat jestli user má přístup k obrázku
const isAdminOrHasAccessToImages =
    (): Access =>
    async ({ req }) => {
        const user = req.user as User | undefined;

        if (!user) return false;
        // false - nemůžeš mít přístup k tomuhle obrázku
        // true - můžeš mít přístup k tomuhle obrázky

        if (user.role === "admin") return true;

        return {
            // vracíme query constraint
            // pokud user vlastní tento obrázek
            // pokud pole user které je přiřazeno obrázku (user field které je v poli fields)
            // se rovná aktuálně přihlášenému userovi tak je to jeho obrázek
            user: {
                equals: req.user.id,
            },
        };
    };

export const Media: CollectionConfig = {
    slug: "media",
    labels: {
        singular: "Náhledový Obrázek",
        plural: "Náhledové Obrázky",
    },
    hooks: {
        beforeChange: [
            ({ req, data }) => {
                //funkce co se zavolá těsně před změnou produktu
                // každý productImage (náhleďák produktu) bude spojený s uživatelem protože
                // když uživatel bude vybírat media files (soubory) pro produkt, tak aby měl přístup jen k těm svým¨
                return { ...data, user: req.user.id };

                // Funkce v tomto hooku zajistí, že každá změna položky media přiřadí aktuálního uživatele
                // (získaného z req.user.id) jako vlastníka této položky.
            },
        ],
    },
    access: {
        // když bude user u produktu dávat náhleďáky bude moct nahrát z počítače nebo nahrát z existujících
        // ale tím pádem musíme omezit to, aby každý uživatel mohl nahrát jen z těch svých existujících
        read: async ({ req }) => {
            // uživatel, nebo zákazník na frontendu by měl být schopný vidět všechny obrázky
            const referer = req.headers.referer;

            // Pokud uživatel není lognutý nebo není v backendu tak pak funkce vrátí true - může číst všechny obrázky
            if (!req.user || !referer?.includes("sell")) {
                return true;
            }
            // co tady říkáme je: pokud jsi na frontendu a nejsi přihlášený (na backendu), můžeš vidět všechny obrázky
            // pokud jsi ale na backendu nebo přihlášený (na backendu) nemůžeš vidět všechny obrázky - můžeš vidět jen ty svoje

            return await isAdminOrHasAccessToImages()({ req });
        },
        delete: ({ req }) => isAdminOrHasAccessToImages()({ req }),
        update: ({ req }) => isAdminOrHasAccessToImages()({ req }),
    },
    admin: {
        // nechceme aby se Media zobrazovala v admin dashboardu v CMS, ale chceme aby pořád fungovala jako úložiště
        // nahraných náhleďáků, chceme aby tuhle kolekci viděl jenom Administrátor
        hidden: ({ user }) => user.role !== "admin",
        // pokud user není admin tak Media bude hidden
    },
    upload: {
        staticURL: "/media", // tady chceme aby náhleďáky byly
        staticDir: "media", // složka media ve filesystemu kde budou media uloženy
        imageSizes: [
            // generuje různé verze těchto obrázků
            {
                name: "thumbnail",
                width: 400,
                height: 300,
                position: "centre",
            },
            {
                name: "card",
                width: 768,
                height: 1024,
                position: "centre",
            },
            {
                name: "tablet",
                width: 1024,
                height: undefined, // vypočítá výšku automaticky
                position: "centre",
            },
        ],
        mimeTypes: ["image/*"], // uživatele můžou nahrát jen jpg, png, svg ale nic jiného než obrázky
    },
    fields: [
        {
            name: "user",
            label: "Uživatel",
            type: "relationship",
            relationTo: "users",
            required: true,
            hasMany: false, // jeden obrázek patří k jednomu userovi
            admin: {
                condition: () => false,
            },
        },
    ],
};
