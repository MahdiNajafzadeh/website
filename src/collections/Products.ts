import type { CollectionConfig } from "payload";
import { slugField } from "payload";
import { isAdminOrEmployee, readVisibleOnly } from "../access/index";

export const Products: CollectionConfig = {
	slug: "products",
	admin: {
		useAsTitle: "name",
	},
	access: {
		read: readVisibleOnly,
		create: isAdminOrEmployee,
		update: isAdminOrEmployee,
		delete: isAdminOrEmployee,
	},
	fields: [
		{
			name: "name",
			type: "text",
			required: true,
		},
		slugField({ useAsSlug: "name", position: undefined }),
		{
			name: "visible",
			type: "checkbox",
			defaultValue: false,
			required: false,
		},
		{
			name: "price",
			type: "number",
			defaultValue: 0,
			min: 0,
			required: false,
		},
		{
			name: "inventory",
			type: "number",
			defaultValue: 0,
			min: 0,
			required: false,
		},
		{
			name: "brand",
			type: "relationship",
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			relationTo: "brands" as any,
			hasMany: false,
			required: false,
		},
		{
			name: "category",
			type: "relationship",
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			relationTo: "categories" as any,
			hasMany: false,
			required: false,
		},
		{
			name: "images",
			type: "array",
			required: false,
			fields: [
				{
					name: "image",
					type: "upload",
					relationTo: "media",
					required: true,
				},
			],
		},
		{
			name: "showcaseImage",
			type: "upload",
			relationTo: "media",
			required: false,
		},
	],
};
