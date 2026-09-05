import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { EmptyState } from "@/components/ui/EmptyState";
import { InitialsAvatar } from "@/components/ui/InitialsAvatar";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import type { Brand, Media } from "@/payload-types";
import { t } from "@/lib/t";
import { getMediaUrl } from "@/lib/media";
import { getPayloadClient } from "@/lib/payload";

export const dynamic = "force-dynamic";

export default async function BrandsPage() {
	const payload = await getPayloadClient();

	const res = await payload.find({
		collection: "brands",
		limit: 100,
		sort: "name",
		depth: 1,
	});

	const brands = res.docs as Brand[];

	return (
		<PageContainer>
			<Breadcrumbs
				crumbs={[{ href: "/", label: t("common.home") }, { label: t("brands.title") }]}
				separatorKey="common.breadcrumbSeparatorSlash"
			/>

			<PageHeader title={t("brands.title")} count={brands.length} countLabel={t("common.brands")} />

			{brands.length === 0 ? (
				<EmptyState title={t("brands.noBrands")} />
			) : (
				<div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
					{brands.map((brand) => {
						const iconUrl = getMediaUrl(brand.icon as Media | number | null | undefined);
						return (
							<Link key={brand.id} href={`/brands/${brand.slug}`} className="group">
								<Card className="overflow-hidden rounded-[30px] border border-[#e5e5e5] dark:border-[#39393b] dark:bg-[#1a1a1a] p-0 hover:border-[#cacacb] transition-colors">
									<div className="flex flex-col items-center gap-3 bg-[#f5f5f5] dark:bg-[#111111] p-6 aspect-[4/3] justify-center">
										{iconUrl ? (
											// eslint-disable-next-line @next/next/no-img-element
											<img
												src={iconUrl}
												alt={brand.name}
												className="size-16 rounded-full object-cover bg-white ring-1 ring-[#e5e5e5]"
											/>
										) : (
											<InitialsAvatar name={brand.name} size="lg" />
										)}
										<span className="text-center text-[16px] font-medium leading-[1.5] text-[#111111] dark:text-white line-clamp-2">
											{brand.name}
										</span>
									</div>
									<CardContent className="p-3 text-center">
										<span className="text-[12px] font-medium text-[#707072] group-hover:text-[#111111] dark:text-[#9e9ea0] dark:group-hover:text-white">
											{t("brands.viewProducts")}
										</span>
									</CardContent>
								</Card>
							</Link>
						);
					})}
				</div>
			)}
		</PageContainer>
	);
}
