import { PRODUCT_CATEGORIES } from "../../config";
import { CollectionConfig } from "payload/types";

export const Products: CollectionConfig = {
    labels: {
        singular: "Produkt",
        plural: "Produkty",
    },
    slug: "products",
    admin: {
        useAsTitle: "name",
    },
    access: {
        // access rules - pravidla kdo může mít přístup k jakým částem jakéhp produktu
    },
    fields: [
        {
            name: "user",
            type: "relationship",
            relationTo: "users",
            required: true,
            hasMany: false,
            admin: {
                condition: () => false, // v CMS tohle pole nepůjde vidět - je to jen vazba na uživatele, který produkt vytvořil
            },
        },
        {
            name: "name",
            label: "Jméno produktu",
            type: "text",
            required: true,
        },
        {
            name: "description",
            label: "Popis produktu",
            type: "textarea",
        },
        {
            name: "price",
            label: "Cena v CZK",
            min: 0,
            max: 10000,
            type: "number",
            required: true,
        },
        {
            name: "category",
            label: "Kategorie",
            type: "select",
            options: PRODUCT_CATEGORIES.map(({ label, value }) => ({
                label,
                value,
            })),
            required: true,
        },
        {
            name: "product_files",
            label: "Soubor(y) produktu",
            type: "relationship",
            required: true,
            relationTo: "product_files",
            hasMany: true, // každý produkt může mít více souborů (např. set ikon v několika různých formátech souboru)
        },
        {
            name: "approvedForSale",
            label: "Status Produktu",
            type: "select",
            defaultValue: "pending",
            access: {
                // request obsahuje roli uživatele
                create: ({ req }) => req.user.role === "admin",
                read: ({ req }) => req.user.role === "admin",
                update: ({ req }) => req.user.role === "admin",
            },
            options: [
                {
                    label: "Čeká na schválení",
                    value: "pending",
                },
                {
                    label: "Schváleno",
                    value: "approved",
                },
                {
                    label: "Zamítnuto",
                    value: "denied",
                },
            ],
        },
        {
            name: "priceId",
            type: "text",
            admin: {
                hidden: true,
            },
            access: {
                // tohle pole nemůže nikdo měnit, kromě nás na backendu při volání getPayloadClient kde získáme CMS
                // tam lze přepsat (overwrite) tohle access nastavení
                create: () => false,
                read: () => false,
                update: () => false,
            },
        },
        {
            name: "stripeId",
            type: "text",
            admin: {
                hidden: true,
            },
            access: {
                // tohle pole nemůže nikdo měnit, kromě nás na backendu při volání getPayloadClient kde získáme CMS
                // tam lze přepsat (overwrite) tohle access nastavení
                create: () => false,
                read: () => false,
                update: () => false,
            },
        },
        {
            name: "images",
            label: "Náhledové obrázky produktu",
            type: "array",
            minRows: 1,
            maxRows: 4,
            required: true,
            labels: {
                singular: "Náhledový obrázek",
                plural: "Náhledové obrázky",
            },
            fields: [
                {
                    name: "image",
                    type: "upload",
                    relationTo: "media",
                    required: true,
                },
            ],
        },
    ],
};
