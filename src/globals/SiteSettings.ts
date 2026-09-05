import type { GlobalConfig } from "payload";
import { isAdmin } from "../access/index";

export const SiteSettings: GlobalConfig = {
	slug: "site-settings",
	label: "Site Settings",
	access: {
		read: () => true,
		update: isAdmin,
	},
	fields: [
		{
			name: "name",
			type: "text",
			required: true,
			defaultValue: "store",
		},
		{
			name: "logo",
			type: "upload",
			relationTo: "media",
			required: false,
		},
		{
			name: "favicon",
			type: "upload",
			relationTo: "media",
			required: false,
		},
		{
			name: "phones",
			type: "array",
			required: false,
			fields: [
				{
					name: "label",
					type: "text",
					required: false,
				},
				{
					name: "number",
					type: "text",
					required: true,
				},
				{
					name: "isPrimary",
					type: "checkbox",
					defaultValue: false,
					required: false,
				},
			],
		},
		{
			name: "emails",
			type: "array",
			required: false,
			fields: [
				{
					name: "label",
					type: "text",
					required: false,
				},
				{
					name: "email",
					type: "text",
					required: true,
				},
				{
					name: "isPrimary",
					type: "checkbox",
					defaultValue: false,
					required: false,
				},
			],
		},
		{
			name: "addresses",
			type: "array",
			required: false,
			fields: [
				{
					name: "label",
					type: "text",
					required: false,
				},
				{
					name: "address",
					type: "textarea",
					required: true,
				},
				{
					name: "isPrimary",
					type: "checkbox",
					defaultValue: false,
					required: false,
				},
			],
		},
		{
			name: "socialLinks",
			type: "array",
			required: false,
			fields: [
				{
					name: "icon",
					type: "upload",
					relationTo: "media",
					required: false,
				},
				{
					name: "name",
					type: "text",
					required: true,
				},
				{
					name: "url",
					type: "text",
					required: true,
				},
				{
					name: "description",
					type: "textarea",
					required: false,
				},
			],
		},
		{
			name: "partnerDiscount",
			type: "number",
			required: false,
			defaultValue: 0,
			min: 0,
			max: 100,
			admin: {
				description: "Partner discount percentage (0–100).",
			},
		},
		{
			name: "about",
			label: "About",
			type: "richText",
			required: false,
		},
	],
};
