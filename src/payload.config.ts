import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { uploadthingStorage } from "@payloadcms/storage-uploadthing";
import { nodemailerAdapter } from "@payloadcms/email-nodemailer";
import { buildConfig } from "payload";
import nodemailer from "nodemailer";
import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";

import { Users } from "./collections/Users";
import { Products } from "./collections/Procuts/Products";
import { Media } from "./collections/Media";
import { ProductFiles } from "./collections/ProductFiles";
import { Orders } from "./collections/Orders";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
    serverURL: process.env.NEXT_PUBLIC_SERVER_URL || "",
    collections: [Users, Products, Media, ProductFiles, Orders],
    routes: {
        // Admin (CMS) panel bude na /sell - "Nástěnka prodejce"
        admin: "/sell",
    },
    admin: {
        user: "users",
        meta: {
            titleSuffix: "- DigiShark",
        },
    },
    editor: lexicalEditor(),
    db: postgresAdapter({
        // UUID primární klíče (string) místo výchozích serial integerů.
        // Frontend i košík počítají se string ID (jako dříve u Mongo ObjectId).
        idType: "uuid",
        pool: {
            connectionString: process.env.DATABASE_URI || "",
        },
    }),
    email: nodemailerAdapter({
        defaultFromAddress: "onboarding@resend.dev",
        defaultFromName: "DigiShark",
        transport: nodemailer.createTransport({
            host: "smtp.resend.com",
            secure: true,
            port: 465,
            auth: {
                user: "resend",
                pass: process.env.RESEND_API_KEY,
            },
        }),
    }),
    // Payload 3 používá sharp pro generování velikostí obrázků (musí být závislost projektu)
    sharp,
    plugins: [
        // Soubory (Media obrázky + ProductFiles) se ukládají na UploadThing,
        // protože filesystem na Vercelu je read-only/efemérní.
        uploadthingStorage({
            collections: {
                media: true,
                product_files: true,
            },
            options: {
                token: process.env.UPLOADTHING_TOKEN,
                acl: "public-read",
            },
        }),
    ],
    secret: process.env.PAYLOAD_SECRET || "",
    typescript: {
        outputFile: path.resolve(dirname, "payload-types.ts"),
    },
});
