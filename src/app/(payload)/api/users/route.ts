import configPromise from "@payload-config";
import { getPayload, generatePayloadCookie, headersWithCors } from "payload";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { handleEndpoints } from "payload";

const formatPhoneToE164 = (phone: string): string => {
  try {
    const parsed = parsePhoneNumberFromString(phone, "IR");
    if (parsed?.isValid?.()) return parsed.format("E.164");
    return phone;
  } catch {
    return phone;
  }
};

const delegate = async (request: Request) => {
  return handleEndpoints({
    config: configPromise,
    path: "/users" + (new URL(request.url).search || ""),
    request,
  } as any);
};

const delegateWithSlug = async (request: Request) => {
  const url = new URL(request.url);
  // For /api/users or /api/users/<id> etc., let the catch-all handle it via handleEndpoints
  // Extract the part after /api
  const path = url.pathname.replace(/^\/api/, "") + (url.search || "");
  return handleEndpoints({
    config: configPromise,
    path,
    request,
  } as any);
};

export const GET = async (request: Request) => delegateWithSlug(request);
export const PATCH = async (request: Request) => delegateWithSlug(request);
export const PUT = async (request: Request) => delegateWithSlug(request);
export const DELETE = async (request: Request) => delegateWithSlug(request);
export const OPTIONS = async (request: Request) => delegate(request);

export const POST = async (request: Request) => {
  const contentType = request.headers.get("content-type") || "";
  // Only intercept JSON POST to /api/users (collection create). For other POSTs like /api/users/login, delegate.
  const url = new URL(request.url);
  // This route is only matched for exact /api/users . If path includes /login, /logout etc., delegate.
  if (url.pathname !== "/api/users" && url.pathname !== "/api/users/") {
    return delegateWithSlug(request);
  }
  // If body is not JSON, delegate to default handler (handles other cases)
  if (!contentType.includes("application/json")) {
    return delegateWithSlug(request);
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return delegateWithSlug(request);
  }

  // If body doesn't look like a create (no username), delegate
  if (!body || typeof body.username !== "string" || typeof body.password !== "string") {
    // reconstruct request with body for delegate
    const reqClone = new Request(request.url, {
      method: "POST",
      headers: request.headers,
      body: JSON.stringify(body),
    });
    return handleEndpoints({ config: configPromise, path: "/users", request: reqClone } as any);
  }

  const cfg: any = await configPromise;
  const payload = await getPayload({ config: cfg });
  // Keep original raw username for login (normalize to E.164 like beforeValidate does)
  const rawUsername: string = body.username;
  const normalizedUsername = formatPhoneToE164(rawUsername);
  const password: string = body.password;

  try {
    // Create user via payload local API (triggers beforeValidate/beforeChange hooks, so username will be normalized in DB)
    const doc: any = await (payload as any).create({
      collection: "users",
      data: body,
      depth: 0,
      overrideAccess: false,
    });

    // Try to login to generate token + cookie. Use normalized username (matches stored E.164)
    let token: string | undefined;
    try {
      const loginResult: any = await (payload as any).login({
        collection: "users",
        data: { username: normalizedUsername, password },
        depth: 0,
      });
      token = loginResult?.token;
    } catch (loginErr) {
      // Fallback: try raw username if normalized fails (e.g., invalid number)
      try {
        const loginResult2: any = await (payload as any).login({
          collection: "users",
          data: { username: rawUsername, password },
          depth: 0,
        });
        token = loginResult2?.token;
      } catch {}
      if (!token) {
        // Log but don't fail creation — user is created, session not established
        (payload as any).logger?.error?.({ err: loginErr, msg: "POST /api/users: auto-login failed" });
      }
    }

    const headers = new Headers();
    headers.set("Content-Type", "application/json");

    // Add CORS headers
    const corsHeaders = headersWithCors({ headers, req: { headers: request.headers } as any });
    corsHeaders.forEach((v: string, k: string) => {
      headers.set(k, v);
    });

    if (token) {
      const collectionConfig: any = (payload as any).collections?.["users"]?.config;
      const authConfig = collectionConfig?.auth;
      if (authConfig) {
        const cookie = generatePayloadCookie({
          collectionAuthConfig: authConfig,
          cookiePrefix: (payload as any).config?.cookiePrefix || "payload",
          token,
        });
        headers.set("Set-Cookie", cookie);
      }
    }

    const bodyOut = JSON.stringify({
      doc,
      message: "User successfully created.",
    });

    return new Response(bodyOut, { status: 201, headers });
  } catch (err: any) {
    // Map payload validation errors to same shape as REST
    const status = err?.status || err?.data?.status || 400;
    const payloadErr = err?.data || err;
    // Fallback to handleEndpoints for proper error formatting if available
    // Try to return JSON error similar to REST
    const headers = new Headers({ "Content-Type": "application/json" });
    const corsHeaders2 = headersWithCors({ headers, req: { headers: request.headers } as any });
    corsHeaders2.forEach((v: string, k: string) => {
      headers.set(k, v);
    });
    const message = payloadErr?.message || err?.message || "ValidationError";
    const errors = payloadErr?.errors || [{ message }];
    return new Response(JSON.stringify({ errors: Array.isArray(errors) ? errors : [{ message }], message }), {
      status: typeof status === "number" ? status : 400,
      headers,
    });
  }
};
