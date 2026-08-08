import { CheckoutForm } from '@/components/cart/CheckoutForm'
import { Card } from '@/components/ui/card'
import { requireUser } from '@/lib/auth-server'
import { getPayload } from 'payload'
import config from '@payload-config'

export const metadata = {
    title: 'تسویه حساب | آبفارین',
}

export default async function CheckoutPage() {
    const user = await requireUser('/checkout')
    const payload = await getPayload({ config })
    const me = await payload.findByID({
        collection: 'users',
        id: user.id,
        depth: 0,
    })
    const defaultAddress = me.addresses?.[0]

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="mb-6 text-3xl font-bold">تسویه حساب</h1>

            {!defaultAddress ? (
                <Card className="mb-4 border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                    در حساب کاربری شما آدرسی ثبت نشده است. لطفاً آدرس ارسال را در فرم زیر وارد
                    کنید.
                </Card>
            ) : null}

            <CheckoutForm
                user={{
                    id: me.id,
                    email: me.email,
                    name: me.name,
                    phone: me.phone,
                }}
                defaultAddress={defaultAddress}
            />
        </div>
    )
}