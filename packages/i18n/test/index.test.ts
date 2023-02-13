import { createRoot } from "solid-js";
import { describe, expect, it } from "vitest";
import { createI18nContext, makeChainedI18nContext } from "../src/index";
import { dict } from "./setup";

describe("createI18nContext", () => {
  it("test locale switching", async () => {
    const [t, { add, locale }] = createRoot(() => createI18nContext(dict, "en"));
    Object.entries(dict).forEach(([lang, translations]) => add(lang, translations));
    locale("en");
    expect(t("hello", { name: "Tester" })).toBe("hello Tester, how are you?");
    locale("fr");
    expect(t("hello", { name: "Tester" })).toBe("bonjour Tester, comment vas-tu ?");
  });
});

describe("makeChainedI18nContext", () => {
  it("test locale switching", async () => {
    const { useI18nContext } = createRoot(() =>
      makeChainedI18nContext({ dictionaries: dict, locale: "en", setContext: true })
    );

    const [t, { locale, setLocale }] = useI18nContext()!;

    expect(locale()).toBe("en");

    setLocale("fr");
    expect(locale()).toBe("fr");
    expect(t().hello({ name: "Tester" })).toBe("bonjour Tester, comment vas-tu ?");
    expect(t().goodbye({ name: "Tester" })).toBe("au revoir Tester");
    expect(t().food.meat()).toBe("viande");

    setLocale("en");
    expect(t().hello({ name: "Tester" })).toBe("hello Tester, how are you?");
    expect(t().goodbye({ name: "Tester" })).toBe("goodbye Tester");
    expect(locale()).toBe("en");
    expect(t().food.meat()).toBe("meat");
  });
});
