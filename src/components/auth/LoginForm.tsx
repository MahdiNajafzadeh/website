"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AlertCircle } from "lucide-react";

import { useTranslation } from "@/components/i18n/TranslationProvider";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Locale } from "@/lib/locale";
import { localeHref } from "@/lib/locale";
import { sanitizeRedirect } from "@/lib/redirect";
import { useBeforeUnload } from "@/lib/use-before-unload";

type Props = {
    redirectTo?: string;
    locale: Locale;
};

// ponytail: lenient phone validation — strip non-digits and require 11.
const validatePhone = (raw: string): boolean => raw.replace(/\D+/g, "").length === 11;

export const LoginForm = ({ redirectTo, locale }: Props) => {
    const router = useRouter();
    const { t } = useTranslation();
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [dirty, setDirty] = useState(false);
    useBeforeUnload(dirty && !submitting);

    const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSubmitting(true);
        setError(null);
        const fd = new FormData(event.currentTarget);
        const phone = String(fd.get("phone") ?? "");
        const password = String(fd.get("password") ?? "");

        if (!validatePhone(phone)) {
            setError(t("auth.login.errorFallback"));
            setSubmitting(false);
            return;
        }

        try {
            const res = await fetch("/api/auth/phone-login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ phone, password }),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data?.message ?? t("auth.login.errorFallback"));
            }
            router.refresh();
            router.push(redirectTo ? sanitizeRedirect(redirectTo) : localeHref(locale, "/account"));
        } catch (e) {
            setError(e instanceof Error ? e.message : t("common.unknownError"));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={onSubmit} className="grid gap-4" onChange={() => setDirty(true)}>
            <div className="grid gap-1.5">
                <Label htmlFor="phone">{t("auth.login.phone")}</Label>
                <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    spellCheck={false}
                    required
                    pattern=".*"
                />
            </div>
            <div className="grid gap-1.5">
                <Label htmlFor="password">{t("auth.login.password")}</Label>
                <Input id="password" name="password" type="password" required autoComplete="current-password" />
            </div>

            {error ? (
                <Alert role="alert" aria-live="assertive" variant="destructive">
                    <AlertCircle className="size-4" aria-hidden="true" />
                    <AlertTitle>{t("common.error")}</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            ) : null}

            <Button type="submit" disabled={submitting}>
                {submitting ? t("auth.login.submitting") : t("auth.login.submit")}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
                {t("auth.login.noAccount")}{" "}
                <Link
                    href={`${localeHref(locale, "/register")}${redirectTo ? `?redirect=${encodeURIComponent(redirectTo)}` : ""}`}
                    className="text-primary hover:underline"
                >
                    {t("auth.login.signupCta")}
                </Link>
            </p>
        </form>
    );
};
