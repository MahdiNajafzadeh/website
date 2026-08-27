import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { getPayload } from "payload";

import { setAuthCookie } from "@/lib/auth-cookie";
import config from "@payload-config";

const digitsOf = (s: string): string => String(s ?? "").replace(/\D+/g, "");
const isValidPhone = (s: string): boolean => digitsOf(s).length === 11;

// ponytail: ceiling is plain random 12-char base36 password. Sufficient for
// "first login show credentials once" flow. We return the plaintext in the
// response so the success page can show it once. The user is expected to
// change it after first login.
const generatePassword = (): string => crypto.randomBytes(12).toString("base64").replace(/[+/=]/g, "").slice(0, 12);

type IncomingAddress = {
    fullName?: string;
    phone?: string;
    address?: string;
    city?: string;
    province?: string;
    label?: string;
    isPrimary?: boolean;
};

export const POST = async (request: Request): Promise<Response> => {
    let body: {
        firstName?: unknown;
        lastName?: unknown;
        phone?: unknown;
        email?: unknown;
        addresses?: unknown;
    };
    try {
        body = (await request.json()) as typeof body;
    } catch {
        return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
    }

    const firstName = typeof body.firstName === "string" ? body.firstName.trim() : "";
    const lastName = typeof body.lastName === "string" ? body.lastName.trim() : "";
    const phoneRaw = typeof body.phone === "string" ? body.phone.trim() : "";
    const emailRaw = typeof body.email === "string" ? body.email.trim() : "";
    const addresses = Array.isArray(body.addresses) ? (body.addresses as IncomingAddress[]) : [];

    if (!firstName || !lastName) {
        return NextResponse.json({ message: "نام و نام خانوادگی الزامی است." }, { status: 400 });
    }
    if (!isValidPhone(phoneRaw)) {
        return NextResponse.json({ message: "شماره موبایل نامعتبر است (باید ۱۱ رقم باشد)." }, { status: 400 });
    }
    const phoneDigits = digitsOf(phoneRaw);

    const payload = await getPayload({ config });

    const existing = await payload.find({
        collection: "users",
        where: { phone: { equals: phoneDigits } },
        limit: 1,
        overrideAccess: true,
        depth: 0,
    });
    if (existing.docs[0]) {
        return NextResponse.json({ message: "این شماره موبایل قبلاً ثبت شده است." }, { status: 409 });
    }

    const password = generatePassword();
    const synthesizedEmail = `${phoneDigits}@phone.local`;
    const finalEmail = emailRaw ? emailRaw : synthesizedEmail;

    const user = await payload.create({
        collection: "users",
        data: {
            firstName,
            lastName,
            phone: phoneDigits,
            email: finalEmail,
            password,
            role: "customer",
            addresses: addresses
                .filter((a) => a && a.address && a.city && a.fullName && a.phone)
                .map((a) => ({
                    label: a.label ?? "منزل",
                    fullName: String(a.fullName),
                    phone: String(a.phone),
                    address: String(a.address),
                    city: String(a.city),
                    province: String(a.province ?? ""),
                    default: Boolean(a.isPrimary),
                })),
        },
        overrideAccess: true,
    });

    const loginResult = await payload.login({
        collection: "users",
        data: { email: finalEmail, password },
    });

    if (loginResult.token) {
        const collectionConfig = payload.collections["users"]?.config;
        if (collectionConfig) {
            await setAuthCookie({
                authConfig: collectionConfig.auth,
                cookiePrefix: payload.config.cookiePrefix,
                token: loginResult.token,
            });
        }
    }

    return NextResponse.json({
        user: {
            id: user.id,
            phone: phoneDigits,
        },
        password,
    });
};
