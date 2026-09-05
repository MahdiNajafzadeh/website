"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { t } from "@/lib/t";

function RegisterForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const nextParam = searchParams.get("next") || "/";

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [address, setAddress] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        const trimmedPhone = phone.trim();
        if (!firstName.trim() || !lastName.trim()) {
            setError(t("auth.errorRequiredName"));
            return;
        }
        if (!password || password.length < 6) {
            setError(t("auth.errorPassword"));
            return;
        }
        setLoading(true);
        try {
            const createRes = await fetch("/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    firstName: firstName.trim(),
                    lastName: lastName.trim(),
                    phone: trimmedPhone,
                    username: trimmedPhone,
                    password,
                    address: address.trim() || undefined,
                }),
            });
            if (!createRes.ok) {
                const data = await createRes.json().catch(() => ({}));
                const msg =
                    (data?.errors?.[0]?.message as string) || (data?.message as string) || t("auth.registrationFailed");
                throw new Error(msg);
            }
            router.push(nextParam);
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : t("auth.registrationFailed"));
        } finally {
            setLoading(false);
        }
    }

    const inputClass =
        "h-12 w-full rounded-[24px] border border-[#cacacb] bg-white dark:bg-[#1a1a1a] dark:border-[#39393b] dark:text-white px-4 text-base font-normal text-[#111111] placeholder:text-[#9e9ea0] outline-none focus:border-[#111111] focus:ring-2 focus:ring-[#111111]/10 dark:focus:border-white";
    const labelClass = "block text-sm font-medium leading-[1.75] text-[#111111] dark:text-white";
    const textareaClass =
        "min-h-[96px] w-full rounded-[24px] border border-[#cacacb] bg-white dark:bg-[#1a1a1a] dark:border-[#39393b] dark:text-white px-4 py-3 text-base font-normal text-[#111111] placeholder:text-[#9e9ea0] outline-none focus:border-[#111111] focus:ring-2 focus:ring-[#111111]/10 dark:focus:border-white";

    return (
        <div className="min-h-[70vh] flex items-center justify-center bg-white dark:bg-[#111111] px-4 py-10">
            <div className="w-full max-w-[560px]">
                <h1
                    className="text-center text-[32px] font-medium leading-[1.2] text-[#111111] dark:text-white"
                    style={{ fontFamily: "Helvetica Now Display Medium, Helvetica, Arial, sans-serif" }}
                >
                    {t("auth.createAccountTitle")}
                </h1>
                <p className="mt-2 text-center text-sm font-medium text-[#707072] dark:text-[#9e9ea0]">
                    {t("auth.joinHint")}
                </p>

                <form onSubmit={onSubmit} noValidate className="mt-8 space-y-5">
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <div className="space-y-2">
                            <label htmlFor="firstName" className={labelClass}>
                                {t("auth.firstName")} <span className="text-[#d30005]">*</span>
                            </label>
                            <input
                                id="firstName"
                                name="firstName"
                                type="text"
                                required
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                placeholder={t("auth.firstNamePlaceholder")}
                                className={inputClass}
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="lastName" className={labelClass}>
                                {t("auth.lastName")} <span className="text-[#d30005]">*</span>
                            </label>
                            <input
                                id="lastName"
                                name="lastName"
                                type="text"
                                required
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                placeholder={t("auth.lastNamePlaceholder")}
                                className={inputClass}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="phone" className={labelClass}>
                            {t("auth.phone")} <span className="text-[#d30005]">*</span>
                        </label>
                        <input
                            id="phone"
                            name="phone"
                            type="tel"
                            inputMode="numeric"
                            required
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="09123456789"
                            pattern="09[0-9]{9}"
                            className={inputClass}
                        />
                        <p className="text-xs font-medium text-[#707072] dark:text-[#9e9ea0]">
                            {t("auth.mustBe11Digits")}
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="password" className={labelClass}>
                            {t("auth.password")} <span className="text-[#d30005]">*</span>
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="new-password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className={inputClass}
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="address" className={labelClass}>
                            {t("auth.addressOptional")}
                        </label>
                        <textarea
                            id="address"
                            name="address"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder={t("auth.streetHint")}
                            rows={3}
                            className={textareaClass}
                        />
                    </div>

                    {error && (
                        <div
                            role="alert"
                            className="rounded-[12px] border border-[#d30005]/20 bg-[#d30005]/5 px-4 py-3 text-sm font-medium text-[#d30005]"
                        >
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="flex h-12 w-full items-center justify-center rounded-full bg-[#111111] dark:bg-white dark:text-[#111111] px-8 text-base font-medium leading-[1.5] text-white transition-opacity hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {loading ? t("auth.creatingAccount") : t("auth.submitRegister")}
                    </button>

                    <p className="text-center text-sm font-medium text-[#707072] dark:text-[#9e9ea0]">
                        {t("auth.alreadyHaveAccount")}{" "}
                        <Link
                            href={nextParam !== "/" ? `/login?next=${encodeURIComponent(nextParam)}` : "/login"}
                            className="font-medium text-[#111111] dark:text-white underline underline-offset-4"
                        >
                            {t("auth.signInLink")}
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}

export default function RegisterPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-[70vh] flex items-center justify-center bg-white dark:bg-[#111111] px-4 py-10">
                    <p className="text-sm text-[#707072] dark:text-[#9e9ea0]">{t("auth.loading")}</p>
                </div>
            }
        >
            <RegisterForm />
        </Suspense>
    );
}
