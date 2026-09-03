import { APIError, generatePayloadCookie, headersWithCors } from "payload";
import type { CollectionConfig, Endpoint } from "payload";
import { isAdmin } from "../access/index";

const PHONE_RE = /^09\d{9}$/;

const register: Endpoint = {
	path: "/register",
	method: "post",
	handler: async (req) => {
		const body = ((await req.json?.().catch(() => ({}))) ?? {}) as Record<string, unknown>;

		const firstName = typeof body.firstName === "string" ? body.firstName.trim() : "";
		const lastName = typeof body.lastName === "string" ? body.lastName.trim() : "";
		const phone = typeof body.phone === "string" ? body.phone.trim() : "";
		const password = typeof body.password === "string" ? body.password : "";
		const address = typeof body.address === "string" ? body.address.trim() : undefined;

		if (!firstName || !lastName) {
			throw new APIError("First name and last name are required.", 400);
		}
		if (!PHONE_RE.test(phone)) {
			throw new APIError("Invalid Iranian mobile number. Must be 11 digits starting with 09.", 400);
		}
		if (password.length < 6) {
			throw new APIError("Password must be at least 6 characters.", 400);
		}

		const existing = await req.payload.find({
			collection: "users",
			where: { phone: { equals: phone } },
			limit: 1,
			overrideAccess: true,
			depth: 0,
		});
		if (existing.docs.length > 0) {
			throw new APIError("Phone number already registered.", 409);
		}

		const createData = {
			firstName,
			lastName,
			phone,
			password,
			address,
			role: "customer" as const,
			customerType: "regular" as const,
		};

		// The Users collection has no drafts; Payload's generated Options<"users"> union still
		// requires `draft: true` on a `UsersSelect<true>` overload, which is unreachable here.
		// Cast through `any` to keep the wire shape untyped while the row goes through the
		// beforeValidate hook that mirrors phone -> username.
		await (
			req.payload.create as (args: {
				collection: "users";
				data: Record<string, unknown>;
				req: typeof req;
			}) => Promise<unknown>
		)({
			collection: "users",
			data: createData as unknown as Record<string, unknown>,
			req,
		});

		const loginResult = await req.payload.login({
			collection: "users",
			data: { username: phone, password },
		});

		const collectionConfig = req.payload.collections["users"].config;
		const cookie = generatePayloadCookie({
			collectionAuthConfig: collectionConfig.auth,
			cookiePrefix: req.payload.config.cookiePrefix,
			token: loginResult.token as string,
		});

		return Response.json(
			{
				exp: loginResult.exp,
				token: loginResult.token,
				user: loginResult.user,
			},
			{
				status: 200,
				headers: headersWithCors({
					headers: new Headers({ "Set-Cookie": cookie }),
					req,
				}),
			},
		);
	},
};

export const Users: CollectionConfig = {
	slug: "users",
	admin: {
		useAsTitle: "phone",
	},
	auth: {
		tokenExpiration: 86400,
		disableLocalStrategy: true,
	},
	endpoints: [register],
	access: {
		read: ({ req, id }) => {
			const user = req.user as { role?: string; id?: number } | undefined;
			if (!user) {
				if (id) return true;
				return false;
			}
			if (user.role === "admin" || user.role === "employee") return true;
			return {
				id: { equals: user.id },
			};
		},
		create: () => true,
		update: ({ req, id }) => {
			const user = req.user as { role?: string; id?: number } | undefined;
			if (!user) return false;
			if (user.role === "admin") return true;
			if (user.role === "employee" && id !== user.id) return false;
			if (id && user.id === id) return true;
			return false;
		},
		delete: isAdmin,
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
		{
			name: "phone",
			type: "text",
			required: true,
			unique: true,
			validate: (value: unknown) => {
				if (typeof value !== "string" || value.length === 0) {
					return true;
				}
				if (!/^09\d{9}$/.test(value)) {
					return "Invalid Iranian mobile number. Must be 11 digits starting with 09 (e.g. 09123456789).";
				}
				return true;
			},
		},
		{
			name: "address",
			type: "textarea",
			required: false,
		},
		{
			name: "role",
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
