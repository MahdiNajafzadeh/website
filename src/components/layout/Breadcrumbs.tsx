import Link from "next/link";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { t } from "@/lib/t";

export type Crumb = { href?: string; label: string };

export function Breadcrumbs({
	crumbs,
	separatorKey = "common.breadcrumbSeparator",
}: {
	crumbs: Crumb[];
	separatorKey?: "common.breadcrumbSeparator" | "common.breadcrumbSeparatorSlash";
}) {
	return (
		<Breadcrumb aria-label="Breadcrumb">
			<BreadcrumbList className="mb-6 flex items-center gap-1.5 text-sm text-[#707072] dark:text-[#9e9ea0]">
				{crumbs.map((crumb, idx) => {
					const isLast = idx === crumbs.length - 1;
					return (
						<BreadcrumbItem key={`${crumb.label}-${idx}`}>
							{!isLast && crumb.href ? (
								<>
									<BreadcrumbLink
										render={(linkProps) => (
											<Link
												href={crumb.href ?? "#"}
												className="hover:text-[#111111] dark:hover:text-white"
												{...linkProps}
											>
												{crumb.label}
											</Link>
										)}
									/>
									<BreadcrumbSeparator>{t(separatorKey)}</BreadcrumbSeparator>
								</>
							) : (
								<BreadcrumbPage className="font-medium text-[#111111] dark:text-white">
									{crumb.label}
								</BreadcrumbPage>
							)}
						</BreadcrumbItem>
					);
				})}
			</BreadcrumbList>
		</Breadcrumb>
	);
}