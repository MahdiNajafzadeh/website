import Link from "next/link";
import { getPayload } from "payload";

import config from "@/payload.config";
import { Card, CardContent } from "@/components/ui/card";
import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";
import type { Category } from "@/payload-types";
import { t, tFmt } from "@/lib/t";

export const dynamic = "force-dynamic";

type SearchParams = {
	page?: string;
	q?: string;
};

function buildPageHref(
	base: SearchParams & { page?: number | string },
	overrides: Partial<Record<string, string | undefined>>,
) {
	const params = new URLSearchParams();
	const merged: Record<string, string | undefined> = {
		q: base.q,
		page: base.page ? String(base.page) : undefined,
		...overrides,
	};
	for (const [k, v] of Object.entries(merged)) {
		if (v && v !== "") params.set(k, v);
	}
	const qs = params.toString();
	return qs ? `/categories?${qs}` : "/categories";
}

export default async function CategoriesPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
	const sp = await searchParams;
	const q = sp.q?.trim() ?? "";
	const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
	const limit = 12;

	const payloadConfig = await config;
	const payload = await getPayload({ config: payloadConfig });

	const where: Record<string, unknown> | undefined = q ? { name: { like: q } } : undefined;

	const res = await payload.find({
		collection: "categories",
		where: where as never,
		sort: "name",
		limit,
		page,
		pagination: true,
		depth: 0,
	});

	const categories = res.docs as Category[];
	const totalPages = res.totalPages ?? 1;
	const totalDocs = res.totalDocs ?? categories.length;

	return (
		<div className="mx-auto max-w-[1440px] px-4 py-8 md:px-8">
			<nav
				className="mb-6 flex items-center gap-1.5 text-sm text-[#707072] dark:text-[#9e9ea0]"
				aria-label="Breadcrumb"
			>
				<Link href="/" className="hover:text-[#111111] dark:hover:text-white">
					{t("common.home")}
				</Link>
				<span aria-hidden>/</span>
				<span className="font-medium text-[#111111] dark:text-white">{t("categories.title")}</span>
			</nav>

			<h1 className="text-[32px] font-medium leading-[1.2] text-[#111111] dark:text-white">
				{t("categories.title")}
			</h1>
			<p className="mt-1 text-[14px] font-medium text-[#707072] dark:text-[#9e9ea0]">
				{totalDocs.toLocaleString("fa-IR")} {t("common.categories")}
			</p>

			<form action="/categories" method="get" className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
				<div className="flex flex-1 items-center gap-2">
					<input
						name="q"
						defaultValue={q}
						placeholder={t("categories.searchPlaceholder")}
						className="h-10 w-full max-w-md rounded-[24px] bg-[#f5f5f5] px-4 text-[16px] font-normal text-[#111111] placeholder:text-[#707072] outline-none ring-1 ring-transparent focus:bg-white focus:ring-[#111111] dark:bg-[#39393b] dark:text-white dark:placeholder:text-[#9e9ea0] dark:focus:bg-[#1a1a1a]"
					/>
					<button
						type="submit"
						className="inline-flex h-10 items-center justify-center rounded-full bg-[#111111] px-6 text-[14px] font-medium text-white hover:bg-[#111111]/90 dark:bg-white dark:text-[#111111] dark:hover:bg-[#e5e5e5]"
					>
						{t("products.searchAction")}
					</button>
				</div>
				{q && (
					<Link
						href="/categories"
						className="text-[14px] font-medium text-[#707072] underline hover:text-[#111111] dark:text-[#9e9ea0] dark:hover:text-white"
					>
						{t("products.clearAll")}
					</Link>
				)}
			</form>

			{categories.length === 0 ? (
				<div className="mt-8 rounded-[30px] bg-[#f5f5f5] p-12 text-center dark:bg-[#1a1a1a]">
					<p className="text-[16px] font-medium text-[#111111] dark:text-white">
						{t("categories.noCategories")}
					</p>
					<p className="mt-1 text-[14px] font-medium text-[#707072] dark:text-[#9e9ea0]">
						{t("common.noProductsHint")}
					</p>
					<Link
						href="/products"
						className="mt-4 inline-flex rounded-full bg-[#111111] px-6 py-2 text-[14px] font-medium text-white dark:bg-white dark:text-[#111111]"
					>
						{t("common.viewAll")}
					</Link>
				</div>
			) : (
				<div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
					{categories.map((cat) => (
						<Link key={cat.id} href={`/products?category=${cat.slug}`} className="group">
							<Card className="overflow-hidden rounded-[30px] border border-[#e5e5e5] p-0 hover:border-[#cacacb] dark:border-[#39393b] dark:bg-[#1a1a1a] transition-colors">
								<div className="flex aspect-[4/3] flex-col items-center justify-center gap-3 bg-[#f5f5f5] p-6 dark:bg-[#111111]">
									<div className="flex size-16 items-center justify-center rounded-full bg-white text-[20px] font-medium text-[#111111] ring-1 ring-[#e5e5e5]">
										{cat.name.charAt(0).toUpperCase()}
									</div>
									<span className="line-clamp-2 text-center text-[16px] font-medium leading-[1.5] text-[#111111] dark:text-white">
										{cat.name}
									</span>
									{cat.description && (
										<span className="line-clamp-2 text-center text-[12px] font-medium text-[#707072] dark:text-[#9e9ea0]">
											{cat.description}
										</span>
									)}
								</div>
								<CardContent className="p-3 text-center">
									<span className="text-[12px] font-medium text-[#707072] group-hover:text-[#111111] dark:text-[#9e9ea0] dark:group-hover:text-white">
										{t("categories.viewProducts")}
									</span>
								</CardContent>
							</Card>
						</Link>
					))}
				</div>
			)}

			{totalPages > 1 && (
				<div className="mt-8">
					<Pagination>
						<PaginationContent>
							{page > 1 && (
								<PaginationItem>
									<PaginationPrevious
										href={buildPageHref({ q, page: String(page) }, { page: String(page - 1) })}
									/>
								</PaginationItem>
							)}
							{Array.from({ length: totalPages }, (_, i) => i + 1)
								.filter((p) => {
									if (totalPages <= 7) return true;
									if (p === 1 || p === totalPages) return true;
									if (Math.abs(p - page) <= 1) return true;
									if (page <= 3 && p <= 4) return true;
									if (page >= totalPages - 2 && p >= totalPages - 3) return true;
									return false;
								})
								.reduce<(number | "ellipsis")[]>((acc, p, idx, arr) => {
									const prev = arr[idx - 1];
									if (
										prev !== undefined &&
										typeof p === "number" &&
										typeof prev === "number" &&
										p - prev > 1
									)
										acc.push("ellipsis");
									acc.push(p);
									return acc;
								}, [])
								.map((p, idx) =>
									p === "ellipsis" ? (
										<PaginationItem key={`e-${idx}`}>
											<PaginationEllipsis />
										</PaginationItem>
									) : (
										<PaginationItem key={p}>
											<PaginationLink
												href={buildPageHref({ q, page: String(page) }, { page: String(p) })}
												isActive={p === page}
											>
												{p}
											</PaginationLink>
										</PaginationItem>
									),
								)}
							{page < totalPages && (
								<PaginationItem>
									<PaginationNext
										href={buildPageHref({ q, page: String(page) }, { page: String(page + 1) })}
									/>
								</PaginationItem>
							)}
						</PaginationContent>
					</Pagination>
					<p className="mt-3 text-center text-[12px] font-medium text-[#707072] dark:text-[#9e9ea0]">
						{tFmt("categories.pagination", {
							page: page.toLocaleString("fa-IR"),
							totalPages: totalPages.toLocaleString("fa-IR"),
							count: totalDocs.toLocaleString("fa-IR"),
						})}
					</p>
				</div>
			)}
		</div>
	);
}
