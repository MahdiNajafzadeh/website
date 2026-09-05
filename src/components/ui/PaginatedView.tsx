import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";
import { t } from "@/lib/t";

export function PaginatedView({
	page,
	totalPages,
	buildHref,
	paginationLabel,
}: {
	page: number;
	totalPages: number;
	buildHref: (page: number) => string;
	paginationLabel?: {
		templateKey: "products.pagination" | "categories.pagination" | "blog.pagination";
		count?: number;
		totalDocs?: number;
	};
}) {
	if (totalPages <= 1) return null;
	return (
		<div className="mt-8">
			<Pagination>
				<PaginationContent>
					{page > 1 && (
						<PaginationItem>
							<PaginationPrevious href={buildHref(page - 1)} />
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
									<PaginationLink href={buildHref(p)} isActive={p === page}>
										{p}
									</PaginationLink>
								</PaginationItem>
							),
						)}
					{page < totalPages && (
						<PaginationItem>
							<PaginationNext href={buildHref(page + 1)} />
						</PaginationItem>
					)}
				</PaginationContent>
			</Pagination>
			{paginationLabel ? (
				<p className="mt-3 text-center text-[12px] font-medium text-[#707072] dark:text-[#9e9ea0]">
					{t(paginationLabel.templateKey, {
						page: page.toLocaleString("fa-IR"),
						totalPages: totalPages.toLocaleString("fa-IR"),
						count: paginationLabel.count?.toLocaleString("fa-IR") ?? "",
						totalDocs: paginationLabel.totalDocs?.toLocaleString("fa-IR") ?? "",
					})}
				</p>
			) : null}
		</div>
	);
}