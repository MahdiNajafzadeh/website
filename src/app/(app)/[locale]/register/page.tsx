import { RegisterForm } from "@/components/auth/RegisterForm";
import { Card } from "@/components/ui/card";
import type { Locale } from "@/lib/locale";
import { ensureLocale } from "@/lib/locale";
import { getTranslator } from "@/lib/i18n";

type Params = Promise<{ locale: string }>;
type SearchParams = Promise<{ redirect?: string }>;

export async function generateMetadata({ params }: { params: Params }) {
    const rawLocale = (await params).locale;
    const locale: Locale = ensureLocale(rawLocale);
    const { t } = getTranslator(locale);
    const siteName = t("layout.header.siteNameFallback");
    return {
        title: `${t("auth.register.title")} | ${siteName}`,
    };
}

export default async function RegisterPage(props: { searchParams: SearchParams; params: Params }) {
    const search = await props.searchParams;
    const locale: Locale = ensureLocale((await props.params).locale);
    const { t } = getTranslator(locale);

    return (
        <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4 py-8">
            <Card className="w-full max-w-md p-6">
                <h1 className="mb-1 text-2xl font-bold">{t("auth.register.heading")}</h1>
                <p className="mb-6 text-sm text-muted-foreground">{t("auth.register.subheading")}</p>
                <RegisterForm redirectTo={search.redirect} locale={locale} />
            </Card>
        </div>
    );
}
