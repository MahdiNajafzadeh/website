import Link from "next/link";
import { getPayload } from "payload";
import type { Metadata } from "next";
import config from "@/payload.config";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getSiteSettings, deriveName, primaryContact } from "@/lib/site-settings";
import type { Media } from "@/payload-types";
import { t } from "@/lib/t";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
	const settings = await getSiteSettings();
	const siteName = deriveName(settings);
	return { title: `${t("contact.title")} | ${siteName}`, description: `${t("contact.title")} — ${siteName}` };
}

async function fetchSettings() {
	try {
		const payloadConfig = await config;
		const payload = await getPayload({ config: payloadConfig });
		return await payload.findGlobal({ slug: "site-settings", depth: 1 });
	} catch {
		return null;
	}
}

function getMediaUrl(media: unknown): string | null {
	if (!media || typeof media !== "object") return null;
	return (media as Media).url ?? null;
}

function hasContent(v: unknown): boolean {
	return Array.isArray(v) ? v.length > 0 : Boolean(v);
}

export default async function ContactPage() {
	const settings = await fetchSettings();
	const siteName = deriveName(settings as never);
	const phones = (settings?.phones ?? []) as Array<{
		id?: string | null;
		label?: string | null;
		number?: string | null;
		isPrimary?: boolean | null;
	}>;
	const emails = (settings?.emails ?? []) as Array<{
		id?: string | null;
		label?: string | null;
		email?: string | null;
		isPrimary?: boolean | null;
	}>;
	const addresses = (settings?.addresses ?? []) as Array<{
		id?: string | null;
		label?: string | null;
		address?: string | null;
		isPrimary?: boolean | null;
	}>;
	const socialLinks = (settings?.socialLinks ?? []) as Array<{
		id?: string | null;
		name: string;
		url: string;
		description?: string | null;
		icon?: unknown;
	}>;
	const primaryPhone = primaryContact(phones);
	const primaryEmail = primaryContact(emails);
	const primaryAddress = primaryContact(addresses);
	const hasAnyChannel = hasContent(phones) || hasContent(emails) || hasContent(addresses) || hasContent(socialLinks);

	return (
		<div className="mx-auto max-w-[1440px] px-4 py-8 md:px-8">
			<nav
				className="mb-6 flex items-center gap-1.5 text-sm text-[#707072] dark:text-[#9e9ea0]"
				aria-label="Breadcrumb"
			>
				<Link href="/" className="hover:text-[#111111] dark:hover:text-white">
					{t("common.home")}
				</Link>
				<span aria-hidden>›</span>
				<span className="font-medium text-[#111111] dark:text-white">{t("contact.title")}</span>
			</nav>

			<h1 className="text-[32px] font-medium leading-[1.2] text-[#111111] dark:text-white">
				{t("contact.title")}
			</h1>
			<p className="mt-1 text-[14px] font-medium text-[#707072] dark:text-[#9e9ea0]">
				{t("contact.title")} — {siteName}
			</p>

			{!hasAnyChannel ? (
				<div className="mt-8 rounded-[30px] bg-[#f5f5f5] p-12 text-center dark:bg-[#1a1a1a]">
					<p className="text-[16px] font-medium text-[#111111] dark:text-white">{t("contact.noPhone")}</p>
					<p className="mt-1 text-[14px] font-medium text-[#707072] dark:text-[#9e9ea0]">
						{t("contact.noSocial")}
					</p>
				</div>
			) : (
				<div className="mt-8 grid gap-6 md:grid-cols-2">
					<Card className="rounded-[18px] border border-[#cacacb] bg-white dark:border-[#39393b] dark:bg-[#1a1a1a] p-0 gap-0">
						<CardContent className="p-6">
							<div className="flex items-center justify-between">
								<h2 className="text-[16px] font-medium text-[#111111] dark:text-white">
									{t("contact.phones")}
								</h2>
								{primaryPhone?.isPrimary && primaryPhone.number ? (
									<Badge
										variant="outline"
										className="rounded-full border border-[#007d48]/30 bg-[#007d48]/10 px-2 py-0 text-[12px] font-medium text-[#007d48]"
									>
										Primary
									</Badge>
								) : null}
							</div>
							{phones.length === 0 ? (
								<p className="mt-3 text-[14px] font-medium text-[#707072] dark:text-[#9e9ea0]">
									{t("contact.noPhone")}
								</p>
							) : (
								<ul className="mt-4 space-y-3">
									{phones.map((p, idx) => (
										<li key={p.id ?? idx} className="flex items-start justify-between gap-3">
											<div className="min-w-0">
												<p className="text-[12px] font-medium uppercase tracking-wide text-[#707072] dark:text-[#9e9ea0]">
													{p.label || t("contact.phones")} {p.isPrimary ? " · Primary" : ""}
												</p>
												{p.number ? (
													<a
														href={`tel:${p.number.replace(/\s+/g, "")}`}
														className="mt-0.5 inline-block text-[14px] font-medium text-[#111111] hover:underline dark:text-white"
													>
														{p.number}
													</a>
												) : (
													<span className="mt-0.5 inline-block text-[14px] font-medium text-[#707072]">
														—
													</span>
												)}
											</div>
										</li>
									))}
								</ul>
							)}
						</CardContent>
					</Card>

					<Card className="rounded-[18px] border border-[#cacacb] bg-white dark:border-[#39393b] dark:bg-[#1a1a1a] p-0 gap-0">
						<CardContent className="p-6">
							<div className="flex items-center justify-between">
								<h2 className="text-[16px] font-medium text-[#111111] dark:text-white">
									{t("contact.emails")}
								</h2>
								{primaryEmail?.isPrimary && primaryEmail.email ? (
									<Badge
										variant="outline"
										className="rounded-full border border-[#007d48]/30 bg-[#007d48]/10 px-2 py-0 text-[12px] font-medium text-[#007d48]"
									>
										Primary
									</Badge>
								) : null}
							</div>
							{emails.length === 0 ? (
								<p className="mt-3 text-[14px] font-medium text-[#707072] dark:text-[#9e9ea0]">
									{t("contact.noEmail")}
								</p>
							) : (
								<ul className="mt-4 space-y-3">
									{emails.map((e, idx) => (
										<li key={e.id ?? idx}>
											<p className="text-[12px] font-medium uppercase tracking-wide text-[#707072] dark:text-[#9e9ea0]">
												{e.label || t("contact.emails")} {e.isPrimary ? " · Primary" : ""}
											</p>
											{e.email ? (
												<a
													href={`mailto:${e.email}`}
													className="mt-0.5 inline-block break-all text-[14px] font-medium text-[#111111] hover:underline dark:text-white"
												>
													{e.email}
												</a>
											) : (
												<span className="mt-0.5 inline-block text-[14px] font-medium text-[#707072]">
													—
												</span>
											)}
										</li>
									))}
								</ul>
							)}
						</CardContent>
					</Card>

					<Card className="rounded-[18px] border border-[#cacacb] bg-white dark:border-[#39393b] dark:bg-[#1a1a1a] p-0 gap-0">
						<CardContent className="p-6">
							<div className="flex items-center justify-between">
								<h2 className="text-[16px] font-medium text-[#111111] dark:text-white">
									{t("contact.addresses")}
								</h2>
								{primaryAddress?.isPrimary && primaryAddress.address ? (
									<Badge
										variant="outline"
										className="rounded-full border border-[#007d48]/30 bg-[#007d48]/10 px-2 py-0 text-[12px] font-medium text-[#007d48]"
									>
										Primary
									</Badge>
								) : null}
							</div>
							{addresses.length === 0 ? (
								<p className="mt-3 text-[14px] font-medium text-[#707072] dark:text-[#9e9ea0]">
									{t("contact.noAddress")}
								</p>
							) : (
								<ul className="mt-4 space-y-3">
									{addresses.map((a, idx) => (
										<li key={a.id ?? idx}>
											<p className="text-[12px] font-medium uppercase tracking-wide text-[#707072] dark:text-[#9e9ea0]">
												{a.label || t("contact.addresses")} {a.isPrimary ? " · Primary" : ""}
											</p>
											<p className="mt-0.5 whitespace-pre-line text-[14px] leading-[1.5] text-[#111111] dark:text-white">
												{a.address ?? "—"}
											</p>
										</li>
									))}
								</ul>
							)}
						</CardContent>
					</Card>

					<Card className="rounded-[18px] border border-[#cacacb] bg-white dark:border-[#39393b] dark:bg-[#1a1a1a] p-0 gap-0">
						<CardContent className="p-6">
							<h2 className="text-[16px] font-medium text-[#111111] dark:text-white">
								{t("contact.social")}
							</h2>
							{socialLinks.length === 0 ? (
								<p className="mt-3 text-[14px] font-medium text-[#707072] dark:text-[#9e9ea0]">
									{t("contact.noSocial")}
								</p>
							) : (
								<ul className="mt-4 flex flex-wrap gap-3">
									{socialLinks.map((s, idx) => {
										const iconUrl = getMediaUrl(s.icon);
										return (
											<li key={s.id ?? idx}>
												<a
													href={s.url}
													target="_blank"
													rel="noopener noreferrer"
													aria-label={s.name}
													className="flex h-10 items-center gap-2 rounded-full bg-[#f5f5f5] dark:bg-[#39393b] px-3 text-[#111111] dark:text-white transition-colors hover:bg-[#e5e5e5]"
												>
													{iconUrl ? (
														<img
															src={iconUrl}
															alt=""
															className="h-5 w-5 object-contain"
															width={20}
															height={20}
														/>
													) : (
														<span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[12px] font-medium text-[#111111]">
															{s.name.charAt(0).toUpperCase()}
														</span>
													)}
													<span className="text-[14px] font-medium">{s.name}</span>
												</a>
											</li>
										);
									})}
								</ul>
							)}
						</CardContent>
					</Card>
				</div>
			)}

			<p className="mt-8 rounded-[18px] border border-[#e5e5e5] dark:border-[#39393b] bg-[#f5f5f5] dark:bg-[#1a1a1a] px-4 py-3 text-[14px] font-medium leading-[1.5] text-[#707072] dark:text-[#9e9ea0]">
				{siteName} — {t("contact.social")}
			</p>
		</div>
	);
}
