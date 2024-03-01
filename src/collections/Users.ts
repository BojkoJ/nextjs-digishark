import { PrimaryActionEmailHtml } from "../components/emails/PrimaryActionEmail";
import { Access, CollectionConfig } from "payload/types";

const adminsAndUser: Access = ({ req: { user } }) => {
	if (user.role === "admin") return true;

	return {
		id: {
			equals: user.id,
		},
	};
};

export const Users: CollectionConfig = {
	labels: {
		singular: "Uživatel",
		plural: "Uživatelé",
	},
	slug: "users",
	auth: {
		verify: {
			generateEmailHTML: ({ token }) => {
				return PrimaryActionEmailHtml({
					actionLabel: "Ověřte svůj e-mail",
					buttonText: "Ověřit e-mail",
					href: `${process.env.NEXT_PUBLIC_SERVER_URL}/overit-email?token=${token}`,
				});
			},
		},
	},
	access: {
		read: adminsAndUser,
		create: () => true, // každý si může vytvořit účet
		update: ({ req }) => req.user.role === "admin",
		delete: ({ req }) => req.user.role === "admin",
	},
	admin: {
		hidden: ({ user }) => user.role !== "admin", // schované pro uživatele co nejsou admini
		defaultColumns: ["id"],
	},
	fields: [
		{
			name: "products",
			label: "Produkty",
			admin: {
				condition: () => false,
			},
			type: "relationship",
			relationTo: "products",
			hasMany: true,
		},
		{
			name: "product_files",
			label: "Soubory produktů",
			admin: {
				condition: () => false,
			},
			type: "relationship",
			relationTo: "product_files",
			hasMany: true,
		},
		{
			name: "role",
			defaultValue: "user",
			required: true,
			type: "select",
			options: [
				{
					label: "Admin",
					value: "admin",
				},
				{
					label: "User",
					value: "user",
				},
			],
		},
	],
};
