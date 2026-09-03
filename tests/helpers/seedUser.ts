import { getPayload } from "payload";
import config from "../../src/payload.config.js";

export const testUser = {
	password: "test",
	firstName: "Test",
	lastName: "User",
	phone: "09123456789",
	role: "admin" as const,
	customerType: "regular" as const,
};

/**
 * Seeds a test user for e2e admin tests.
 */
export async function seedTestUser(): Promise<void> {
	const payload = await getPayload({ config });

	// Delete existing test user if any
	await payload.delete({
		collection: "users",
		where: {
			phone: {
				equals: testUser.phone,
			},
		},
	});

	// Create fresh test user (the `username` field is auto-populated from `phone`
	// by the Users collection's beforeValidate hook).
	await payload.create({
		collection: "users",
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		data: testUser as any,
		overrideAccess: true,
	});
}

/**
 * Cleans up test user after tests
 */
export async function cleanupTestUser(): Promise<void> {
	const payload = await getPayload({ config });

	await payload.delete({
		collection: "users",
		where: {
			phone: {
				equals: testUser.phone,
			},
		},
	});
}
