import { User } from "../payload-types";
import type {
  CollectionBeforeChangeHook,
  Access,
  CollectionConfig,
  Where,
} from "payload";

const addUser: CollectionBeforeChangeHook = ({ req, data }) => {
  const user = req.user as User | null;
  return { ...data, user: user?.id };
};

// Soubory, ke kterým má uživatel přístup pro čtení:
//   - admin vidí vše
//   - prodejce vidí SVOJE soubory (které nahrál - pole `user` na souboru)
//   - zákazník vidí soubory, které si KOUPIL (přes objednávky)
const yourOwnAndPurchased: Access = async ({ req }) => {
  const user = req.user as User | null;

  if (user?.role === "admin") return true;

  if (!user) return false;

  // soubory, které si uživatel koupil (dohledáme přes jeho objednávky)
  const { docs: orders } = await req.payload.find({
    collection: "orders",
    depth: 3, // spojí tabulky (Něco jako join), dá nám i celé produkty včetně jejich souborů
    where: {
      user: {
        equals: user.id,
      },
    },
  });

  const purchasedProductFileIds = orders
    .flatMap((order) =>
      order.products.map((product) => {
        // pokud depth nestačil a produkt je jen ID, soubory nedohledáme
        if (typeof product === "string" || typeof product === "number") {
          req.payload.logger.error(
            "Search depth not sufficient to find purchased file IDs",
          );
          return [];
        }

        return product.product_files.map((product_file) =>
          typeof product_file === "object" ? product_file.id : product_file,
        );
      }),
    )
    .flat();

  const orConditions: Where[] = [
    // vlastní soubory (uživatel je nahrál) - pole `user` na souboru
    { user: { in: [user.id] } },
  ];

  // zakoupené soubory
  if (purchasedProductFileIds.length) {
    orConditions.push({ id: { in: purchasedProductFileIds } });
  }

  return { or: orConditions };
};

// Prodejce smí upravovat/mazat jen SVOJE soubory; admin vše.
const adminOrOwner: Access = ({ req: { user } }) => {
  if (!user) return false;
  if (user.role === "admin") return true;
  return { user: { in: [user.id] } };
};

export const ProductFiles: CollectionConfig = {
  slug: "product_files",
  labels: {
    singular: "Soubor produktu",
    plural: "Soubory produktu",
  },
  admin: {
    hidden: ({ user }) => user?.role !== "admin",
  },
  hooks: {
    beforeChange: [addUser],
  },
  access: {
    read: yourOwnAndPurchased,
    create: ({ req }) => Boolean(req.user), // každý přihlášený prodejce může nahrávat
    update: adminOrOwner,
    delete: adminOrOwner,
  },
  upload: {
    // staticURL/staticDir (lokální filesystem) v Payload 3 nepoužíváme -
    // ukládání souborů řeší UploadThing plugin v payload.config.ts
    mimeTypes: [
      "image/*", // Přijímá všechny formáty obrázků (včetně PNG, JPEG, SVG, atd.)
      "font/*", // Přijímá všechny formáty písma (např. TTF, OTF, WOFF)
      "application/postscript", // Soubory Adobe Illustrator/Photoshop (EPS)
      "text/css", // CSS soubory
      "application/json", // JSON soubory
      "application/vnd.sketch", // Soubory Sketch
      //"application/zip", // Add zip mime type
      //"application/x-rar-compressed", // Add rar mime type
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
