import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getPayload } from "payload";
import type { Metadata } from "next";
import config from "@/payload.config";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCurrentUser } from "@/lib/current-user";
import { getSiteSettings } from "@/lib/site-settings";
import { formatPriceNumber } from "@/lib/pricing";
import type { Order, User } from "@/payload-types";

export const dynamic = "force-dynamic";

type RouteParams = { id: string };

function formatDate(dateString: string | null | undefined): string {
    if (!dateString) return "";
    try {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    } catch {
        return dateString;
    }
}

const STATUS_LABELS: Record<Order["status"], string> = {
    review: "Review",
    approved: "Approved",
    preparing: "Preparing",
    delivered: "Delivered",
    cancelled: "Cancelled",
};

// Status history — represents the lifecycle path. Each entry is shown in order.
const STATUS_HISTORY: Order["status"][] = ["review", "approved", "preparing", "delivered"];

function statusTone(status: Order["status"]): { bg: string; text: string; border: string } {
    if (status === "cancelled") {
        return { bg: "bg-[#d30005]/10", text: "text-[#d30005]", border: "border-[#d30005]/20" };
    }
    if (status === "delivered" || status === "approved" || status === "preparing") {
        return { bg: "bg-[#007d48]/10", text: "text-[#007d48]", border: "border-[#007d48]/20" };
    }
    return { bg: "bg-[#f5f5f5]", text: "text-[#707072]", border: "border-[#cacacb]" };
}

function customerLabel(c: Order["customer"]): string {
    if (!c) return "—";
    if (typeof c === "number") return `#${c}`;
    const u = c as User;
    if (u.firstName || u.lastName) return `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim();
    return `#${u.id}`;
}

function noteAuthor(author: number | User | null | undefined): string {
    if (!author) return "Staff";
    if (typeof author === "number") return `Staff #${author}`;
    const u = author as User;
    if (u.firstName || u.lastName) return `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim();
    return `Staff #${u.id}`;
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
        const payloadConfig = await config;
        const payload = await getPayload({ config: payloadConfig });
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
    const user = await getCurrentUser();
    if (!user) {
        redirect("/login?next=/orders");
    }

    const { id } = await params;
    const numericId = parseInt(id, 10);
    if (!Number.isFinite(numericId) || numericId <= 0) notFound();

    const order = await fetchOrder(numericId, user.id);
    if (!order) notFound();

    const tone = statusTone(order.status);
    const reachedIndex = STATUS_HISTORY.indexOf(order.status);
    const isCancelled = order.status === "cancelled";

    return (
        <div className="mx-auto max-w-[1440px] px-4 py-8 md:px-8">
            {/* Breadcrumb — {typography.caption-md} 14px/500, {colors.mute} #707072 */}
            <nav className="mb-6 flex items-center gap-1.5 text-sm text-[#707072]" aria-label="Breadcrumb">
                <Link href="/" className="hover:text-[#111111]">
                    Home
                </Link>
                <span aria-hidden>›</span>
                <Link href="/account" className="hover:text-[#111111]">
                    Account
                </Link>
                <span aria-hidden>›</span>
                <Link href="/orders" className="hover:text-[#111111]">
                    Orders
                </Link>
                <span aria-hidden>›</span>
                <span className="font-medium text-[#111111]">#{order.id}</span>
            </nav>

            <div className="flex flex-wrap items-center justify-between gap-3">
                {/* Title — {typography.heading-xl} 32px/500, {colors.ink} #111111 */}
                <h1 className="text-[32px] font-medium leading-[1.2] text-[#111111]">Order #{order.id}</h1>
                <Badge
                    variant="outline"
                    className={`${tone.bg} ${tone.text} ${tone.border} rounded-full border px-3 py-0.5 text-[12px] font-medium`}
                >
                    {STATUS_LABELS[order.status]}
                </Badge>
            </div>
            <p className="mt-1 text-[14px] font-medium text-[#707072]">Placed {formatDate(order.createdAt)}</p>

            {order.hasZeroPrice ? (
                <div className="mt-4 rounded-[18px] border border-[#d30005]/30 bg-[#d30005]/5 p-4 text-[14px] font-medium text-[#d30005]">
                    This order includes zero-price items and is awaiting admin review.
                </div>
            ) : null}

            <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
                {/* Left column — items + history + notes */}
                <div className="space-y-6">
                    {/* Items — {component.product-card} inspired, {colors.soft-cloud} stage */}
                    <Card className="rounded-[18px] border border-[#cacacb] bg-white p-0 gap-0">
                        <CardContent className="p-6">
                            <h2 className="text-[16px] font-medium text-[#111111]">Items</h2>
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
                                                    {item.name ?? `Product #${item.product ?? "—"}`}
                                                </p>
                                                <p className="mt-0.5 text-[12px] font-medium text-[#707072]">
                                                    Qty {item.quantity} ·{" "}
                                                    <span className={isZero ? "text-[#d30005]" : "text-[#707072]"}>
                                                        {formatPriceNumber(item.price, "en-US")} تومان
                                                    </span>{" "}
                                                    each
                                                </p>
                                            </div>
                                            <span
                                                className={`shrink-0 text-[14px] font-medium ${isZero ? "text-[#d30005]" : "text-[#111111]"
                                                    }`}
                                            >
                                                {formatPriceNumber(item.price * item.quantity, "en-US")} تومان
                                            </span>
                                        </li>
                                    );
                                })}
                            </ul>
                            <div className="mt-4 flex items-center justify-between border-t border-[#e5e5e5] pt-4">
                                <span className="text-[16px] font-medium text-[#111111]">Total</span>
                                <span
                                    className={`text-[16px] font-medium ${order.hasZeroPrice ? "text-[#d30005]" : "text-[#111111]"
                                        }`}
                                >
                                    {formatPriceNumber(order.total ?? 0, "en-US")} تومان
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Status history — linear progression, marked current/cancelled */}
                    <Card className="rounded-[18px] border border-[#cacacb] bg-white p-0 gap-0">
                        <CardContent className="p-6">
                            <h2 className="text-[16px] font-medium text-[#111111]">Status</h2>
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
                                                {isCurrent ? " · current" : ""}
                                            </span>
                                            {idx < STATUS_HISTORY.length - 1 ? (
                                                <span aria-hidden className="text-[#9e9ea0]">
                                                    ›
                                                </span>
                                            ) : null}
                                        </li>
                                    );
                                })}
                                {isCancelled ? (
                                    <li className="flex items-center gap-2">
                                        <span className="text-[#9e9ea0]">·</span>
                                        <span className="inline-flex h-7 items-center rounded-full border border-[#d30005]/30 bg-[#d30005]/10 px-3 text-[12px] font-medium text-[#d30005]">
                                            Cancelled
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
                                <h2 className="text-[16px] font-medium text-[#111111]">Updates</h2>
                                <ul className="mt-4 space-y-3">
                                    {order.notes.map((n, idx) => (
                                        <li
                                            key={n.id ?? idx}
                                            className="rounded-[18px] border border-[#e5e5e5] bg-[#f5f5f5] p-3"
                                        >
                                            <p className="text-[12px] font-medium text-[#707072]">
                                                {noteAuthor(n.createdBy)} · {formatDate(n.createdAt ?? order.updatedAt)}
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
                            <h2 className="text-[16px] font-medium text-[#111111]">Details</h2>
                            <dl className="mt-4 space-y-3 text-[14px]">
                                <div>
                                    <dt className="text-[12px] font-medium uppercase tracking-wide text-[#707072]">
                                        Customer
                                    </dt>
                                    <dd className="mt-0.5 text-[#111111]">{customerLabel(order.customer)}</dd>
                                </div>
                                <div>
                                    <dt className="text-[12px] font-medium uppercase tracking-wide text-[#707072]">
                                        Order ID
                                    </dt>
                                    <dd className="mt-0.5 text-[#111111]">#{order.id}</dd>
                                </div>
                                <div>
                                    <dt className="text-[12px] font-medium uppercase tracking-wide text-[#707072]">
                                        Placed
                                    </dt>
                                    <dd className="mt-0.5 text-[#111111]">{formatDate(order.createdAt)}</dd>
                                </div>
                                <div>
                                    <dt className="text-[12px] font-medium uppercase tracking-wide text-[#707072]">
                                        Last update
                                    </dt>
                                    <dd className="mt-0.5 text-[#111111]">{formatDate(order.updatedAt)}</dd>
                                </div>
                            </dl>
                        </CardContent>
                    </Card>

                    {order.shippingAddress ? (
                        <Card className="rounded-[18px] border border-[#cacacb] bg-white p-0 gap-0">
                            <CardContent className="p-6">
                                <h2 className="text-[16px] font-medium text-[#111111]">Shipping address</h2>
                                <p className="mt-3 whitespace-pre-line text-[14px] leading-[1.5] text-[#111111]">
                                    {order.shippingAddress}
                                </p>
                            </CardContent>
                        </Card>
                    ) : null}
                </aside>
            </div>
        </div>
    );
}
