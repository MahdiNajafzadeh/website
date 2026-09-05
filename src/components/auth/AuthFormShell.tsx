"use client";

import { Suspense, type ReactNode } from "react";
import { t } from "@/lib/t";

export function AuthFormShell({
	children,
	verticalPadding = "py-12",
}: {
	children: ReactNode;
	verticalPadding?: "py-10" | "py-12";
}) {
	return (
		<Suspense
			fallback={
				<div
					className={`min-h-[70vh] flex items-center justify-center bg-white dark:bg-[#111111] px-4 ${verticalPadding}`}
				>
					<p className="text-sm text-[#707072] dark:text-[#9e9ea0]">{t("auth.loading")}</p>
				</div>
			}
		>
			{children}
		</Suspense>
	);
}