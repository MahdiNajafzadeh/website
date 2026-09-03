import type { GlobalConfig } from "payload";
import { isAdminOrEmployee } from "../access/index";

export const PageAbout: GlobalConfig = {
	slug: "page-about",
	label: "Page About",
	access: {
		read: () => true,
		update: isAdminOrEmployee,
	},
	fields: [
		{
			name: "content",
			type: "richText",
			required: false,
		},
	],
};
