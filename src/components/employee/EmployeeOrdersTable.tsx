"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useTranslation } from "@/components/i18n/TranslationProvider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate, formatOrderStatus, formatPriceToman } from "@/lib/format";
import type { Locale } from "@/lib/locale";
import { localeHref } from "@/lib/locale";
import { localizedValue } from "@/lib/localized";
import type { Order, User } from "@/payload-types";

const STATUS_VALUES = ["pending", "processing", "shipped", "delivered", "cancelled"] as const;

type StatusValue = (typeof STATUS_VALUES)[number];

const statusKey = (value: StatusValue): string => `employee.orders.status.${value}`;

type Props = {
    orders: Order[];
    currentStatus?: string;
    locale: Locale;
};

export const EmployeeOrdersTable = ({ orders, currentStatus, locale }: Props) => {
    const router = useRouter();
    const { t } = useTranslation();
    const [updating, setUpdating] = useState<string | null>(null);
    const [savingItem, setSavingItem] = useState<string | null>(null);
    const [itemDrafts, setItemDrafts] = useState<Record<string, number>>({});

    const updateStatus = async (id: number | string, status: string) => {
        setUpdating(String(id));
        try {
            await fetch(`/api/orders/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ status }),
            });
            router.refresh();
        } finally {
            setUpdating(null);
        }
    };

    const updateItemPrice = async (orderId: number | string, itemId: string, price: number) => {
        const key = `${orderId}:${itemId}`;
        setSavingItem(key);
        try {
            await fetch(`/api/orders/${orderId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ items: [{ id: itemId, price }] }),
            });
            router.refresh();
        } finally {
            setSavingItem(null);
        }
    };

    const getDraft = (orderId: number | string, itemId: string, fallback: number): number => {
        const k = `${orderId}:${itemId}`;
        return itemDrafts[k] ?? fallback;
    };

    const setDraft = (orderId: number | string, itemId: string, value: number): void => {
        const k = `${orderId}:${itemId}`;
        setItemDrafts((s) => ({ ...s, [k]: value }));
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
                <Button
                    variant={!currentStatus ? "default" : "outline"}
                    size="sm"
                    render={<Link href={localeHref(locale, "/employee/orders")} />}
                >
                    {t("employee.orders.filter.all")}
                </Button>
                {STATUS_VALUES.map((value) => (
                    <Button
                        key={value}
                        variant={currentStatus === value ? "default" : "outline"}
                        size="sm"
                        render={<Link href={`${localeHref(locale, "/employee/orders")}?status=${value}`} />}
                    >
                        {t(statusKey(value))}
                    </Button>
                ))}
            </div>

            {orders.length === 0 ? (
                <div className="rounded-md border p-10 text-center text-sm text-muted-foreground">
                    {t("employee.orders.empty")}
                </div>
            ) : (
                <div className="overflow-x-auto rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t("employee.orders.table.id")}</TableHead>
                                <TableHead>{t("employee.orders.table.customer")}</TableHead>
                                <TableHead>{t("employee.orders.table.total")}</TableHead>
                                <TableHead>{t("employee.orders.table.status")}</TableHead>
                                <TableHead>{t("employee.orders.table.date")}</TableHead>
                                <TableHead>{t("employee.orders.table.changeStatus")}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.map((order) => {
                                const customer =
                                    order.user && typeof order.user !== "number"
                                        ? (order.user as Pick<
                                              User,
                                              "id" | "firstName" | "lastName" | "email" | "phone"
                                          >)
                                        : null;
                                const customerName = customer
                                    ? [customer.firstName, customer.lastName].filter(Boolean).join(" ") ||
                                      customer.email
                                    : `#${order.user}`;
                                return (
                                    <TableRow key={order.id}>
                                        <TableCell className="align-top font-medium">#{order.id}</TableCell>
                                        <TableCell className="align-top">
                                            <div className="flex flex-col">
                                                <span>{customerName}</span>
                                                {customer?.phone ? (
                                                    <span className="text-xs text-muted-foreground" dir="ltr">
                                                        {customer.phone}
                                                    </span>
                                                ) : null}
                                                {order.items && order.items.length > 0 ? (
                                                    <details className="mt-2">
                                                        <summary className="cursor-pointer text-xs text-primary hover:underline">
                                                            {t("employee.orders.table.items", {
                                                                count: order.items.length,
                                                            })}
                                                        </summary>
                                                        <ul className="mt-2 space-y-2 text-xs">
                                                            {order.items.map((item) => {
                                                                const itemKey = String(item.id ?? "");
                                                                if (!itemKey) return null;
                                                                const productName =
                                                                    item.product && typeof item.product !== "number"
                                                                        ? localizedValue(item.product.name, locale)
                                                                        : t("orders.productFallback", {
                                                                              id: String(item.product),
                                                                          });
                                                                const draft = getDraft(
                                                                    order.id,
                                                                    itemKey,
                                                                    item.price ?? 0,
                                                                );
                                                                const dirty = draft !== (item.price ?? 0);
                                                                return (
                                                                    <li
                                                                        key={itemKey}
                                                                        className="grid grid-cols-[1fr_auto_auto] items-center gap-2 rounded border p-2"
                                                                    >
                                                                        <div>
                                                                            <div className="font-medium">
                                                                                {productName} × {item.quantity}
                                                                            </div>
                                                                            <div className="text-muted-foreground">
                                                                                {formatPriceToman(
                                                                                    (item.price ?? 0) *
                                                                                        (item.quantity ?? 0),
                                                                                    locale,
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                        <Input
                                                                            type="number"
                                                                            min={0}
                                                                            dir="ltr"
                                                                            value={draft}
                                                                            onChange={(e) =>
                                                                                setDraft(
                                                                                    order.id,
                                                                                    itemKey,
                                                                                    Number(e.currentTarget.value),
                                                                                )
                                                                            }
                                                                            className="h-7 w-24 text-xs"
                                                                        />
                                                                        <Button
                                                                            type="button"
                                                                            size="sm"
                                                                            variant={dirty ? "default" : "outline"}
                                                                            disabled={
                                                                                !dirty ||
                                                                                savingItem === `${order.id}:${itemKey}`
                                                                            }
                                                                            onClick={() =>
                                                                                updateItemPrice(
                                                                                    order.id,
                                                                                    itemKey,
                                                                                    draft,
                                                                                )
                                                                            }
                                                                        >
                                                                            {savingItem === `${order.id}:${itemKey}`
                                                                                ? t("employee.orders.table.saving")
                                                                                : t("employee.orders.table.save")}
                                                                        </Button>
                                                                    </li>
                                                                );
                                                            })}
                                                        </ul>
                                                    </details>
                                                ) : null}
                                            </div>
                                        </TableCell>
                                        <TableCell className="align-top">
                                            {formatPriceToman(order.total, locale)}
                                        </TableCell>
                                        <TableCell className="align-top">
                                            <Badge>{formatOrderStatus(order.status, locale)}</Badge>
                                        </TableCell>
                                        <TableCell className="align-top text-xs text-muted-foreground">
                                            {formatDate(order.createdAt, locale)}
                                        </TableCell>
                                        <TableCell className="align-top">
                                            <Select
                                                value={order.status ?? undefined}
                                                onValueChange={(v) => updateStatus(order.id, String(v))}
                                            >
                                                <SelectTrigger className="w-44">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {STATUS_VALUES.map((value) => (
                                                        <SelectItem key={value} value={value}>
                                                            {t(statusKey(value))}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {updating === String(order.id) ? (
                                                <span className="ms-2 text-xs text-muted-foreground">
                                                    {t("employee.orders.table.saving")}
                                                </span>
                                            ) : null}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
};
