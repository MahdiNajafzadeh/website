import locale from "./locale";

export type Locale = typeof locale;
export type LocaleKey = keyof Locale;
export type Placeholders<T extends string> = T extends `${string}{${infer P}}${infer R}` ? P | Placeholders<R> : never;
export type Vars<T extends string> = Placeholders<T> extends never ? never : Record<Placeholders<T>, string | number>;

export function t<K extends LocaleKey>(
	key: K,
	...args: Placeholders<Locale[K]> extends never ? [] : [vars: Vars<Locale[K]>]
): string {
	let text = locale[key] as string;
	const vars = (args[0] ?? {}) as Record<string, string | number>;
	for (const [k, v] of Object.entries(vars)) text = text.replaceAll(`{${k}}`, String(v));
	return text;
}
