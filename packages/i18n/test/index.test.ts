import { describe, expect, test } from "vitest";
import * as i18n from "../src/index.js";
import { createEffect, createResource, createRoot, createSignal } from "solid-js";
import { Locale, en_dict, pl_dict } from "./setup.js";

describe("template", () => {
  test("identity template resolver", () => {
    expect(i18n.identityResolveTemplate("hello!")).toBe("hello!");

    expect(i18n.identityResolveTemplate("hello {{name}}!", { name: "Tester" })).toBe(
      "hello {{name}}!",
    );
  });

  test("default template resolver", () => {
    expect(i18n.resolveTemplate("hello!")).toBe("hello!");

    expect(i18n.resolveTemplate("hello {{name}}!", { name: "Tester" })).toBe("hello Tester!");

    expect(i18n.resolveTemplate("hello {{ name }}!", { name: "Tester" })).toBe("hello Tester!");

    expect(
      i18n.resolveTemplate("hello {{name}} and {{extra}}!", { name: "Tester", extra: "John" }),
    ).toBe("hello Tester and John!");

    expect(
      i18n.resolveTemplate("hello {{ name }} and {{ extra }}!", { name: "Tester", extra: "John" }),
    ).toBe("hello Tester and John!");

    expect(i18n.resolveTemplate("hello {{name}} and {{extra}}!")).toBe(
      "hello {{name}} and {{extra}}!",
    );
  });
});

describe("flatDict", () => {
  test("flatDict", () => {
    const flat = i18n.flatten(en_dict);

    expect(flat).toEqual({
      ...en_dict,
      "numbers.1": "one",
      "numbers.2": "two",
      "numbers.3": "three",
      "data.class": en_dict.data.class,
      "data.currency": en_dict.data.currency,
      "data.currency.name": "dollar",
      "data.currency.symbol": "$",
      "data.currency.iso": "USD",
      "data.currency.to.usd": 1,
      "data.users": en_dict.data.users,
      "data.users.0": en_dict.data.users[0],
      "data.users.0.name": "John",
      "data.users.1": en_dict.data.users[1],
      "data.users.1.name": "Kate",
      "data.formatList": en_dict.data.formatList,
    } satisfies typeof flat);
  });
});

describe("translator", () => {
  let flat_dict = i18n.flatten(en_dict);

  const t = i18n.translator(() => flat_dict, i18n.resolveTemplate);

  test("initial", () => {
    expect(t("hello", { name: "Tester", thing: "day" })).toBe("Hello Tester! How is your day?");
    expect(t("numbers.1")).toBe("one");
    expect(t("data.class")).toBe(en_dict.data.class);
    expect(t("data.currency.name")).toBe("dollar");
    expect(t("data.currency.to.usd")).toBe(1);
    expect(t("data.users")).toEqual(en_dict.data.users);
    expect(t("data.formatList", ["John", "Kate", "Tester"])).toBe("John, Kate and Tester");
  });

  test("after change", () => {
    flat_dict = i18n.flatten(pl_dict);

    expect(t("hello", { name: "Tester", thing: "dzień" })).toBe("Cześć Tester!");
    expect(t("numbers.1")).toBe("jeden");
    expect(t("data.class")).toBe(pl_dict.data.class);
    expect(t("data.currency.name")).toBe("złoty");
    expect(t("data.currency.to.usd")).toBe(0.27);
    expect(t("data.users")).toEqual(pl_dict.data.users);
    expect(t("data.formatList", ["John", "Kate", "Tester"])).toBe("John, Kate i Tester");
  });
});

describe("scopedTranslator", () => {
  let flat_dict = i18n.flatten(en_dict);

  const _t = i18n.translator(() => flat_dict, i18n.resolveTemplate);
  const t = i18n.scopedTranslator(_t, "data");

  test("initial", () => {
    expect(t("class")).toBe(en_dict.data.class);
    expect(t("currency.name")).toBe("dollar");
    expect(t("currency.to.usd")).toBe(1);
    expect(t("users")).toEqual(en_dict.data.users);
    expect(t("formatList", ["John", "Kate", "Tester"])).toBe("John, Kate and Tester");
  });

  test("after change", () => {
    flat_dict = i18n.flatten(pl_dict);

    expect(t("class")).toBe(pl_dict.data.class);
    expect(t("currency.name")).toBe("złoty");
    expect(t("currency.to.usd")).toBe(0.27);
    expect(t("users")).toEqual(pl_dict.data.users);
    expect(t("formatList", ["John", "Kate", "Tester"])).toBe("John, Kate i Tester");
  });
});

describe("chainedResolver", () => {
  let flat_dict = i18n.flatten(en_dict);

  const t = i18n.translator(() => flat_dict, i18n.resolveTemplate);

  const chained = i18n.chainedTranslator(en_dict, t);

  test("initial", () => {
    expect(chained.hello({ name: "Tester", thing: "day" })).toBe("Hello Tester! How is your day?");
    expect(chained.numbers[1]()).toBe("one");
    expect(chained.data.class()).toBe(en_dict.data.class);
    expect(chained.data.currency.name()).toBe("dollar");
    expect(chained.data.currency["to.usd"]()).toBe(1);
    expect(chained.data.users()).toEqual(en_dict.data.users);
    expect(chained.data.formatList(["John", "Kate", "Tester"])).toBe("John, Kate and Tester");
  });

  test("after change", () => {
    flat_dict = i18n.flatten(pl_dict);

    expect(chained.hello({ name: "Tester", thing: "dzień" })).toBe("Cześć Tester!");
    expect(chained.numbers[1]()).toBe("jeden");
    expect(chained.data.class()).toBe(pl_dict.data.class);
    expect(chained.data.currency.name()).toBe("złoty");
    expect(chained.data.currency["to.usd"]()).toBe(0.27);
    expect(chained.data.users()).toEqual(pl_dict.data.users);
    expect(chained.data.formatList(["John", "Kate", "Tester"])).toBe("John, Kate i Tester");
  });
});

describe("reactive", () => {
  test("with translator", async () => {
    const [locale, setLocale] = createSignal<Locale>("en");
    let hello = "";
    let to_usd = 0;

    const dispose = createRoot(dispose => {
      const [dict] = createResource(
        locale,
        async locale => {
          const dict = locale === "en" ? en_dict : pl_dict;
          return i18n.flatten(dict);
        },
        { initialValue: i18n.flatten(en_dict) },
      );

      const t = i18n.translator(dict, i18n.resolveTemplate);
      const chained = i18n.chainedTranslator(en_dict, t);

      createEffect(() => {
        hello = t("hello", { name: "Tester", thing: "day" });
        to_usd = chained.data.currency["to.usd"]();
      });

      return dispose;
    });

    expect(hello).toBe("Hello Tester! How is your day?");
    expect(to_usd).toBe(1);

    setLocale("pl");
    await Promise.resolve();
    expect(hello).toBe("Cześć Tester!");
    expect(to_usd).toBe(0.27);

    dispose();
  });
});
