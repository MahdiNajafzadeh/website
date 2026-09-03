import Link from "next/link";

export interface SectionHeadProps {
	eyebrow: string;
	title: string;
	titleId?: string;
	actionHref?: string;
	actionLabel?: string;
}

export function SectionHead({ eyebrow, title, titleId, actionHref, actionLabel }: SectionHeadProps) {
	return (
		<div className="flex items-end justify-between gap-4 border-b border-[#e5e5e5] pb-4 dark:border-[#39393b]">
			<div className="min-w-0">
				<p className="text-[12px] font-medium uppercase tracking-[0.08em] text-[#707072] dark:text-[#9e9ea0]">
					{eyebrow}
				</p>
				<h2
					className="mt-1 text-[32px] font-medium leading-[1.2] tracking-[-0.01em] text-[#111111] dark:text-white"
					id={titleId}
				>
					{title}
				</h2>
			</div>
			{actionHref && actionLabel ? (
				<Link
					href={actionHref}
					className="hidden shrink-0 rounded-full border border-[#e5e5e5] bg-white px-4 py-1.5 text-[14px] font-medium text-[#111111] transition-colors hover:bg-[#f5f5f5] dark:border-[#39393b] dark:bg-transparent dark:text-white dark:hover:bg-[#39393b] sm:inline-flex"
				>
					{actionLabel}
				</Link>
			) : null}
		</div>
	);
}
