import { Access, CollectionConfig } from "payload/types";

const yourOwn: Access = ({ req: { user } }) => {
    if (user.role === "admin") return true;

    // Zajištění toho aby uživatel mohl číst jen svoje objednávky

    // vracíme kladnou hodnotu typu Access pokud user (pole v kolekci) se bude rovnat user.id z requestu
    return {
        user: {
            equals: user?.id,
        },
    };
};

export const Orders: CollectionConfig = {
    slug: "orders",
    labels: {
        singular: "Objednávka",
        plural: "Objednávky",
    },
    access: {
        read: yourOwn,
        update: ({ req }) => req.user.role === "admin",
        delete: ({ req }) => req.user.role === "admin",
        create: ({ req }) => req.user.role === "admin",
    },
    admin: {
        useAsTitle: "Vaše objednávky",
        description: "Přehled všech vašich objednávek na DigiShark.",
    },
    fields: [
        {
            name: "_isPaid",
            type: "checkbox",
            label: "Zaplaceno",
            access: {
                read: ({ req }) => req.user.role === "admin",
                create: () => false,
                update: () => false,
            },
            admin: {
                hidden: true,
            },
            required: true,
        },
        {
            name: "user",
            type: "relationship",
            relationTo: "users",
            admin: {
                hidden: true,
            },
            required: true,
        },
        {
            name: "products",
            type: "relationship",
            relationTo: "products",
            required: true,
            hasMany: true, // jedna objednávka může mít spojení na více produktů
        },
    ],
};
