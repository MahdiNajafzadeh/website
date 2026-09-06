import type { User } from "@/payload-types";
import type { CollectionAfterChangeHook, CollectionBeforeValidateHook, CollectionConfig } from "payload";
import { isAdmin } from "../access/index";
import { phoneNumberField } from "payload-phone-number-plugin";
import { parsePhoneNumberFromString } from "libphonenumber-js";

const formatPhoneToE164 = (phone: string): string => {
	try {
		const parsed = parsePhoneNumberFromString(phone, "IR");
		if (parsed?.isValid?.()) return parsed.format("E.164");
		return phone;
	} catch {
		return phone;
	}
};

const loginAfterCreate: CollectionAfterChangeHook<User> = async ({ doc, data, operation, req, req: { payload } }) => {
	if (operation !== "create") return doc;
	const rawUsername =
		(data as unknown as Record<string, unknown>)?.username ??
		(doc as unknown as Record<string, unknown>)?.username;
	const rawPassword = (data as unknown as Record<string, unknown>)?.password;
	if (typeof rawUsername !== "string") return doc;
	if (typeof rawPassword !== "string") return doc;
	const username = formatPhoneToE164(rawUsername);
	const password = rawPassword;
	try {
		await payload.login({
			collection: "users",
			data: { username, password },
			req,
			depth: 0,
		});
	} catch (err) {
		payload.logger.error({
			err,
			msg: "loginAfterCreate: auto-login failed, user created but session not established",
		});
	}
	return doc;
};

const formatPhoneBeforeValidate: CollectionBeforeValidateHook<User> = ({ data }) => {
	if (data && typeof data.username === "string") data.username = formatPhoneToE164(data.username);
	return data;
};

export const Users: CollectionConfig = {
	slug: "users",
	auth: {
		tokenExpiration: 86400,
		loginWithUsername: {
			requireEmail: false,
			allowEmailLogin: false,
		},
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
	hooks: {
		afterChange: [loginAfterCreate],
		beforeValidate: [formatPhoneBeforeValidate],
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
			name: "username",
			label: "Password",
			required: true,
			unique: true,
			allowedCountries: ["IR"],
			admin: {
				cellDisplayFormat: "national",
				countryPrefixDisplayFormat: "flagEmoji",
			},
		}),
		{
			name: "address",
			type: "textarea",
			required: false,
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
