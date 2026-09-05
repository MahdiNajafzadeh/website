import type { ReactNode } from "react";
import { t } from "@/lib/t";

export function PageHeader({
	title,
	subtitle,
	count,
	countLabel,
	trailing,
}: {
	title: string;
	subtitle?: string;
	count?: number;
	countLabel?: string;
	trailing?: ReactNode;
}) {
	return (
		<div className="mb-6 flex flex-wrap items-center justify-between gap-3">
			<div>
				<h1 className="text-[32px] font-medium leading-[1.2] text-[#111111] dark:text-white">{title}</h1>
				{subtitle ? (
					<p className="mt-1 text-[14px] font-medium text-[#707072] dark:text-[#9e9ea0]">{subtitle}</p>
				) : null}
				{count !== undefined && countLabel ? (
					<p className="mt-1 text-[14px] font-medium text-[#707072] dark:text-[#9e9ea0]">
						{t("common.countWithLabel", {
							count: count.toLocaleString("fa-IR"),
							label: countLabel,
						})}
					</p>
				) : null}
			</div>
			{trailing}
		</div>
	);
}