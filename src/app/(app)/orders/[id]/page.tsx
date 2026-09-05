import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { PageContainer } from "@/components/layout/PageContainer";
import { getSiteSettings } from "@/lib/site-settings";
import { formatPriceNumber } from "@/lib/pricing";
import { formatDate } from "@/lib/dates";
import { getPayloadClient } from "@/lib/payload";
import { requireUser } from "@/lib/auth-guard";
import { statusTone, STATUS_HISTORY } from "@/lib/orders";
import { userDisplayName } from "@/lib/users";
import type { Order, User } from "@/payload-types";
import { t } from "@/lib/t";

export const dynamic = "force-dynamic";

type RouteParams = { id: string };

const STATUS_LABELS: Record<Order["status"], string> = {
    review: "Review",
    approved: "Approved",
    preparing: "Preparing",
    delivered: "Delivered",
    cancelled: "Cancelled",
};

function customerLabel(c: Order["customer"]): string {
    return userDisplayName(c);
}

function noteAuthor(author: number | User | null | undefined): string {
    return "Staff " + userDisplayName(author);
}

export async function generateMetadata({ params }: { params: Promise<RouteParams> }): Promise<Metadata> {
    const { id } = await params;
    const settings = await getSiteSettings();
    const siteName = settings.name;
    return {
        title: `Order #${id} | ${siteName}`,
        description: `Order details from ${siteName}.`,
    };
}

async function fetchOrder(id: number, userId: number): Promise<Order | null> {
    try {
        const payload = await getPayloadClient();
        const order = (await payload.findByID({
            collection: "orders",
            id,
            depth: 1,
            overrideAccess: false,
        })) as Order | null;
        if (!order) return null;
        // Defense-in-depth: enforce ownership at the page layer even though the
        // collection's `read` access already restricts to own orders.
        const ownerId = typeof order.customer === "number" ? order.customer : (order.customer as User)?.id;
        if (ownerId !== userId) return null;
        return order;
    } catch {
        return null;
    }
}

export default async function OrderDetailPage({ params }: { params: Promise<RouteParams> }) {
    const user = await requireUser("/orders");

    const { id } = await params;
    const numericId = parseInt(id, 10);
    if (!Number.isFinite(numericId) || numericId <= 0) notFound();

    const order = await fetchOrder(numericId, user.id);
    if (!order) notFound();

    const tone = statusTone(order.status);
    const reachedIndex = STATUS_HISTORY.indexOf(order.status);
    const isCancelled = order.status === "cancelled";

    return (
        <PageContainer>
            {/* Breadcrumb — {typography.caption-md} 14px/500, {colors.mute} #707072 */}
            <Breadcrumbs
                crumbs={[
                    { href: "/", label: t("common.home") },
                    { href: "/account", label: t("account.title") },
                    { href: "/orders", label: t("orders.title") },
                    { label: t("orders.orderHash", { id: String(order.id) }) },
                ]}
                separatorKey="common.breadcrumbSeparator"
            />

            <div className="flex flex-wrap items-center justify-between gap-3">
                {/* Title — {typography.heading-xl} 32px/500, {colors.ink} #111111 */}
                <h1 className="text-[32px] font-medium leading-[1.2] text-[#111111]">{t("orders.orderNumber", { id: String(order.id) })}</h1>
                <Badge
                    variant="outline"
                    className={`${tone.bg} ${tone.text} ${tone.border} rounded-full border px-3 py-0.5 text-[12px] font-medium`}
                >
                    {STATUS_LABELS[order.status]}
                </Badge>
            </div>
            <p className="mt-1 text-[14px] font-medium text-[#707072]">{t("orders.placedWithDate", { date: formatDate(order.createdAt, { locale: "en-US", preset: "datetime" }) })}</p>

            {order.hasZeroPrice ? (
                <div className="mt-4 rounded-[18px] border border-[#d30005]/30 bg-[#d30005]/5 p-4 text-[14px] font-medium text-[#d30005]">
                    {t("orders.zeroPriceNote")}
                </div>
            ) : null}

            <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
                {/* Left column — items + history + notes */}
                <div className="space-y-6">
                    {/* Items — {component.product-card} inspired, {colors.soft-cloud} stage */}
                    <Card className="rounded-[18px] border border-[#cacacb] bg-white p-0 gap-0">
                        <CardContent className="p-6">
                            <h2 className="text-[16px] font-medium text-[#111111]">{t("orders.tableItems")}</h2>
                            <ul className="mt-4 divide-y divide-[#e5e5e5]">
                                {(order.items ?? []).map((item, idx) => {
                                    const isZero = item.price === 0;
                                    return (
                                        <li
                                            key={item.id ?? idx}
                                            className="flex items-center justify-between gap-4 py-3"
                                        >
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-[14px] font-medium text-[#111111]">
                                                    {item.name ?? t("orders.orderNumber", { id: String(item.product ?? t("common.dash")) })}
                                                </p>
                                                <p className="mt-0.5 text-[12px] font-medium text-[#707072]">
                                                    {t("orders.qtyLine", {
                                                        qty: String(item.quantity),
                                                        price: formatPriceNumber(item.price, "en-US"),
                                                        toman: t("common.toman"),
                                                    })}
                                                </p>
                                            </div>
                                            <span
                                                className={`shrink-0 text-[14px] font-medium ${isZero ? "text-[#d30005]" : "text-[#111111]"
                                                    }`}
                                            >
                                                {t("orders.priceWithToman", {
                                                    price: formatPriceNumber(item.price * item.quantity, "en-US"),
                                                    toman: t("common.toman"),
                                                })}
                                            </span>
                                        </li>
                                    );
                                })}
                            </ul>
                            <div className="mt-4 flex items-center justify-between border-t border-[#e5e5e5] pt-4">
                                <span className="text-[16px] font-medium text-[#111111]">{t("orders.tableTotal")}</span>
                                <span
                                    className={`text-[16px] font-medium ${order.hasZeroPrice ? "text-[#d30005]" : "text-[#111111]"
                                        }`}
                                >
                                    {t("orders.priceWithToman", {
                                        price: formatPriceNumber(order.total ?? 0, "en-US"),
                                        toman: t("common.toman"),
                                    })}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Status history — linear progression, marked current/cancelled */}
                    <Card className="rounded-[18px] border border-[#cacacb] bg-white p-0 gap-0">
                        <CardContent className="p-6">
                            <h2 className="text-[16px] font-medium text-[#111111]">{t("orders.statusLabel")}</h2>
                            <ol className="mt-4 flex flex-wrap items-center gap-2">
                                {STATUS_HISTORY.map((s, idx) => {
                                    const isReached = !isCancelled && idx <= reachedIndex;
                                    const isCurrent = !isCancelled && idx === reachedIndex;
                                    return (
                                        <li key={s} className="flex items-center gap-2">
                                            <span
                                                className={`inline-flex h-7 items-center rounded-full border px-3 text-[12px] font-medium ${isReached
                                                        ? "border-[#007d48]/30 bg-[#007d48]/10 text-[#007d48]"
                                                        : "border-[#cacacb] bg-[#f5f5f5] text-[#707072]"
                                                    }`}
                                            >
                                                {STATUS_LABELS[s]}
                                                {isCurrent ? t("orders.currentSuffix") : ""}
                                            </span>
                                            {idx < STATUS_HISTORY.length - 1 ? (
                                                <span aria-hidden className="text-[#9e9ea0]">
                                                    {t("common.breadcrumbSeparator")}
                                                </span>
                                            ) : null}
                                        </li>
                                    );
                                })}
                                {isCancelled ? (
                                    <li className="flex items-center gap-2">
                                        <span className="text-[#9e9ea0]">{t("common.dot")}</span>
                                        <span className="inline-flex h-7 items-center rounded-full border border-[#d30005]/30 bg-[#d30005]/10 px-3 text-[12px] font-medium text-[#d30005]">
                                            {t("orders.status.cancelled")}
                                        </span>
                                    </li>
                                ) : null}
                            </ol>
                        </CardContent>
                    </Card>

                    {/* Admin notes — only shown if any */}
                    {order.notes && order.notes.length > 0 ? (
                        <Card className="rounded-[18px] border border-[#cacacb] bg-white p-0 gap-0">
                            <CardContent className="p-6">
                                <h2 className="text-[16px] font-medium text-[#111111]">{t("orders.updates")}</h2>
                                <ul className="mt-4 space-y-3">
                                    {order.notes.map((n, idx) => (
                                        <li
                                            key={n.id ?? idx}
                                            className="rounded-[18px] border border-[#e5e5e5] bg-[#f5f5f5] p-3"
                                        >
                                            <p className="text-[12px] font-medium text-[#707072]">
                                                {t("orders.dateWithItems", {
                                                    date: noteAuthor(n.createdBy),
                                                    count: formatDate(n.createdAt ?? order.updatedAt, { locale: "en-US", preset: "datetime" }),
                                                    label: "",
                                                })}
                                            </p>
                                            <p className="mt-1 whitespace-pre-line text-[14px] leading-[1.5] text-[#111111]">
                                                {n.note}
                                            </p>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    ) : null}
                </div>

                {/* Right column — meta */}
                <aside className="space-y-6">
                    <Card className="rounded-[18px] border border-[#cacacb] bg-white p-0 gap-0">
                        <CardContent className="p-6">
                            <h2 className="text-[16px] font-medium text-[#111111]">{t("orders.details")}</h2>
                            <dl className="mt-4 space-y-3 text-[14px]">
                                <div>
                                    <dt className="text-[12px] font-medium uppercase tracking-wide text-[#707072]">
                                        {t("orders.customer")}
                                    </dt>
                                    <dd className="mt-0.5 text-[#111111]">{customerLabel(order.customer)}</dd>
                                </div>
                                <div>
                                    <dt className="text-[12px] font-medium uppercase tracking-wide text-[#707072]">
                                        {t("orders.orderId")}
                                    </dt>
                                    <dd className="mt-0.5 text-[#111111]">{t("orders.orderHash", { id: String(order.id) })}</dd>
                                </div>
                                <div>
                                    <dt className="text-[12px] font-medium uppercase tracking-wide text-[#707072]">
                                        {t("orders.placedLabel")}
                                    </dt>
                                    <dd className="mt-0.5 text-[#111111]">{formatDate(order.createdAt, { locale: "en-US", preset: "datetime" })}</dd>
                                </div>
                                <div>
                                    <dt className="text-[12px] font-medium uppercase tracking-wide text-[#707072]">
                                        {t("orders.lastUpdate")}
                                    </dt>
                                    <dd className="mt-0.5 text-[#111111]">{formatDate(order.updatedAt, { locale: "en-US", preset: "datetime" })}</dd>
                                </div>
                            </dl>
                        </CardContent>
                    </Card>

                    {order.shippingAddress ? (
                        <Card className="rounded-[18px] border border-[#cacacb] bg-white p-0 gap-0">
                            <CardContent className="p-6">
                                <h2 className="text-[16px] font-medium text-[#111111]">{t("orders.shippingAddress")}</h2>
                                <p className="mt-3 whitespace-pre-line text-[14px] leading-[1.5] text-[#111111]">
                                    {order.shippingAddress}
                                </p>
                            </CardContent>
                        </Card>
                    ) : null}
                </aside>
            </div>
        </PageContainer>
    );
}
