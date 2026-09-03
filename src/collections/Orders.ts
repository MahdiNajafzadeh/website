import type { CollectionConfig } from "payload";
import { isAdmin, isAdminOrEmployee, readOwnOrders } from "../access/index";

const allowedTransitions: Record<string, string[]> = {
	review: ["approved", "cancelled"],
	approved: ["preparing", "cancelled"],
	preparing: ["delivered", "cancelled"],
	delivered: ["cancelled"],
	cancelled: [],
};

export const Orders: CollectionConfig = {
	slug: "orders",
	admin: {
		useAsTitle: "id",
		defaultColumns: ["customer", "total", "status", "createdAt"],
	},
	access: {
		read: readOwnOrders,
		create: ({ req }) => !!req.user,
		update: isAdminOrEmployee,
		delete: isAdmin,
	},
	hooks: {
		beforeChange: [
			({ data, originalDoc, operation }) => {
				if (!data) return data;
				const d = data as Record<string, unknown>;

				// Compute total and hasZeroPrice from items
				const items = d.items as Array<{ price?: unknown; quantity?: unknown }> | undefined;

				if (Array.isArray(items)) {
					let total = 0;
					let hasZeroPrice = false;
					for (const item of items) {
						const price = typeof item.price === "number" ? item.price : Number(item.price) || 0;
						const qty = typeof item.quantity === "number" ? item.quantity : Number(item.quantity) || 0;
						total += price * qty;
						if (price === 0) hasZeroPrice = true;
					}
					d.total = total;
					d.hasZeroPrice = hasZeroPrice;
				} else if (operation === "create") {
					d.total = 0;
					d.hasZeroPrice = false;
				}

				// Enforce status transition guard
				if (operation === "update" && originalDoc) {
					const original = originalDoc as Record<string, unknown>;
					const prevStatus = original.status as string | undefined;
					const nextStatus = d.status as string | undefined;
					if (prevStatus && nextStatus && prevStatus !== nextStatus) {
						// cancelled is allowed from any state
						if (nextStatus === "cancelled") {
							// always allowed
						} else {
							const allowed = allowedTransitions[prevStatus] ?? [];
							if (!allowed.includes(nextStatus)) {
								throw new Error(
									`Invalid status transition from "${prevStatus}" to "${nextStatus}". Allowed: ${allowed.join(", ") || "none"}.`,
								);
							}
						}
					}
				}

				return data;
			},
		],
	},
	fields: [
		{
			name: "customer",
			type: "relationship",
			relationTo: "users",
			required: true,
			hasMany: false,
			index: true,
		},
		{
			name: "items",
			type: "array",
			required: true,
			minRows: 1,
			fields: [
				{
					name: "product",
					type: "relationship",
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					relationTo: "products" as any,
					required: false,
					hasMany: false,
				},
				{
					name: "name",
					type: "text",
					required: false,
					admin: {
						description: "Snapshot of product name at order time.",
					},
				},
				{
					name: "price",
					type: "number",
					required: true,
					min: 0,
					admin: {
						description: "Snapshot of product price at order time.",
					},
				},
				{
					name: "quantity",
					type: "number",
					required: true,
					min: 1,
				},
			],
		},
		{
			name: "total",
			type: "number",
			required: false,
			min: 0,
			admin: {
				description: "Auto-computed as sum(price * quantity).",
				readOnly: true,
			},
		},
		{
			name: "status",
			type: "select",
			required: true,
			defaultValue: "review",
			options: [
				{ label: "Review", value: "review" },
				{ label: "Approved", value: "approved" },
				{ label: "Preparing", value: "preparing" },
				{ label: "Delivered", value: "delivered" },
				{ label: "Cancelled", value: "cancelled" },
			],
		},
		{
			name: "shippingAddress",
			type: "textarea",
			required: false,
		},
		{
			name: "notes",
			type: "array",
			required: false,
			fields: [
				{
					name: "note",
					type: "textarea",
					required: true,
				},
				{
					name: "createdAt",
					type: "date",
					required: false,
					admin: {
						date: {
							pickerAppearance: "dayAndTime",
						},
					},
				},
				{
					name: "createdBy",
					type: "relationship",
					relationTo: "users",
					required: false,
					hasMany: false,
				},
			],
		},
		{
			name: "hasZeroPrice",
			type: "checkbox",
			defaultValue: false,
			required: false,
			admin: {
				description: "Auto-set if any item has price 0.",
				readOnly: true,
			},
		},
	],
};
