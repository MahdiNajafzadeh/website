import Link from "next/link";
import type { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { getSiteSettings } from "@/lib/site-settings";
import { formatPriceNumber } from "@/lib/pricing";
import { formatDate } from "@/lib/dates";
import { getPayloadClient } from "@/lib/payload";
import { requireUser } from "@/lib/auth-guard";
import type { Order } from "@/payload-types";
import { STATUS_LABELS, statusTone } from "@/lib/orders";
import { t } from "@/lib/t";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
    const settings = await getSiteSettings();
    const siteName = settings.name || "store";
    return {
        title: `Orders | ${siteName}`,
        description: `Your order history at ${siteName}.`,
    };
}

export default async function OrdersPage() {
    const user = await requireUser("/orders");

    const payload = await getPayloadClient();

    const res = await payload.find({
        collection: "orders",
        where: { customer: { equals: user.id } },
        depth: 0,
        limit: 50,
        sort: "-createdAt",
        overrideAccess: false,
    });

    const orders = res.docs as Order[];
    const totalOrders = res.totalDocs ?? orders.length;

    return (
        <PageContainer>
            <Breadcrumbs
                crumbs={[
                    { href: "/", label: t("common.home") },
                    { href: "/account", label: t("account.title") },
                    { label: t("orders.title") },
                ]}
                separatorKey="common.breadcrumbSeparator"
            />

            <PageHeader
                title={t("orders.title")}
                count={totalOrders}
                countLabel={t("common.productsCount")}
            />

            {orders.length === 0 ? (
                <EmptyState
                    title={t("orders.empty")}
                    hint={t("orders.empty")}
                    actionLabel={t("orders.browseProducts")}
                    actionHref="/products"
                />
            ) : (
                <>
                    {/* Mobile — cards */}
                    <div className="mt-8 grid gap-3 md:hidden">
                        {orders.map((order) => {
                            const tone = statusTone(order.status);
                            return (
                                <Link key={order.id} href={`/orders/${order.id}`}>
                                    <Card className="rounded-[18px] border border-[#e5e5e5] bg-white p-0 gap-0 transition-colors hover:border-[#cacacb]">
                                        <CardContent className="flex flex-col gap-2 p-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[12px] font-medium uppercase tracking-wide text-[#707072]">
                                                    {t("orders.orderNumber", { id: String(order.id) })}
                                                </span>
                                                <Badge
                                                    variant="outline"
                                                    className={`${tone.bg} ${tone.text} ${tone.border} rounded-full border px-2 py-0 text-[12px] font-medium`}
                                                >
                                                    {STATUS_LABELS[order.status]}
                                                </Badge>
                                            </div>
                                            <p className="text-[14px] font-medium text-[#111111]">
                                                {t("orders.priceWithToman", {
                                                    price: formatPriceNumber(order.total ?? 0, "fa-IR"),
                                                    toman: t("common.toman"),
                                                })}
                                            </p>
                                            <p className="text-[12px] font-medium text-[#707072]">
                                                {t("orders.dateWithItems", {
                                                    date: formatDate(order.createdAt, { locale: "fa-IR", preset: "short" }),
                                                    count: String(order.items?.length ?? 0),
                                                    label: t(
                                                        (order.items?.length ?? 0) === 1
                                                            ? "orders.itemSingular"
                                                            : "orders.itemPlural",
                                                    ),
                                                })}
                                            </p>
                                            {order.hasZeroPrice ? (
                                                <span className="text-[12px] font-medium text-[#d30005]">
                                                    {t("cart.partnerDiscountApplied", { discount: 0 })}
                                                </span>
                                            ) : null}
                                        </CardContent>
                                    </Card>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Desktop — shadcn Table */}
                    <div className="mt-8 hidden overflow-hidden rounded-[18px] border border-[#cacacb] md:block">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-[12px] font-medium uppercase tracking-wide text-[#707072]">
                                        {t("orders.tableOrder")}
                                    </TableHead>
                                    <TableHead className="text-[12px] font-medium uppercase tracking-wide text-[#707072]">
                                        {t("orders.tableDate")}
                                    </TableHead>
                                    <TableHead className="text-[12px] font-medium uppercase tracking-wide text-[#707072]">
                                        {t("orders.tableStatus")}
                                    </TableHead>
                                    <TableHead className="text-right text-[12px] font-medium uppercase tracking-wide text-[#707072]">
                                        {t("orders.tableItems")}
                                    </TableHead>
                                    <TableHead className="text-right text-[12px] font-medium uppercase tracking-wide text-[#707072]">
                                        {t("orders.tableTotal")}
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {orders.map((order) => {
                                    const tone = statusTone(order.status);
                                    return (
                                        <TableRow key={order.id}>
                                            <TableCell>
                                                <Link
                                                    href={`/orders/${order.id}`}
                                                    className="text-[14px] font-medium text-[#111111] hover:underline"
                                                >
                                                    {t("orders.orderHash", { id: String(order.id) })}
                                                </Link>
                                            </TableCell>
                                            <TableCell className="text-[14px] text-[#707072]">
                                                {formatDate(order.createdAt, { locale: "fa-IR", preset: "short" })}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="outline"
                                                    className={`${tone.bg} ${tone.text} ${tone.border} rounded-full border px-2 py-0 text-[12px] font-medium`}
                                                >
                                                    {STATUS_LABELS[order.status]}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right text-[14px] text-[#707072]">
                                                {order.items?.length ?? 0}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <span
                                                    className={`text-[14px] font-medium ${order.hasZeroPrice ? "text-[#d30005]" : "text-[#111111]"}`}
                                                >
                                                    {t("orders.priceWithToman", {
                                                        price: formatPriceNumber(order.total ?? 0, "fa-IR"),
                                                        toman: t("common.toman"),
                                                    })}
                                                </span>
                                                {order.hasZeroPrice ? (
                                                    <span className="ml-2 text-[12px] font-medium text-[#d30005]">
                                                        {t("common.toman")}
                                                    </span>
                                                ) : null}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </>
            )}
        </PageContainer>
    );
}
