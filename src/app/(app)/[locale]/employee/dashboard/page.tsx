import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth-server";
import { formatNumber, formatOrderStatus, formatPriceToman } from "@/lib/format";
import type { Locale } from "@/lib/locale";
import { ensureLocale, localeHref } from "@/lib/locale";
import { getTranslator } from "@/lib/i18n";
import { getPayload } from "payload";
import config from "@payload-config";

type Params = Promise<{ locale: string }>;

export async function generateMetadata({ params }: { params: Params }) {
    const rawLocale = (await params).locale;
    const locale: Locale = ensureLocale(rawLocale);
    const { t } = getTranslator(locale);
    return {
        title: t("employee.dashboard.metaTitle"),
    };
}

export default async function EmployeeDashboardPage(props: { params: Params }) {
    const locale: Locale = ensureLocale((await props.params).locale);
    const { t } = getTranslator(locale);
    const me = await requireRole(["employee", "admin"], localeHref(locale, "/employee/dashboard"));
    const payload = await getPayload({ config });

    const [pending, processing, todayUsers, lowStock] = await Promise.all([
        payload.count({ collection: "orders", where: { status: { equals: "pending" } } }),
        payload.count({ collection: "orders", where: { status: { equals: "processing" } } }),
        payload.count({ collection: "users" }),
        payload.find({
            collection: "products",
            where: { stock: { less_than_equal: 5 } },
            limit: 10,
            sort: "stock",
            locale,
        }),
    ]);

    const recentOrders = await payload.find({
        collection: "orders",
        limit: 5,
        sort: "-createdAt",
        depth: 1,
        locale,
    });

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="mb-2 text-3xl font-bold">{t("employee.dashboard.title")}</h1>
            <p className="mb-6 text-sm text-muted-foreground">
                {t("employee.dashboard.greeting", {
                    name: [me.firstName, me.lastName].filter(Boolean).join(" ").trim() || me.email,
                })}
            </p>

            <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm">{t("employee.dashboard.metric.pending")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold tabular-nums">{formatNumber(pending.totalDocs, locale)}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm">{t("employee.dashboard.metric.processing")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold tabular-nums">{formatNumber(processing.totalDocs, locale)}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm">{t("employee.dashboard.metric.customers")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold tabular-nums">{formatNumber(todayUsers.totalDocs, locale)}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm">{t("employee.dashboard.metric.lowStock")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold tabular-nums">{formatNumber(lowStock.totalDocs, locale)}</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>{t("employee.dashboard.recentOrders")}</CardTitle>
                        <Link
                            href={localeHref(locale, "/employee/orders")}
                            className="text-xs text-muted-foreground hover:text-foreground"
                        >
                            {t("employee.dashboard.recentOrders.viewAll")}
                        </Link>
                    </CardHeader>
                    <CardContent>
                        {recentOrders.docs.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                {t("employee.dashboard.recentOrders.empty")}
                            </p>
                        ) : (
                            <ul className="space-y-2 text-sm">
                                {recentOrders.docs.map((o) => (
                                    <li key={o.id} className="flex items-center justify-between rounded-md border p-2">
                                        <span>#{o.id}</span>
                                        <span>{formatPriceToman(o.total, locale)}</span>
                                        <span className="text-xs text-muted-foreground">
                                            {formatOrderStatus(o.status, locale)}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>{t("employee.dashboard.lowStock")}</CardTitle>
                        <Link
                            href={localeHref(locale, "/employee/customers")}
                            className="text-xs text-muted-foreground hover:text-foreground"
                        >
                            {t("employee.dashboard.lowStock.manageCustomers")}
                        </Link>
                    </CardHeader>
                    <CardContent>
                        {lowStock.docs.length === 0 ? (
                            <p className="text-sm text-muted-foreground">{t("employee.dashboard.lowStock.empty")}</p>
                        ) : (
                            <ul className="space-y-2 text-sm">
                                {lowStock.docs.map((p) => (
                                    <li key={p.id} className="flex items-center justify-between rounded-md border p-2">
                                        <span className="line-clamp-1">{p.name}</span>
                                        <span className="text-xs text-destructive">
                                            {t("employee.dashboard.lowStockLine", { count: p.stock ?? 0 })}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
