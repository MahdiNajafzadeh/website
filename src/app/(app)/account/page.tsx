import Link from "next/link";
import type { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { PageContainer } from "@/components/layout/PageContainer";
import { AccountForm } from "@/components/account/AccountForm";
import { requireUser } from "@/lib/auth-guard";
import { getPayloadClient } from "@/lib/payload";
import { formatIranPhone } from "@/lib/phone";
import { t } from "@/lib/t";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: "Account",
        description: "Manage your profile, address, and orders.",
    };
}

export default async function AccountPage() {
    const user = await requireUser("/account");
    const payload = await getPayloadClient();

    let orderCount = 0;
    try {
        const res = await payload.count({
            collection: "orders",
            where: { customer: { equals: user.id } },
            overrideAccess: false,
        });
        orderCount = res.totalDocs ?? 0;
    } catch {
        orderCount = 0;
    }

    const customerType = user.customerType ?? "regular";
    const isPartner = customerType === "partner";
    const phoneFormatted = user.phone ? formatIranPhone(user.phone) : "—";

    return (
        <PageContainer>
            {/* Breadcrumb — {typography.caption-md} 14px/500, {colors.mute} #707072 */}
            <Breadcrumbs
                crumbs={[{ href: "/", label: t("common.home") }, { label: t("account.title") }]}
                separatorKey="common.breadcrumbSeparator"
            />

            {/* Title — {typography.heading-xl} 32px/500, {colors.ink} #111111 */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h1 className="text-[32px] font-medium leading-[1.2] text-[#111111] dark:text-white">
                    {t("account.title")}
                </h1>
                <div className="flex items-center gap-2">
                    <Badge
                        variant="outline"
                        className={`rounded-full border px-3 py-0.5 text-[12px] font-medium ${isPartner ? "border-[#007d48]/30 bg-[#007d48]/10 text-[#007d48]" : "border-[#cacacb] bg-[#f5f5f5] text-[#707072] dark:border-[#39393b] dark:bg-[#1a1a1a] dark:text-[#9e9ea0]"}`}
                    >
                        {isPartner ? t("account.partner") : t("account.regular")}
                    </Badge>
                </div>
            </div>
            <p className="mt-1 text-[14px] font-medium text-[#707072] dark:text-[#9e9ea0]">
                {t("account.userMeta", {
                    firstName: user.firstName ?? "",
                    lastName: user.lastName ?? "",
                    phone: phoneFormatted,
                })}
            </p>

            <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
                <div className="space-y-6">
                    <Card className="rounded-[18px] border border-[#cacacb] bg-white dark:border-[#39393b] dark:bg-[#1a1a1a] p-0 gap-0">
                        <CardContent className="p-6">
                            <h2 className="text-[16px] font-medium text-[#111111] dark:text-white">
                                {t("account.profile")}
                            </h2>
                            <p className="mt-1 text-[14px] font-medium text-[#707072] dark:text-[#9e9ea0]">
                                {t("account.profileWithPhone", { profile: t("account.profile"), phone: phoneFormatted })}
                            </p>
                            <div className="mt-5">
                                <AccountForm
                                    userId={user.id}
                                    initialFirstName={user.firstName ?? ""}
                                    initialLastName={user.lastName ?? ""}
                                    initialPhone={user.phone ?? ""}
                                    initialAddress={user.address ?? ""}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <aside className="space-y-6">
                    <Card className="rounded-[18px] border border-[#cacacb] bg-white dark:border-[#39393b] dark:bg-[#1a1a1a] p-0 gap-0">
                        <CardContent className="p-6">
                            <h2 className="text-[16px] font-medium text-[#111111] dark:text-white">
                                {t("account.atAGlance")}
                            </h2>
                            <dl className="mt-4 space-y-3 text-[14px]">
                                <div className="flex items-center justify-between">
                                    <dt className="text-[12px] font-medium uppercase tracking-wide text-[#707072] dark:text-[#9e9ea0]">
                                        {t("account.customerType")}
                                    </dt>
                                    <dd
                                        className={`font-medium ${isPartner ? "text-[#007d48]" : "text-[#111111] dark:text-white"}`}
                                    >
                                        {isPartner ? t("account.partner") : t("account.regular")}
                                    </dd>
                                </div>
                                <div className="flex items-center justify-between">
                                    <dt className="text-[12px] font-medium uppercase tracking-wide text-[#707072] dark:text-[#9e9ea0]">
                                        {t("account.orders")}
                                    </dt>
                                    <dd className="font-medium text-[#111111] dark:text-white">
                                        {orderCount.toLocaleString("fa-IR")}
                                    </dd>
                                </div>
                            </dl>
                            <Link
                                href="/orders"
                                className="mt-5 inline-flex h-10 w-full items-center justify-center rounded-full bg-[#111111] px-5 text-[14px] font-medium text-white hover:opacity-90 dark:bg-white dark:text-[#111111]"
                            >
                                {t("account.viewOrders")}
                            </Link>
                        </CardContent>
                    </Card>
                </aside>
            </div>
        </PageContainer>
    );
}
