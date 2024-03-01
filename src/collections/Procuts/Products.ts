import {
	BeforeChangeHook,
	AfterChangeHook,
} from "payload/dist/collections/config/types";
import { PRODUCT_CATEGORIES } from "../../config";
import { Access, CollectionConfig } from "payload/types";
import { Product, User } from "../../payload-types";
import { stripe } from "../../lib/stripe";

const addUser: BeforeChangeHook<Product> = async ({ req, data }) => {
	const user = req.user;

	return { ...data, user: user.id };
};

const syncUser: AfterChangeHook<Product> = async ({ req, doc }) => {
	const fullUser = await req.payload.findByID({
		collection: "users",
		id: req.user.id,
	});

	if (fullUser && typeof fullUser === "object") {
		const { products } = fullUser;

		const allIDs = [
			...(products?.map((product) =>
				typeof product === "object" ? product.id : product
			) || []),
		];

		const createdProductIDs = allIDs.filter(
			(id, index) => allIDs.indexOf(id) === index
		);

		const dataToUpdate = [...createdProductIDs, doc.id];

		await req.payload.update({
			collection: "users",
			id: fullUser.id,
			data: {
				products: dataToUpdate,
			},
		});
	}
};

const isAdminOrHasAccess =
	(): Access =>
	({ req: { user: _user } }) => {
		const user = _user as User | undefined;

		if (!user) return false;
		if (user.role === "admin") return true;

		const userProductIDs = (user.products || []).reduce<Array<string>>(
			(acc, product) => {
				if (!product) return acc;

				if (typeof product === "string") {
					acc.push(product);
				} else {
					acc.push(product.id);
				}

				return acc;
			},
			[]
		);

		return {
			id: {
				in: userProductIDs,
			},
		};
	};

export const Products: CollectionConfig = {
	labels: {
		singular: "Produkt",
		plural: "Produkty",
	},
	hooks: {
		afterChange: [syncUser],
		beforeChange: [
			addUser,
			async (args) => {
				if (args.operation === "create") {
					const data = args.data as Product;

					const createdProduct = await stripe.products.create({
						name: data.name,
						default_price_data: {
							currency: "CZK",
							unit_amount: Math.round(data.price * 100),
						},
					});

					const updated: Product = {
						...data,
						stripeId: createdProduct.id,
						priceId: createdProduct.default_price as string,
					};

					return updated;
				} else if (args.operation === "update") {
					const data = args.data as Product;

					const updatedProduct = await stripe.products.update(data.stripeId!, {
						name: data.name,
						default_price: data.priceId!,
					});

					const updated: Product = {
						...data,
						stripeId: updatedProduct.id,
						priceId: updatedProduct.default_price as string,
					};

					return updated;
				}
			},
		],
	},
	slug: "products",
	admin: {
		useAsTitle: "name",
	},
	access: {
		// access rules - pravidla kdo může mít přístup k jakým částem jakéhp produktu
		read: isAdminOrHasAccess(),
		update: isAdminOrHasAccess(),
		delete: isAdminOrHasAccess(),
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
