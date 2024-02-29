"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Orders = void 0;
var yourOwn = function (_a) {
    var user = _a.req.user;
    if (user.role === "admin")
        return true;
    // Zajištění toho aby uživatel mohl číst jen svoje objednávky
    // vracíme kladnou hodnotu typu Access pokud user (pole v kolekci) se bude rovnat user.id z requestu
    return {
        user: {
            equals: user === null || user === void 0 ? void 0 : user.id,
        },
    };
};
exports.Orders = {
    slug: "orders",
    labels: {
        singular: "Objednávka",
        plural: "Objednávky",
    },
    access: {
        read: yourOwn,
        update: function (_a) {
            var req = _a.req;
            return req.user.role === "admin";
        },
        delete: function (_a) {
            var req = _a.req;
            return req.user.role === "admin";
        },
        create: function (_a) {
            var req = _a.req;
            return req.user.role === "admin";
        },
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
                read: function (_a) {
                    var req = _a.req;
                    return req.user.role === "admin";
                },
                create: function () { return false; },
                update: function () { return false; },
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
