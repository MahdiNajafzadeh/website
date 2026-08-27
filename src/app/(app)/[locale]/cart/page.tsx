import { CartView } from "@/components/cart/CartView";
import type { Locale } from "@/lib/locale";
import { ensureLocale } from "@/lib/locale";
import { getTranslator } from "@/lib/i18n";

type Params = Promise<{ locale: string }>;

export async function generateMetadata({ params }: { params: Params }) {
    const rawLocale = (await params).locale;
    const locale: Locale = ensureLocale(rawLocale);
    const { t } = getTranslator(locale);
    const siteName = t("layout.header.siteNameFallback");
    return {
        title: `${t("cart.title")} | ${siteName}`,
    };
}

export default async function CartPage(props: { params: Params }) {
    const locale: Locale = ensureLocale((await props.params).locale);
    const { t } = getTranslator(locale);
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="mb-6 text-3xl font-bold">{t("cart.heading")}</h1>
            <CartView locale={locale} />
        </div>
    );
}
