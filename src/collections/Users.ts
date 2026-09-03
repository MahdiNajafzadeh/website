import type { CollectionConfig } from "payload";
import { isAdmin } from "../access/index";
import { phoneNumberField } from "payload-phone-number-plugin";

export const Users: CollectionConfig = {
	slug: "users",
	auth: {
		tokenExpiration: 86400,
		disableLocalStrategy: true,
	},
	access: {
		read: ({ req, id }) => {
			const user = req.user;
			if (!user) return Boolean(id);
			if (user.role !== "customer") return true;
			return {
				id: { equals: user.id },
			};
		},
		create: () => true,
		update: ({ req, id }) => {
			const user = req.user;
			if (!user) return Boolean(id);
			if (user.role !== "customer") return true;
			return {
				id: { equals: user.id },
			};
		},
		delete: isAdmin,
		admin: ({ req }) => (req.user ? req.user.role === "admin" : false),
	},
	fields: [
		{
			name: "firstName",
			type: "text",
			required: true,
		},
		{
			name: "lastName",
			type: "text",
			required: true,
		},
		phoneNumberField({
			name: "phone",
			label: "Phone",
			required: true,
			unique: true,
			allowedCountries: ["IR"],
			defaultValue: "IR",
			admin: {
				cellDisplayFormat: "international",
			},
		}),
		{
			name: "address",
			type: "textarea",
			required: true,
		},
		{
			name: "role",
			saveToJWT: true,
			type: "select",
			required: true,
			defaultValue: "customer",
			options: [
				{ label: "Admin", value: "admin" },
				{ label: "Employee", value: "employee" },
				{ label: "Customer", value: "customer" },
			],
		},
		{
			name: "customerType",
			type: "select",
			required: true,
			defaultValue: "regular",
			options: [
				{ label: "Regular", value: "regular" },
				{ label: "Partner", value: "partner" },
			],
		},
	],
};
