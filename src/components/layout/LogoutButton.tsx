"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { t } from "@/lib/t";

export function LogoutButton() {
	const router = useRouter();
	const [loading, setLoading] = useState(false);

	async function handleLogout() {
		if (loading) return;
		setLoading(true);
		try {
			// Payload REST logout — clears payload-token cookie. Credentials include ensures cookie is sent.
			// Primary verb is POST per Payload 3.88 (verified via Users.ts phoneLogin cookie handling).
			const res = await fetch("/api/users/logout", {
				method: "POST",
				credentials: "include",
			});
			// Fallback: try DELETE if POST returns 405 (some Payload configs expose DELETE)
			if (!res.ok && res.status === 405) {
				await fetch("/api/users/logout", { method: "DELETE", credentials: "include" }).catch(() => null);
			}
		} catch {
			// ignore network error — still navigate
		} finally {
			setLoading(false);
			router.push("/");
			router.refresh();
			// Hard fallback if router.refresh doesn't clear RSC cache quickly
			if (typeof window !== "undefined") {
				setTimeout(() => {
					if (document.visibilityState === "visible") window.location.href = "/";
				}, 200);
			}
		}
	}

	return (
		<button
			type="button"
			onClick={handleLogout}
			disabled={loading}
			aria-label={t("header.logout")}
			className="inline-flex h-9 items-center justify-center rounded-full border border-[#e5e5e5] bg-white px-4 text-[14px] font-medium leading-[1.5] text-[#111111] transition-colors hover:bg-[#f5f5f5] disabled:opacity-50 dark:border-[#39393b] dark:bg-transparent dark:text-white dark:hover:bg-[#39393b]"
		>
			{loading ? "…" : t("header.logout")}
		</button>
	);
}
