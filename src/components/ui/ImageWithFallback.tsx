import { Package } from "lucide-react";
import { t } from "@/lib/t";

export function ImageWithFallback({
	src,
	alt,
	variant = "card",
	className,
}: {
	src: string | null | undefined;
	alt: string;
	variant?: "card" | "hero" | "category";
	className?: string;
}) {
	if (src) {
		return (
			// eslint-disable-next-line @next/next/no-img-element
			<img
				src={src}
				alt={alt}
				className={className ?? "h-full w-full object-cover"}
				loading="lazy"
			/>
		);
	}
	if (variant === "hero") {
		return (
			<div className="flex flex-col items-center gap-2 py-12 text-sm text-[#707072] dark:text-[#9e9ea0]">
				<Package className="size-8 text-[#9e9ea0]" />
				{t("common.noImage")}
			</div>
		);
	}
	if (variant === "category") {
		return (
			<div className="flex h-full w-full items-center justify-center bg-[#f5f5f5] dark:bg-[#1a1a1a]">
				<span className="text-[12px] font-medium text-[#9e9ea0]">{t("common.noImage")}</span>
			</div>
		);
	}
	return (
		<div className="flex h-full w-full items-center justify-center text-sm text-[#707072] dark:text-[#9e9ea0]">
			{t("common.noImage")}
		</div>
	);
}