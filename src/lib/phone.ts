const IRAN_PHONE_REGEX = /^09\d{9}$/;

export function isValidIranPhone(value: string): boolean {
	return IRAN_PHONE_REGEX.test(value);
}

export function formatIranPhone(value: string): string {
	if (!IRAN_PHONE_REGEX.test(value)) return value;
	return `${value.slice(0, 4)} ${value.slice(4, 7)} ${value.slice(7)}`;
}