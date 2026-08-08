import { EmployeeOrdersTable } from '@/components/employee/EmployeeOrdersTable'
import { requireRole } from '@/lib/auth-server'
import { getPayload } from 'payload'
import config from '@payload-config'

export const metadata = {
    title: 'مدیریت سفارش‌ها | پنل کارمندی',
}

type SearchParams = Promise<{ status?: string }>

export default async function EmployeeOrdersPage({
    searchParams,
}: {
    searchParams: SearchParams
}) {
    await requireRole(['employee', 'admin'], '/employee/orders')
    const payload = await getPayload({ config })

    const params = await searchParams
    const where = params.status ? { status: { equals: params.status } } : {}
    const orders = await payload.find({
        collection: 'orders',
        where,
        limit: 100,
        sort: '-createdAt',
        depth: 2,
    })

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="mb-6 text-3xl font-bold">مدیریت سفارش‌ها</h1>
            <EmployeeOrdersTable orders={orders.docs} currentStatus={params.status} />
        </div>
    )
}