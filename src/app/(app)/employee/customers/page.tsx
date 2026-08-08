import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { requireRole } from '@/lib/auth-server'
import { getPayload } from 'payload'
import config from '@payload-config'

export const metadata = {
    title: 'مشتریان | پنل کارمندی',
}

export default async function EmployeeCustomersPage() {
    await requireRole(['employee', 'admin'], '/employee/customers')
    const payload = await getPayload({ config })

    const users = await payload.find({
        collection: 'users',
        limit: 200,
        sort: '-createdAt',
        depth: 0,
    })

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="mb-6 text-3xl font-bold">مشتریان</h1>

            {users.docs.length === 0 ? (
                <Card className="p-10 text-center text-muted-foreground">
                    کاربری ثبت نشده.
                </Card>
            ) : (
                <div className="overflow-x-auto rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>نام</TableHead>
                                <TableHead>ایمیل</TableHead>
                                <TableHead>تلفن</TableHead>
                                <TableHead>نقش</TableHead>
                                <TableHead>تاریخ ثبت‌نام</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.docs.map((u) => (
                                <TableRow key={u.id}>
                                    <TableCell className="font-medium">{u.name}</TableCell>
                                    <TableCell dir="ltr">{u.email}</TableCell>
                                    <TableCell dir="ltr">{u.phone ?? '—'}</TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                u.role === 'admin'
                                                    ? 'default'
                                                    : u.role === 'employee'
                                                      ? 'secondary'
                                                      : 'outline'
                                            }
                                        >
                                            {u.role === 'admin'
                                                ? 'مدیر'
                                                : u.role === 'employee'
                                                  ? 'کارمند'
                                                  : 'مشتری'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground">
                                        {u.createdAt}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    )
}