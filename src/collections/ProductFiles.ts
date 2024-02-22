import { User } from "../payload-types";
import { BeforeChangeHook } from "payload/dist/collections/config/types";
import { Access, CollectionConfig } from "payload/types";

const addUser: BeforeChangeHook = ({ req, data }) => {
    const user = req.user as User | null;
    return { ...data, user: user?.id };
};

const yourOwnAndPurchased: Access = async ({ req }) => {
    const user = req.user as User | null;

    if (user?.role === "admin") return true;

    if (!user) return false;

    const { docs: products } = await req.payload.find({
        // tohle je něco jako select query, kterou asynchronně voláme na serveru
        collection: "products",
        depth: 0, // když hledáme produkty, každý produkt je spojený s userem přes id
        // kdyby jsme měli depth: 1 tak by to fetchlo celého usera ale my chceme jen jeho id
        // je to něco jako join v sql
        where: {
            user: {
                equals: user.id,
            },
        },
    });

    const ownProductFileIds = products.map((prod) => prod.product_files).flat();

    const { docs: orders } = await req.payload.find({
        collection: "orders",
        depth: 2, // spojí tabulky (Něco jako join), dá nám i CELÉHO usera (místo pouze jeho id) a taky celé soubory produktu
        where: {
            user: {
                equals: user.id,
            },
        },
    });

    const purchasedProductFileIds = orders
        .map((order) => {
            return order.products.map((product) => {
                // mapujeme skrze všechny produkty v jedné objednávce
                if (typeof product === "string")
                    return req.payload.logger.error(
                        "Search depth not sufficient to find purchased file IDs"
                    );

                /* Pokud má produkt jeden soubor:

                    return typeof product.product_files === "string"
                    ? product.product_files
                    : product.product_files.id; */

                product.product_files.map((product_file) => {
                    return typeof product_file === "string"
                        ? product_file
                        : product_file.id;
                });
            });
        })
        .filter(Boolean)
        .flat();

    return {
        id: {
            in: [...ownProductFileIds, ...purchasedProductFileIds],
        },
    };
};

export const ProductFiles: CollectionConfig = {
    slug: "product_files",
    labels: {
        singular: "Soubor produktu",
        plural: "Soubory produktu",
    },
    admin: {
        hidden: ({ user }) => user.role !== "admin",
    },
    hooks: {
        beforeChange: [addUser],
    },
    access: {
        read: yourOwnAndPurchased,
        update: ({ req }) => req.user.role === "admin",
        delete: ({ req }) => req.user.role === "admin",
    },
    upload: {
        staticURL: "/product_files", // na tomhle endpointu budou soubory dostupné
        staticDir: "product_files", // budou tady v této složce
        // tímto vlastně říkáme, že složba product_files bude na routě /product_files
        mimeTypes: [
            "image/*", // Přijímá všechny formáty obrázků (včetně PNG, JPEG, SVG, atd.)
            "font/*", // Přijímá všechny formáty písma (např. TTF, OTF, WOFF)
            "application/postscript", // Soubory Adobe Illustrator/Photoshop (EPS)
            "text/css", // CSS soubory
            "application/json", // JSON soubory
            "application/vnd.sketch", // Soubory Sketch
        ],
    },
    fields: [
        {
            name: "user",
            type: "relationship",
            relationTo: "users",
            admin: {
                condition: () => false, // normalní uživatelé toto nemohou vidět v CMS
            },
            hasMany: true,
            required: true,
        },
    ],
};
