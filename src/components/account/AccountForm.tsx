"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { formatIranPhone } from "@/lib/phone";
import { t } from "@/lib/t";

type Props = {
	userId: number;
	initialFirstName: string;
	initialLastName: string;
	initialPhone: string;
	initialAddress: string;
};

export function AccountForm({ userId, initialFirstName, initialLastName, initialPhone, initialAddress }: Props) {
	const router = useRouter();
	const [mounted, setMounted] = useState(false);
	const [firstName, setFirstName] = useState(initialFirstName);
	const [lastName, setLastName] = useState(initialLastName);
	const [address, setAddress] = useState(initialAddress);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);
	const [isPending, startTransition] = useTransition();

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return (
			<div className="rounded-[18px] border border-[#cacacb] bg-white p-6 text-[14px] font-medium text-[#707072]">
				{t("account.form.loading")}
			</div>
		);
	}

	const onSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setSuccess(false);
		if (!firstName.trim() || !lastName.trim()) {
			setError(t("account.form.errorRequiredName"));
			return;
		}
		startTransition(async () => {
			try {
				const res = await fetch(`/api/users/${userId}`, {
					method: "PATCH",
					credentials: "include",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						firstName: firstName.trim(),
						lastName: lastName.trim(),
						address: address.trim(),
					}),
				});
				if (!res.ok) {
					const txt = await res.text().catch(() => "");
					throw new Error(txt || t("account.form.updateFailedWithStatus", { status: String(res.status) }));
				}
				setSuccess(true);
				startTransition(() => router.refresh());
			} catch (err) {
				const msg = err instanceof Error ? err.message : t("account.form.updateFailed");
				setError(msg);
			}
		});
	};

	return (
		<form onSubmit={onSubmit} className="space-y-5 rounded-[18px] border border-[#cacacb] bg-white p-6">
			<div className="grid gap-4 sm:grid-cols-2">
				<div className="space-y-1.5">
					<label
						htmlFor="firstName"
						className="text-[12px] font-medium uppercase tracking-wide text-[#707072]"
					>
						{t("account.form.firstName")}
					</label>
					<input
						id="firstName"
						type="text"
						required
						value={firstName}
						onChange={(e) => setFirstName(e.target.value)}
						className="h-11 w-full rounded-[18px] border border-[#cacacb] bg-white px-4 text-[14px] leading-[1.5] text-[#111111] focus:border-[#111111] focus:outline-none"
					/>
				</div>
				<div className="space-y-1.5">
					<label
						htmlFor="lastName"
						className="text-[12px] font-medium uppercase tracking-wide text-[#707072]"
					>
						{t("account.form.lastName")}
					</label>
					<input
						id="lastName"
						type="text"
						required
						value={lastName}
						onChange={(e) => setLastName(e.target.value)}
						className="h-11 w-full rounded-[18px] border border-[#cacacb] bg-white px-4 text-[14px] leading-[1.5] text-[#111111] focus:border-[#111111] focus:outline-none"
					/>
				</div>
			</div>

			{/* Phone — read-only — {colors.mute} #707072 */}
			<div className="space-y-1.5">
				<label htmlFor="phone" className="text-[12px] font-medium uppercase tracking-wide text-[#707072]">
					{t("account.form.phone")}
				</label>
				<input
					id="phone"
					type="text"
					readOnly
					aria-readonly
					value={formatIranPhone(initialPhone)}
					className="h-11 w-full cursor-not-allowed rounded-[18px] border border-[#cacacb] bg-[#f5f5f5] px-4 text-[14px] leading-[1.5] text-[#707072] focus:outline-none"
				/>
				<p className="text-[12px] font-medium text-[#707072]">
					{t("account.form.phoneHint")}
				</p>
			</div>

			<div className="space-y-1.5">
				<label htmlFor="address" className="text-[12px] font-medium uppercase tracking-wide text-[#707072]">
					{t("account.form.shippingAddress")}
				</label>
				<textarea
					id="address"
					rows={4}
					value={address}
					onChange={(e) => setAddress(e.target.value)}
					placeholder={t("account.form.shippingAddressPlaceholder")}
					className="w-full rounded-[18px] border border-[#cacacb] bg-white p-3 text-[14px] leading-[1.5] text-[#111111] focus:border-[#111111] focus:outline-none"
				/>
			</div>

			{error ? (
				<p
					role="alert"
					className="rounded-[18px] border border-[#d30005]/30 bg-[#d30005]/5 p-3 text-[14px] font-medium text-[#d30005]"
				>
					{error}
				</p>
			) : null}
			{success ? (
				<p
					role="status"
					className="rounded-[18px] border border-[#007d48]/30 bg-[#007d48]/5 p-3 text-[14px] font-medium text-[#007d48]"
				>
					{t("account.form.profileUpdated")}
				</p>
			) : null}

			<Button
				type="submit"
				disabled={isPending}
				className="h-12 w-full rounded-full bg-[#111111] text-[16px] font-medium leading-[1.5] text-white hover:opacity-90 sm:w-auto sm:px-8"
			>
				{isPending ? t("account.form.saving") : t("account.form.saveChanges")}
			</Button>
		</form>
	);
}
