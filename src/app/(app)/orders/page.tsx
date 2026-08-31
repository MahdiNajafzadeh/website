import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import type { Metadata } from 'next'
import config from '@/payload.config'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { getCurrentUser } from '@/lib/current-user'
import { getSiteSettings, deriveName } from '@/lib/site-settings'
import { formatPriceNumber } from '@/lib/pricing'
import type { Order } from '@/payload-types'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  const siteName = deriveName(settings)
  return {
    title: `Orders | ${siteName}`,
    description: `Your order history at ${siteName}.`,
  }
}

function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return ''
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return dateString
  }
}

const STATUS_LABELS: Record<Order['status'], string> = {
  review: 'Review',
  approved: 'Approved',
  preparing: 'Preparing',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

function statusTone(status: Order['status']): { bg: string; text: string; border: string } {
  // {colors.success} #007d48 for approved/preparing/delivered
  // {colors.sale} #d30005 for cancelled
  // {colors.mute} #707072 for review (default pending)
  if (status === 'cancelled') {
    return { bg: 'bg-[#d30005]/10', text: 'text-[#d30005]', border: 'border-[#d30005]/20' }
  }
  if (status === 'delivered' || status === 'approved' || status === 'preparing') {
    return { bg: 'bg-[#007d48]/10', text: 'text-[#007d48]', border: 'border-[#007d48]/20' }
  }
  return { bg: 'bg-[#f5f5f5]', text: 'text-[#707072]', border: 'border-[#cacacb]' }
}

export default async function OrdersPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login?next=/orders')
  }

  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const res = await payload.find({
    collection: 'orders',
    where: { customer: { equals: user.id } },
    depth: 0,
    limit: 50,
    sort: '-createdAt',
    overrideAccess: false,
  })

  const orders = res.docs as Order[]
  const totalOrders = res.totalDocs ?? orders.length

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
        <span className="font-medium text-[#111111]">Orders</span>
      </nav>

      {/* Title — {typography.heading-xl} 32px/500, {colors.ink} #111111 */}
      <h1 className="text-[32px] font-medium leading-[1.2] text-[#111111]">My Orders</h1>
      <p className="mt-1 text-[14px] font-medium text-[#707072]">
        {totalOrders} {totalOrders === 1 ? 'order' : 'orders'}
      </p>

      {orders.length === 0 ? (
        <div className="mt-8 rounded-[30px] bg-[#f5f5f5] p-12 text-center">
          {/* Empty state — {colors.soft-cloud} #f5f5f5, {rounded.lg} 30px */}
          <p className="text-[16px] font-medium leading-[1.5] text-[#111111]">No orders yet</p>
          <p className="mt-1 text-[14px] font-medium leading-[1.5] text-[#707072]">
            Place your first order and it will appear here.
          </p>
          <Link
            href="/products"
            className="mt-4 inline-flex rounded-full bg-[#111111] px-6 py-2 text-[14px] font-medium text-white hover:bg-[#111111]/90"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <>
          {/* Mobile — cards */}
          <div className="mt-8 grid gap-3 md:hidden">
            {orders.map((order) => {
              const tone = statusTone(order.status)
              return (
                <Link key={order.id} href={`/orders/${order.id}`}>
                  <Card className="rounded-[18px] border border-[#e5e5e5] bg-white p-0 gap-0 transition-colors hover:border-[#cacacb]">
                    <CardContent className="flex flex-col gap-2 p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] font-medium uppercase tracking-wide text-[#707072]">
                          Order #{order.id}
                        </span>
                        <Badge
                          variant="outline"
                          className={`${tone.bg} ${tone.text} ${tone.border} rounded-full border px-2 py-0 text-[12px] font-medium`}
                        >
                          {STATUS_LABELS[order.status]}
                        </Badge>
                      </div>
                      <p className="text-[14px] font-medium text-[#111111]">
                        {formatPriceNumber(order.total ?? 0, 'en-US')} تومان
                      </p>
                      <p className="text-[12px] font-medium text-[#707072]">
                        {formatDate(order.createdAt)} · {order.items?.length ?? 0}{' '}
                        {(order.items?.length ?? 0) === 1 ? 'item' : 'items'}
                      </p>
                      {order.hasZeroPrice ? (
                        <span className="text-[12px] font-medium text-[#d30005]">
                          Includes zero-price items
                        </span>
                      ) : null}
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>

          {/* Desktop — shadcn Table */}
          <div className="mt-8 hidden overflow-hidden rounded-[18px] border border-[#cacacb] md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[12px] font-medium uppercase tracking-wide text-[#707072]">
                    Order
                  </TableHead>
                  <TableHead className="text-[12px] font-medium uppercase tracking-wide text-[#707072]">
                    Date
                  </TableHead>
                  <TableHead className="text-[12px] font-medium uppercase tracking-wide text-[#707072]">
                    Status
                  </TableHead>
                  <TableHead className="text-right text-[12px] font-medium uppercase tracking-wide text-[#707072]">
                    Items
                  </TableHead>
                  <TableHead className="text-right text-[12px] font-medium uppercase tracking-wide text-[#707072]">
                    Total
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => {
                  const tone = statusTone(order.status)
                  return (
                    <TableRow key={order.id}>
                      <TableCell>
                        <Link
                          href={`/orders/${order.id}`}
                          className="text-[14px] font-medium text-[#111111] hover:underline"
                        >
                          #{order.id}
                        </Link>
                      </TableCell>
                      <TableCell className="text-[14px] text-[#707072]">
                        {formatDate(order.createdAt)}
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
                          className={`text-[14px] font-medium ${order.hasZeroPrice ? 'text-[#d30005]' : 'text-[#111111]'}`}
                        >
                          {formatPriceNumber(order.total ?? 0, 'en-US')} تومان
                        </span>
                        {order.hasZeroPrice ? (
                          <span className="ml-2 text-[12px] font-medium text-[#d30005]">zero-price</span>
                        ) : null}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  )
}
