import "server-only";

import { cookies as getCookies } from "next/headers";
import { generatePayloadCookie } from "payload";

type CollectionAuthConfig = Parameters<typeof generatePayloadCookie>[0]["collectionAuthConfig"];

// ponytail: small reimplementation of the (private) Payload cookie setter so
// our /api/auth/phone-login route can set the standard auth cookie after a
// successful local-API login. The reference implementation lives at
// @payloadcms/next/dist/utilities/setPayloadAuthCookie.js but is not
// re-exported from the public subpath exports.
export const setAuthCookie = async ({
    authConfig,
    cookiePrefix,
    token,
}: {
    authConfig: CollectionAuthConfig;
    cookiePrefix: string;
    token: string;
}): Promise<void> => {
    const cookies = await getCookies();
    const cookieExpiration = authConfig.tokenExpiration ? new Date(Date.now() + authConfig.tokenExpiration) : undefined;
    const payloadCookie = generatePayloadCookie({
        collectionAuthConfig: authConfig,
        cookiePrefix,
        expires: cookieExpiration,
        returnCookieAsObject: true,
        token,
    });
    if (!payloadCookie.value) return;
    const sameSiteRaw = authConfig.cookies?.sameSite;
    const sameSite: "lax" | "strict" | "none" =
        typeof sameSiteRaw === "string" ? (sameSiteRaw.toLowerCase() as "lax" | "strict" | "none") : "lax";
    const opts: {
        domain?: string;
        expires?: Date;
        httpOnly: boolean;
        sameSite: "lax" | "strict" | "none";
        secure: boolean;
    } = {
        httpOnly: true,
        sameSite,
        secure: Boolean(authConfig.cookies?.secure),
    };
    if (authConfig.cookies?.domain) opts.domain = authConfig.cookies.domain;
    if (payloadCookie.expires) opts.expires = new Date(payloadCookie.expires);
    cookies.set(payloadCookie.name, payloadCookie.value, opts);
};
