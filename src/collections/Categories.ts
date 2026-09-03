import type { CollectionConfig } from "payload";
import { slugField } from "payload";
import { isAdminOrEmployee } from "../access/index";

export const Categories: CollectionConfig = {
	slug: "categories",
	admin: {
		useAsTitle: "name",
	},
	access: {
		read: () => true,
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
			name: "description",
			type: "textarea",
			required: false,
		},
	],
};
