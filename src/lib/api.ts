export type ApiFetchOptions = {
	method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
	body?: unknown;
	credentials?: RequestCredentials;
	headers?: Record<string, string>;
};

export async function apiFetch(url: string, opts: ApiFetchOptions = {}): Promise<Response> {
	const { method = "GET", body, credentials = "include", headers = {} } = opts;
	return fetch(url, {
		method,
		credentials,
		headers: body !== undefined ? { "Content-Type": "application/json", ...headers } : headers,
		body: body !== undefined ? JSON.stringify(body) : undefined,
	});
}

export async function parsePayloadError(res: Response, fallback: string): Promise<string> {
	try {
		const data = await res.json();
		return (data?.errors?.[0]?.message as string) || (data?.message as string) || fallback;
	} catch {
		return fallback;
	}
}