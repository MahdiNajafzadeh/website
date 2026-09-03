"use client";

import { useEffect, useState } from "react";
import { useCartStore } from "@/lib/cart-store";

/**
 * CartBadge — client component for header cart icon
 * Uses cart-store count (sum of quantities) with hydration guard.
 * Design: {colors.ink} #111111 bg, {colors.canvas} #ffffff text, {rounded.full} 9999px, {typography.caption-sm} 12px/500
 */
export function CartBadge() {
	const [mounted, setMounted] = useState(false);
	const count = useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0));

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted || count === 0) return null;

	return (
		<span
			// {colors.ink} #111111 bg, {colors.canvas} #ffffff text, {rounded.full}
			className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#111111] px-1 text-[11px] font-medium leading-none text-white"
			role="status"
			aria-live="polite"
			aria-label={`${count} items in cart`}
		>
			{count > 99 ? "99+" : count}
		</span>
	);
}
