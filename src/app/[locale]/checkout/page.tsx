import { CheckoutForm } from '@/components/cart/CheckoutForm'
import { Card } from '@/components/ui/card'
import { requireUser } from '@/lib/auth-server'
import type { Locale } from '@/lib/locale'
import { ensureLocale, localeHref } from '@/lib/locale'
import { getTranslator } from '@/lib/i18n'
import { getPayload } from 'payload'
import config from '@payload-config'

type Params = Promise<{ locale: string }>

export async function generateMetadata({ params }: { params: Params }) {
    const rawLocale = (await params).locale
    const locale: Locale = ensureLocale(rawLocale)
    const { t } = getTranslator(locale)
    const siteName = t('layout.header.siteNameFallback')
    return {
        title: `${t('cart.checkout.heading')} | ${siteName}`,
    }
}

export default async function CheckoutPage(props: { params: Params }) {
    const locale: Locale = ensureLocale((await props.params).locale)
    const { t } = getTranslator(locale)
    const user = await requireUser(localeHref(locale, '/checkout'))
    const payload = await getPayload({ config })
    const me = await payload.findByID({
        collection: 'users',
        id: user.id,
        depth: 0,
    })
    const defaultAddress = me.addresses?.[0]

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="mb-6 text-3xl font-bold">{t('cart.checkout.heading')}</h1>

            {!defaultAddress ? (
                <Card className="mb-4 border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                    {t('cart.checkout.noAddress')}
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
                locale={locale}
            />
        </div>
    )
}
