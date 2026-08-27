import { getTranslator } from "@/lib/i18n";
import type { Locale } from "@/lib/locale";

const LOCALE_TAG: Record<Locale, string> = {
    fa: "fa-IR",
    en: "en-US",
};

const ORDER_STATUS_KEYS: Record<string, string> = {
    pending: "employee.orders.status.pending",
    processing: "employee.orders.status.processing",
    shipped: "employee.orders.status.shipped",
    delivered: "employee.orders.status.delivered",
    cancelled: "employee.orders.status.cancelled",
};

export const formatNumber = (n: number, locale: Locale): string => new Intl.NumberFormat(LOCALE_TAG[locale]).format(n);

export const formatPrice = (amount: number, locale: Locale): string =>
    `${formatNumber(amount, locale)} ${locale === "fa" ? "تومان" : "Toman"}`;

export const formatPriceToman = (amount: number, locale: Locale): string => formatPrice(amount, locale);

export type FormatDateOptions = Intl.DateTimeFormatOptions;

export const formatDate = (
    value: string | number | Date,
    locale: Locale,
    opts: FormatDateOptions = { dateStyle: "medium", timeStyle: "short" },
): string => {
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return new Intl.DateTimeFormat(LOCALE_TAG[locale], opts).format(date);
};

export const formatOrderStatus = (status: string | null | undefined, locale: Locale): string => {
    const { t } = getTranslator(locale);
    if (!status) return t("employee.orders.status.unknown");
    const key = ORDER_STATUS_KEYS[status];
    if (!key) return t("employee.orders.status.unknown");
    return t(key);
};
