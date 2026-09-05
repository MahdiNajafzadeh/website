import Link from "next/link";

const variants = {
	soft: "rounded-[30px] bg-[#f5f5f5] p-12 text-center dark:bg-[#1a1a1a]",
	outline: "rounded-[30px] bg-white p-12 text-center ring-1 ring-[#e5e5e5] dark:bg-[#1a1a1a] dark:ring-[#39393b]",
};

export function EmptyState({
	title,
	hint,
	actionLabel,
	actionHref,
	variant = "soft",
}: {
	title: string;
	hint?: string;
	actionLabel?: string;
	actionHref?: string;
	variant?: keyof typeof variants;
}) {
	return (
		<div className={`mt-8 ${variants[variant]}`}>
			<p className="text-[16px] font-medium leading-[1.5] text-[#111111] dark:text-white">{title}</p>
			{hint ? (
				<p className="mt-1 text-[14px] font-medium leading-[1.5] text-[#707072] dark:text-[#9e9ea0]">{hint}</p>
			) : null}
			{actionLabel && actionHref ? (
				<Link
					href={actionHref}
					className="mt-4 inline-flex rounded-full bg-[#111111] px-6 py-2 text-[14px] font-medium text-white hover:bg-[#111111]/90 dark:bg-white dark:text-[#111111]"
				>
					{actionLabel}
				</Link>
			) : null}
		</div>
	);
}