import { createRoot, createSignal } from "solid-js";
import { describe, expect, it } from "vitest";
import {
  createChainedI18nContext,
  createChainedI18nDictionary,
  createI18nContext,
} from "../src/index";
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
  it("translate key with dot", async () => {
    const [t, { add, locale }] = createRoot(() => createI18nContext(dict, "en"));
    Object.entries(dict).forEach(([lang, translations]) => add(lang, translations));
    locale("en");
    expect(t("hello.name", { name: "Tester" })).toBe("hello Tester, how are you?");
    expect(t("food.meat")).toBe("meat");
  });
});

describe("createChainedI18nContext", () => {
  it("Context should be null if setContext !== true", async () => {
    const [, useI18nContext] = createRoot(() =>
      createChainedI18nContext({ dictionaries: dict, locale: "en" }, false),
    );

    const context = useI18nContext();

    expect(context).toBe(null);
  });
  it("Context should be set if setContext === true", async () => {
    const [, useI18nContext] = createRoot(() =>
      createChainedI18nContext({ dictionaries: dict, locale: "en" }, true),
    );

    const context = useI18nContext();

    expect(context).not.toBe(null);
  });
  it("Locale switching works", async () => {
    const [, useI18nContext] = createRoot(() =>
      createChainedI18nContext({ dictionaries: dict, locale: "en" }, true),
    );

    const [, { locale, setLocale }] = useI18nContext()!;

    expect(locale()).toBe("en");

    setLocale("fr");
    expect(locale()).toBe("fr");

    setLocale("en");
    expect(locale()).toBe("en");
  });
  it("Translations work", async () => {
    const [, useI18nContext] = createRoot(() =>
      createChainedI18nContext({ dictionaries: dict, locale: "en" }, true),
    );

    const [t, { setLocale }] = useI18nContext()!;

    expect(t.hello({ name: "Tester" })).toBe("hello Tester, how are you?");
    expect(t.goodbye({ name: "Tester" })).toBe("goodbye Tester");
    expect(t.food.meat()).toBe("meat");

    setLocale("fr");
    expect(t.hello({ name: "Tester" })).toBe("bonjour Tester, comment vas-tu ?");
    expect(t.goodbye({ name: "Tester" })).toBe("au revoir Tester");
    expect(t.food.meat()).toBe("viande");
  });
});

describe("createChainedI18nDictionary", () => {
  it("Translations work", async () => {
    const dictionaries = createRoot(() => createChainedI18nDictionary(dict));
    const [locale, setLocale] = createSignal<keyof typeof dict>("en");

    expect(dictionaries[locale()].hello({ name: "Tester" })).toBe("hello Tester, how are you?");
    expect(dictionaries[locale()].goodbye({ name: "Tester" })).toBe("goodbye Tester");
    expect(dictionaries[locale()].food.meat()).toBe("meat");

    setLocale("fr");
    expect(dictionaries[locale()].hello({ name: "Tester" })).toBe(
      "bonjour Tester, comment vas-tu ?",
    );
    expect(dictionaries[locale()].goodbye({ name: "Tester" })).toBe("au revoir Tester");
    expect(dictionaries[locale()].food.meat()).toBe("viande");
  });
});
