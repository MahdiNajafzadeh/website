import { describe, expect, it } from "vitest";

import { localizedValue } from "@/lib/localized";

describe("localizedValue", () => {
    it("returns string input unchanged", () => {
        expect(localizedValue("hello", "fa")).toBe("hello");
        expect(localizedValue("hello", "en")).toBe("hello");
    });

    it("resolves a JSON-encoded locale object to the active locale", () => {
        const value = '{"en":"Abafarin","fa":"آبفارین"}';

        expect(localizedValue(value, "fa")).toBe("آبفارین");
        expect(localizedValue(value, "en")).toBe("Abafarin");
    });

    it("returns ordinary and malformed JSON strings unchanged", () => {
        expect(localizedValue('{"name":"Abafarin"}', "fa")).toBe('{"name":"Abafarin"}');
        expect(localizedValue("{invalid}", "fa")).toBe("{invalid}");
    });

    it("returns empty string for null/undefined", () => {
        expect(localizedValue(null, "fa")).toBe("");
        expect(localizedValue(undefined, "fa")).toBe("");
    });

    it("stringifies numbers", () => {
        expect(localizedValue(42 as unknown as string, "fa")).toBe("42");
    });

    it("returns empty string for non-object primitives", () => {
        expect(localizedValue(true as unknown as string, "fa")).toBe("");
    });

    it("resolves an object to the active locale", () => {
        expect(localizedValue({ en: "Abafarin", fa: "آبفارین" }, "fa")).toBe("آبفارین");
        expect(localizedValue({ en: "Abafarin", fa: "آبفارین" }, "en")).toBe("Abafarin");
    });

    it("falls back to default locale when active locale is missing", () => {
        expect(localizedValue({ en: "Abafarin" }, "fa")).toBe("Abafarin");
        expect(localizedValue({ fa: "آبفارین" }, "en")).toBe("آبفارین");
    });

    it("skips empty strings when picking the active locale", () => {
        expect(localizedValue({ en: "", fa: "آبفارین" }, "en")).toBe("آبفارین");
    });

    it("returns empty string when nothing resolvable exists", () => {
        expect(localizedValue({}, "fa")).toBe("");
        expect(localizedValue({ en: "", fa: "" }, "fa")).toBe("");
        expect(localizedValue({ en: null, fa: undefined }, "fa")).toBe("");
    });

    it("never throws on unexpected shapes", () => {
        expect(() => localizedValue([] as unknown as string, "fa")).not.toThrow();
        expect(localizedValue([] as unknown as string, "fa")).toBe("");
    });

    it("resolves when only one locale has a value", () => {
        expect(localizedValue({ en: undefined, fa: "آبفارین" }, "en")).toBe("آبفارین");
    });
});
