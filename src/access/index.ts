import type { Access } from "payload";

export const isAdmin: Access = ({ req }) => {
	const user = req.user as { role?: string } | undefined;
	return user?.role === "admin";
};

export const isAdminOrEmployee: Access = ({ req }) => {
	const user = req.user as { role?: string } | undefined;
	return user?.role === "admin" || user?.role === "employee";
};

export const readPublishedOnly: Access = ({ req }) => {
	const user = req.user as { role?: string } | undefined;
	if (user?.role === "admin" || user?.role === "employee") return true;
	return {
		published: {
			equals: true,
		},
	};
};

export const readVisibleOnly: Access = ({ req }) => {
	const user = req.user as { role?: string } | undefined;
	if (user?.role === "admin" || user?.role === "employee") return true;
	return {
		visible: {
			equals: true,
		},
	};
};

export const readOwnOrders: Access = ({ req }) => {
	const user = req.user as { id?: number; role?: string } | undefined;
	if (!user) return false;
	if (user.role === "admin" || user.role === "employee") return true;
	return {
		customer: {
			equals: user.id,
		},
	};
};
