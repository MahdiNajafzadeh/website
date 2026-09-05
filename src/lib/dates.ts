export type DateLocale = "fa-IR" | "en-US";
export type DatePreset = "long" | "short" | "datetime";

const PRESETS: Record<DatePreset, Intl.DateTimeFormatOptions> = {
	long: { year: "numeric", month: "long", day: "numeric" },
	short: { year: "numeric", month: "short", day: "numeric" },
	datetime: { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" },
};

export function formatDate(
	dateString: string | null | undefined,
	opts: { locale?: DateLocale; preset?: DatePreset } = {},
): string {
	if (!dateString) return "";
	try {
		return new Date(dateString).toLocaleDateString(opts.locale ?? "en-US", PRESETS[opts.preset ?? "long"]);
	} catch {
		return dateString;
	}
}