import type { ReactNode } from "react";

export function PageContainer({ children, className }: { children: ReactNode; className?: string }) {
	return (
		<div className={`mx-auto max-w-[1440px] px-4 py-8 md:px-8 ${className ?? ""}`.trim()}>{children}</div>
	);
}