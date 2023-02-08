import { createI18nContext } from "../src/index";
import { dict } from "./setup";
import { describe, expect, it } from "vitest";

describe("createI18nContext", () => {
  it("test locale switching", async () => {
    const [t, { add, locale }] = createI18nContext(dict, "en");
    Object.entries(dict).forEach(([lang, translations]) => add(lang, translations));
    locale("en");
    expect(t("hello", { name: "Tester" })).toBe("hello Tester, how are you?");
    locale("fr");
    expect(t("hello", { name: "Tester" })).toBe("bonjour Tester, comment vas-tu ?");
  });
});
