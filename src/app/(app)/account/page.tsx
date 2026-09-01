import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import type { Metadata } from 'next'
import config from '@/payload.config'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AccountForm } from '@/components/account/AccountForm'
import { getCurrentUser } from '@/lib/current-user'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: 'Account',
        description: 'Manage your profile, address, and orders.',
    }
}

function formatPhone(value: string): string {
    if (!/^09\d{9}$/.test(value)) return value
    return `${value.slice(0, 4)} ${value.slice(4, 7)} ${value.slice(7)}`
}

export default async function AccountPage() {
    const user = await getCurrentUser()
    if (!user) redirect('/login?next=/account')
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })

    let orderCount = 0
    try {
        const res = await payload.count({
            collection: 'orders',
            where: { customer: { equals: user.id } },
            overrideAccess: false,
        })
        orderCount = res.totalDocs ?? 0
    } catch {
        orderCount = 0
    }

    const customerType = user.customerType ?? 'regular'
    const isPartner = customerType === 'partner'
    const phoneFormatted = user.phone ? formatPhone(user.phone) : '—'

    return (
        <div className="mx-auto max-w-[1440px] px-4 py-8 md:px-8">
            {/* Breadcrumb — {typography.caption-md} 14px/500, {colors.mute} #707072 */}
            <nav className="mb-6 flex items-center gap-1.5 text-sm text-[#707072]" aria-label="Breadcrumb">
                <Link href="/" className="hover:text-[#111111]">
                    Home
                </Link>
                <span aria-hidden>›</span>
                <span className="font-medium text-[#111111]">Account</span>
            </nav>

            {/* Title — {typography.heading-xl} 32px/500, {colors.ink} #111111 */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h1 className="text-[32px] font-medium leading-[1.2] text-[#111111]">Account</h1>
                <div className="flex items-center gap-2">
                    <Badge
                        variant="outline"
                        className={`rounded-full border px-3 py-0.5 text-[12px] font-medium ${isPartner
                            ? 'border-[#007d48]/30 bg-[#007d48]/10 text-[#007d48]'
                            : 'border-[#cacacb] bg-[#f5f5f5] text-[#707072]'
                            }`}
                    >
                        {isPartner ? 'Partner' : 'Regular'} customer
                    </Badge>
                </div>
            </div>
            <p className="mt-1 text-[14px] font-medium text-[#707072]">
                {user.firstName} {user.lastName} · {phoneFormatted}
            </p>

            <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
                <div className="space-y-6">
                    <Card className="rounded-[18px] border border-[#cacacb] bg-white p-0 gap-0">
                        <CardContent className="p-6">
                            <h2 className="text-[16px] font-medium text-[#111111]">Profile</h2>
                            <p className="mt-1 text-[14px] font-medium text-[#707072]">
                                Update your name and shipping address. Your phone number is locked to this account.
                            </p>
                            <div className="mt-5">
                                <AccountForm
                                    userId={user.id}
                                    initialFirstName={user.firstName ?? ''}
                                    initialLastName={user.lastName ?? ''}
                                    initialPhone={user.phone ?? ''}
                                    initialAddress={user.address ?? ''}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <aside className="space-y-6">
                    <Card className="rounded-[18px] border border-[#cacacb] bg-white p-0 gap-0">
                        <CardContent className="p-6">
                            <h2 className="text-[16px] font-medium text-[#111111]">At a glance</h2>
                            <dl className="mt-4 space-y-3 text-[14px]">
                                <div className="flex items-center justify-between">
                                    <dt className="text-[12px] font-medium uppercase tracking-wide text-[#707072]">
                                        Customer type
                                    </dt>
                                    <dd
                                        className={`font-medium ${isPartner ? 'text-[#007d48]' : 'text-[#111111]'}`}
                                    >
                                        {isPartner ? 'Partner' : 'Regular'}
                                    </dd>
                                </div>
                                <div className="flex items-center justify-between">
                                    <dt className="text-[12px] font-medium uppercase tracking-wide text-[#707072]">
                                        Orders
                                    </dt>
                                    <dd className="font-medium text-[#111111]">{orderCount}</dd>
                                </div>
                            </dl>
                            <Link
                                href="/orders"
                                className="mt-5 inline-flex h-10 w-full items-center justify-center rounded-full bg-[#111111] px-5 text-[14px] font-medium text-white hover:opacity-90"
                            >
                                View orders
                            </Link>
                        </CardContent>
                    </Card>
                </aside>
            </div>
        </div>
    )
}
