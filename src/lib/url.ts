export function parsePageParam(raw: string | undefined): number {
	return Math.max(1, parseInt(raw ?? "1", 10) || 1);
}

export function buildPageHref(
	path: string,
	base: Record<string, string | undefined>,
	overrides: Partial<Record<string, string | undefined>>,
): string {
	const params = new URLSearchParams();
	const merged: Record<string, string | undefined> = { ...base, ...overrides };
	for (const [k, v] of Object.entries(merged)) {
		if (v && v !== "") params.set(k, v);
	}
	const qs = params.toString();
	return qs ? `${path}?${qs}` : path;
}