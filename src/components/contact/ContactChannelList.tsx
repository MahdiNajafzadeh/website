import { Card, CardContent } from "@/components/ui/card";
import { t } from "@/lib/t";

type Channel = {
	id?: string | number | null;
	label?: string | null;
	isPrimary?: boolean | null;
	[key: string]: unknown;
};

export function ContactChannelList<K extends "phone" | "email" | "address">({
	channels,
	kind,
	heading,
	noChannelLabel,
	defaultLabel,
	variant,
}: {
	channels: Channel[] | null | undefined;
	kind: K;
	heading?: string;
	noChannelLabel: string;
	defaultLabel: string;
	variant: "card" | "footer";
}) {
	const items = channels ?? [];
	const empty = items.length === 0;

	const buildLink = (item: Channel) => {
		if (kind === "phone") return `tel:${(item.number as string)?.replace(/\s+/g, "") ?? ""}`;
		if (kind === "email") return `mailto:${(item.email as string) ?? ""}`;
		return undefined;
	};
	const valueField = (item: Channel) => {
		if (kind === "phone") return (item.number as string) ?? "";
		if (kind === "email") return (item.email as string) ?? "";
		return (item.address as string) ?? "";
	};
	const keyOf = (item: Channel, idx: number, value: string) =>
		(item.id as string | number | undefined) ?? `${value}-${idx}`;

	if (variant === "footer") {
		return (
			<div className="space-y-4">
				{heading ? (
					<h3 className="text-[14px] font-medium leading-[1.5] text-[#111111] dark:text-white">
						{heading}
					</h3>
				) : null}
				{empty ? (
					<p className="text-[14px] leading-[1.5]">{noChannelLabel}</p>
				) : (
					<ul className="space-y-3">
						{items.map((item, idx) => {
							const href = buildLink(item);
							const value = valueField(item);
							return (
								<li key={keyOf(item, idx, value)}>
									<p className="text-[12px] font-medium uppercase tracking-wide text-[#707072] dark:text-[#9e9ea0]">
										{item.label || defaultLabel}
									</p>
									{href ? (
										<a
											href={href}
											className="text-[14px] font-medium leading-[1.5] text-[#111111] hover:underline dark:text-white"
										>
											{value}
										</a>
									) : (
										<p className="text-[14px] leading-[1.5] text-[#111111] dark:text-white">
											{value}
										</p>
									)}
								</li>
							);
						})}
					</ul>
				)}
			</div>
		);
	}
	return (
		<Card className="rounded-[18px] border border-[#cacacb] bg-white dark:border-[#39393b] dark:bg-[#1a1a1a] p-0 gap-0">
			<CardContent className="p-6">
				{empty ? (
					<p className="mt-3 text-[14px] font-medium text-[#707072] dark:text-[#9e9ea0]">
						{noChannelLabel}
					</p>
				) : (
					<ul className="mt-4 space-y-3">
						{items.map((item, idx) => {
							const href = buildLink(item);
							const value = valueField(item);
							return (
								<li key={keyOf(item, idx, value)} className="flex items-start justify-between gap-3">
									<div className="min-w-0">
										<p className="text-[12px] font-medium uppercase tracking-wide text-[#707072] dark:text-[#9e9ea0]">
											{t("contact.labelWithSuffix", {
												label: (item.label as string) || defaultLabel,
												suffix: item.isPrimary ? t("contact.primarySuffix") : "",
											})}
										</p>
										{href && value ? (
											<a
												href={href}
												className={`mt-0.5 inline-block text-[14px] font-medium text-[#111111] hover:underline dark:text-white ${kind === "email" ? "break-all" : ""}`}
											>
												{value}
											</a>
										) : value ? (
											<p className="mt-0.5 whitespace-pre-line text-[14px] leading-[1.5] text-[#111111] dark:text-white">
												{value}
											</p>
										) : (
											<span className="mt-0.5 inline-block text-[14px] font-medium text-[#707072]">
												{t("common.dash")}
											</span>
										)}
									</div>
								</li>
							);
						})}
					</ul>
				)}
			</CardContent>
		</Card>
	);
}