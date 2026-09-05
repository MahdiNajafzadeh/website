"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function QuantityStepper({
	quantity: qty,
	onDecrement,
	onIncrement,
	onRemove,
	size = "md",
	labels,
}: {
	id: string;
	quantity: number;
	onDecrement: () => void;
	onIncrement: () => void;
	onRemove: () => void;
	size?: "sm" | "md";
	labels: { decrement: string; increment: string; remove: string };
}) {
	const sizeClasses = size === "sm" ? "h-7 w-7" : "h-8 w-8";
	const iconSize = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
	const widthCls = size === "sm" ? "w-8 text-[14px]" : "w-10 text-[16px]";
	const trashHover = size === "sm" ? "hover:text-[#d30005]" : "";
	return (
		<div className="flex items-center gap-2">
			<Button
				variant="outline"
				size="icon-sm"
				aria-label={labels.decrement}
				className={`${sizeClasses} rounded-full border-[#cacacb] dark:border-[#39393b]`}
				onClick={onDecrement}
			>
				<Minus className={iconSize} />
			</Button>
			<span className={`${widthCls} text-center font-medium text-[#111111] dark:text-white`}>
				{qty.toLocaleString("fa-IR")}
			</span>
			<Button
				variant="outline"
				size="icon-sm"
				aria-label={labels.increment}
				className={`${sizeClasses} rounded-full border-[#cacacb] dark:border-[#39393b]`}
				onClick={onIncrement}
			>
				<Plus className={iconSize} />
			</Button>
			<Button
				variant="ghost"
				size="icon-sm"
				aria-label={labels.remove}
				className={`ml-auto ${sizeClasses} rounded-full text-[#d30005] hover:bg-[#d30005]/10 ${trashHover}`}
				onClick={onRemove}
			>
				<Trash2 className="h-4 w-4" />
			</Button>
		</div>
	);
}