import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import type { User } from "@/payload-types";

export async function requireUser(redirectTo?: string): Promise<User> {
	const user = await getCurrentUser();
	if (!user) {
		const headerList = await headers();
		const pathname = headerList.get("x-pathname") ?? headerList.get("x-invoke-path") ?? "";
		const target = redirectTo ?? (pathname ? `/login?next=${encodeURIComponent(pathname)}` : "/login");
		redirect(target);
	}
	return user;
}
