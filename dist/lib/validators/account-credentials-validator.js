"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthCredentialsValidator = void 0;
var zod_1 = require("zod");
exports.AuthCredentialsValidator = zod_1.z.object({
    email: zod_1.z.string().email({ message: "Prosíme zadejte validní email" }),
    password: zod_1.z
        .string()
        .min(8, { message: "Heslo musí být alespoň 8 znaků dlouhé" }),
});
