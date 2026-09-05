import type { Payload } from "payload";
import { getPayload } from "payload";
import config from "@payload-config";

let _payload: Promise<Payload> | null = null;

export function getPayloadClient(): Promise<Payload> {
	if (!_payload) {
		_payload = (async () => {
			const payloadConfig = await config;
			return getPayload({ config: payloadConfig });
		})();
	}
	return _payload;
}