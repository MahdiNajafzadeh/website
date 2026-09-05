import type { User } from "@/payload-types";

export function userDisplayName(user: number | User | null | undefined): string {
	if (!user) return "—";
	if (typeof user === "number") return `#${user}`;
	const u = user as User;
	if (u.firstName || u.lastName) return `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim();
	return `#${u.id}`;
}
